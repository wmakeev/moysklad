'use strict'

const have = require('../have')
const getResponseError = require('../getResponseError')
const {
  MoyskladRequestError,
  MoyskladApiError,
  MoyskladCollectionError,
  MoyskladUnexpectedRedirectError
} = require('../errors')

let globalRequestId = 0

module.exports = async function fetchUrl(url, options = {}) {
  const requestId = ++globalRequestId

  have.strict(arguments, { url: 'url', options: 'opt Object' })

  let result, error

  // Специфические параметры (не передаются в опции fetch)
  let rawResponse = false
  let rawRedirect = false
  let muteApiErrors = false
  let muteCollectionErrors = false

  const emit = this.emitter ? this.emitter.emit.bind(this.emitter) : null

  const fetchOptions = {
    redirect: 'manual',
    ...options,
    headers: {
      'User-Agent': this.getOptions().userAgent,
      'Content-Type': 'application/json',
      'Accept-Encoding': 'gzip',
      ...options.headers
    }
  }

  if (!fetchOptions.headers.Authorization) {
    fetchOptions.credentials = 'include'
  }

  // получаем специфичные параметры
  if (fetchOptions.rawResponse) {
    rawResponse = true
    delete fetchOptions.rawResponse
  }
  if (fetchOptions.rawRedirect) {
    rawRedirect = true
    delete fetchOptions.rawRedirect
  }
  if (/* depricated */ fetchOptions.muteErrors) {
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
  if (fetchOptions.downloadExpirationSeconds) {
    fetchOptions.headers['X-Lognex-Download-Expiration-Seconds'] = String(
      fetchOptions.downloadExpirationSeconds
    )
    delete fetchOptions.downloadExpirationSeconds
  }

  const authHeader = this.getAuthHeader()
  if (authHeader) {
    fetchOptions.headers.Authorization = this.getAuthHeader()
  }

  if (emit) emit('request', { requestId, url, options: fetchOptions })

  /** @type {Response} */
  const response = await this.fetch(url, fetchOptions)

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

    if (resBodyText) {
      result = JSON.parse(resBodyText)
    } else {
      result = undefined
    }

    error = getResponseError(result, response) || error
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
      return result
    }

    if (error instanceof MoyskladCollectionError && muteCollectionErrors) {
      return result
    }

    if (emit) emit('error', error, { requestId })
    throw error
  }

  return result
}
