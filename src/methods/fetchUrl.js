'use strict'

const have = require('../have')
const getResponseError = require('../getResponseError')
const {
  MoyskladError,
  MoyskladRequestError,
  MoyskladApiError,
  MoyskladCollectionError,
  MoyskladUnexpectedRedirectError
} = require('../errors')

let globalRequestId = 0

function createFetchThunk(ctx, url, options = {}) {
  have.strict(arguments, { ctx: 'Object', url: 'url', options: 'opt Object' })

  return async () => {
    const requestId = ++globalRequestId

    let result, error

    // Специфические параметры (не передаются в опции fetch)
    let rawResponse = false
    let rawRedirect = false
    let includeResponse = false
    let muteApiErrors = false
    let muteCollectionErrors = false

    const emit = ctx.emitter ? ctx.emitter.emit.bind(ctx.emitter) : null

    const fetchOptions = {
      redirect: 'manual',
      ...options,
      headers: {
        'User-Agent': ctx.getOptions().userAgent,
        'Content-Type': 'application/json',
        'Accept-Encoding': 'gzip',
        ...options.headers
      }
    }

    if (!fetchOptions.headers.Authorization) {
      fetchOptions.credentials = 'include'
    }

    // получаем специфичные параметры
    if (fetchOptions.includeResponse) {
      includeResponse = true
      delete fetchOptions.includeResponse
    }
    if (fetchOptions.rawResponse) {
      if (includeResponse) {
        throw new MoyskladError(
          'Опция запроса "rawResponse" несовместима с опцией "includeResponse"'
        )
      }
      rawResponse = true
      delete fetchOptions.rawResponse
    }
    if (fetchOptions.rawRedirect) {
      if (includeResponse) {
        throw new MoyskladError(
          'Опция запроса "rawRedirect" несовместима с опцией "includeResponse"'
        )
      }
      rawRedirect = true
      delete fetchOptions.rawRedirect
    }
    if (/* deprecated */ fetchOptions.muteErrors) {
      muteApiErrors = true
      delete fetchOptions.muteErrors
    }
    if (fetchOptions.muteApiErrors) {
      muteApiErrors = true
      delete fetchOptions.muteApiErrors
    }
    if (fetchOptions.muteCollectionErrors) {
      muteCollectionErrors = true
      delete fetchOptions.muteCollectionErrors
    }

    // X-Lognex
    if (fetchOptions.precision) {
      fetchOptions.headers['X-Lognex-Precision'] = 'true'
      delete fetchOptions.precision
    }
    if (fetchOptions.webHookDisable) {
      fetchOptions.headers['X-Lognex-WebHook-Disable'] = 'true'
      delete fetchOptions.webHookDisable
    }
    if (typeof fetchOptions.webHookDisableByPrefix === 'string') {
      fetchOptions.headers['X-Lognex-WebHook-DisableByPrefix'] =
        fetchOptions.webHookDisableByPrefix
      delete fetchOptions.webHookDisableByPrefix
    }
    if (fetchOptions.downloadExpirationSeconds) {
      fetchOptions.headers['X-Lognex-Download-Expiration-Seconds'] = String(
        fetchOptions.downloadExpirationSeconds
      )
      delete fetchOptions.downloadExpirationSeconds
    }

    const authHeader = ctx.getAuthHeader()
    if (authHeader) {
      fetchOptions.headers.Authorization = ctx.getAuthHeader()
    }

    if (emit) emit('request', { requestId, url, options: fetchOptions })

    /** @type {Response} */
    const response = await ctx.fetch(url, fetchOptions)

    if (emit)
      emit('response', { requestId, url, options: fetchOptions, response })

    if (rawResponse) return response

    if (response.status >= 300 && response.status < 400) {
      if (rawRedirect) {
        return response
      } else {
        throw new MoyskladUnexpectedRedirectError(response)
      }
    }

    // response.ok → response.status >= 200 && response.status < 300
    if (response.status < 200 || response.status >= 300) {
      error = new MoyskladRequestError(
        [response.status, response.statusText].filter(it => it).join(' '),
        response
      )
    }

    // разбираем тело запроса
    if (
      response.headers.has('Content-Type') &&
      response.headers.get('Content-Type').indexOf('application/json') !== -1
    ) {
      // response.json() может вызвать ошибку, если тело ответа пустое
      const resBodyText = await response.text()

      try {
        if (resBodyText) {
          result = JSON.parse(resBodyText)
        } else {
          result = undefined
        }

        error = getResponseError(result, response) || error
      } catch (err) {
        // для обработки ошибки в JSON.parse
        error = new MoyskladRequestError(
          'Некорректный JSON в теле ответа - ' + err.message,
          response,
          { cause: err }
        )
      }
    }

    if (emit) {
      emit('response:body', {
        requestId,
        url,
        options: fetchOptions,
        response,
        body: result
      })
    }

    if (error) {
      if (error instanceof MoyskladApiError && muteApiErrors) {
        return includeResponse ? [result, response] : result
      }

      if (error instanceof MoyskladCollectionError && muteCollectionErrors) {
        return includeResponse ? [result, response] : result
      }

      if (emit) emit('error', error, { requestId })
      throw error
    }

    return includeResponse ? [result, response] : result
  }
}

module.exports = async function fetchUrl(url, options = {}) {
  return this.retry(
    createFetchThunk(this, url, options),
    options ? options.signal : undefined
  )
}
