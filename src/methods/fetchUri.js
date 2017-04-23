'use strict'

const have = require('../have')
const getResponseError = require('../getResponseError')
const errorsHttp = require('../errorsHttp')

module.exports = async function fetchUri (uri, options = {}) {
  have.strict(arguments, { uri: 'str', options: 'opt Object' })

  // Специфические параметры (не передаются в опции fetch)
  let includeHeaders = false
  let muteErrors = false
  let emit = this.emitter ? this.emitter.emit.bind(this.emitter) : null

  let fetchOptions = Object.assign({}, {
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    redirect: 'manual'
  }, options)

  if (fetchOptions.includeHeaders) {
    includeHeaders = true
    delete fetchOptions.includeHeaders
  }
  if (fetchOptions.muteErrors) {
    muteErrors = true
    delete fetchOptions.muteErrors
  }

  let authHeader = this.getAuthHeader()
  if (authHeader) {
    fetchOptions.headers.Authorization = this.getAuthHeader()
  }

  if (emit) emit('request:start', { uri, options: fetchOptions })
  /** @type {Response} */
  let response = await this.fetch(uri, fetchOptions)

  let contentType, responseJson, error

  if (emit) emit('response:head', { uri, options: fetchOptions, response })
  if (response.headers.has('Content-Type')) {
    contentType = response.headers.get('Content-Type')
  }

  if (contentType && contentType.indexOf('application/json') !== -1) {
    // получение ответа сервера и обработка ошибок API
    responseJson = await response.json()
    if (emit) emit('response:body', { uri, options: fetchOptions, response, body: responseJson })
    error = getResponseError(responseJson)
  } else if (!response.ok) {
    // обработка ошибок http
    error = errorsHttp[response.status.toString()]
    error = new Error(error || `Http error: ${response.status} ${response.statusText}`)
  }

  if (error) {
    if (emit) emit('error', error)
    if (!muteErrors) throw error
  }

  return includeHeaders ? [response.headers, responseJson, response] : responseJson
}
