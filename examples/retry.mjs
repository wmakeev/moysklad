import Moysklad from 'moysklad'
import { wrapFetch } from 'moysklad-fetch-planner'
import pRetry from 'p-retry'
import { fetch } from 'undici'

/**
 * Пример настройки клиента для API МойСклад.
 *
 * 1. Подключается планировщик запросов `moysklad-fetch-planner` для автоматического
 * контроля за лимитами для предотвращения возникновения ошибки `429 Too Many Request`.
 *
 * 2. Подключается механизм повтора ошибочных запросов для случаев когда ошибка
 * могла быть вызвана временными неполадками в процессе выполнения запроса (для
 * примера используется npm библиотека `p-retry`).
 */
const ms = Moysklad({
  fetch: wrapFetch(fetch),
  retry: (thunk, signal) => {
    return pRetry(thunk, {
      retries: 2,
      shouldRetry: Moysklad.shouldRetryError,
      onFailedAttempt: error => {
        console.log(
          `Attempt ${error.attemptNumber} failed. There are ${error.retriesLeft} retries left.`
        )
      },
      signal
    })
  }
})

try {
  // Запрос с ошибкой в url-запроса повторяться не будет, если API МойСклад
  // вернул об этом сообщение.
  await ms.GET('foo')
  // ↳ Attempt 1 failed. There are 2 retries left.
} catch (err) {
  console.log(err)
  // ↳ MoyskladApiError: Неопознанный путь: https://api.moysklad.ru/api/remap/1.2/foo (https://dev.moysklad.ru/doc/api/remap/1.2/#error_1002)
}

try {
  // Запрос с ошибкой которая имеет HTTP код `503` (в том числе, и другие коды
  // `5xx`) будет повторяться. Т.к. подобная ошибка иногда может быть вызвана
  // временными сбоями на стороне сервера API МойСклад.
  await ms.fetchUrl(
    'https://api.moysklad.ru/api/remap/1.0/entity/customerorder'
  )
  // ↳ Attempt 1 failed. There are 2 retries left.
  // ↳ Attempt 2 failed. There are 1 retries left.
  // ↳ Attempt 3 failed. There are 0 retries left.
} catch (err) {
  console.log(err)
  // ↳ MoyskladRequestError: 503 Service Unavailable
}

try {
  // Запрос с ошибкой которая имеет код `ENOTFOUND` (и ряд других) будет
  // повторяться. Т.к. такая ошибка иногда может быть вызвана сбоями в процессе
  // HTTP соединения.
  await ms.fetchUrl('https://example')
  // ↳ Attempt 1 failed. There are 2 retries left.
  // ↳ Attempt 2 failed. There are 1 retries left.
  // ↳ Attempt 3 failed. There are 0 retries left.
} catch (err) {
  console.log(err)
  // ↳ TypeError: fetch failed
}

// Запросы вызвавшие ошибки с кодами 429 обрабатываются и повторяются внутри
// планировщика. При подключении планировщика обрабатывать в `retry` такие
// ошибки не нужно.
