'use strict'

const { MoyskladRequestError } = require('./errors.js')

const objectToString = Object.prototype.toString

const isError = value => objectToString.call(value) === '[object Error]'

// https://dev.moysklad.ru/doc/api/remap/1.2/#mojsklad-json-api-obschie-swedeniq-obrabotka-oshibok
const RETRYABLE_STATUS_CODES_SET = new Set([500, 502, 503, 504])

// https://github.com/sindresorhus/is-network-error/blob/main/index.js#L5
const RETRYABLE_ERROR_MESSAGES_SET = new Set(['fetch failed', 'terminated'])

// https://github.com/nodejs/undici/blob/main/lib/handler/retry-handler.js#L50
const RETRYABLE_ERROR_CODES_SET = new Set([
  'ECONNRESET',
  'ECONNREFUSED',
  'ENOTFOUND',
  'ENETDOWN',
  'ENETUNREACH',
  'EHOSTDOWN',
  'EHOSTUNREACH',
  'EPIPE',
  'UND_ERR_SOCKET',
  'EAI_AGAIN' // Node.js 18
])

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
    RETRYABLE_STATUS_CODES_SET.has(error.status)
  ) {
    return true
  }

  if (
    checkErrWithCauseChain(
      error,
      err =>
        isError(err) &&
        // Ошибки HTTP-запроса
        ((err.name === 'TypeError' &&
          RETRYABLE_ERROR_MESSAGES_SET.has(err.message)) ||
          ('code' in err && RETRYABLE_ERROR_CODES_SET.has(err.code)))
    )
  ) {
    return true
  }

  return false
}

module.exports = shouldRetryError
