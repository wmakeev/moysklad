'use strict'

const { MoyskladRequestError } = require('./errors.js')

// https://dev.moysklad.ru/doc/api/remap/1.2/#mojsklad-json-api-obschie-swedeniq-obrabotka-oshibok
const RETRYABLE_STATUS_CODES = [500, 502, 503, 504]

// https://github.com/nodejs/undici/blob/main/lib/handler/retry-handler.js#L50
const RETRYABLE_ERROR_CODES = [
  'ECONNRESET',
  'ECONNREFUSED',
  'ENOTFOUND',
  'ENETDOWN',
  'ENETUNREACH',
  'EHOSTDOWN',
  'EHOSTUNREACH',
  'EPIPE',
  'UND_ERR_SOCKET'
]

/**
 * @param {unknown} err
 * @param {(err: unknown) => boolean} check
 * @param {number} [depth]
 */
const checkErrWithCauseChain = (err, check, depth = 0) => {
  // prevent loops
  if (depth > 50) return false

  if (check(err)) return true

  const cause = err.cause

  if (cause == null || typeof cause !== 'object') return false

  return checkErrWithCauseChain(cause, check, depth++)
}

/**
 * Вспомогательная функция, которую можно использовать в реализации логики
 * повторения запросов при возникновении ошибки.
 *
 * Возвращает:
 *
 * - `true` - причина ошибка, скорее всего, вызвана временными неполадками,
 * поэтому запрос можно повторить.
 *
 * - `false` - запрос содержит ошибку, повторять запрос нецелесообразно.
 *
 * @param {Error} error Объект ошибки
 * @returns {boolean} `true` - если следует сделать повторную попытку, иначе `false`
 */
function shouldRetryError(error) {
  // Повторяем в случае HTTP ошибок с кодом 5xx
  if (
    error instanceof MoyskladRequestError &&
    RETRYABLE_STATUS_CODES.includes(error.status)
  ) {
    return true
  }

  if (
    checkErrWithCauseChain(
      error,
      err =>
        err instanceof Error &&
        'code' in err &&
        RETRYABLE_ERROR_CODES.includes(err.code)
    )
  ) {
    return true
  }

  // Сервер оборвал соединение на этапе получения тела сообщения
  if (
    checkErrWithCauseChain(
      error,
      err => err instanceof TypeError && err.message === 'terminated'
    )
  ) {
    return true
  }

  return false
}

module.exports = shouldRetryError
