'use strict'

const defaultsDeep = require('lodash.defaultsdeep')

const have = require('../have')
const getResponseError = require('../getResponseError')

module.exports = async function fetchUrl (uri, options = {}) {
  have.strict(arguments, { url: 'url', options: 'opt Object' })

  let resBodyJson, error

  // Специфические параметры (не передаются в опции fetch)
  let rawResponse = false
  let muteErrors = false

  let emit = this.emitter ? this.emitter.emit.bind(this.emitter) : null

  let fetchOptions = defaultsDeep({ ...options }, {
    headers: {
      'Content-Type': 'application/json'
    },
    redirect: 'manual'
  })

  if (!fetchOptions.headers.Authorization) {
    fetchOptions.credentials = 'include'
  }

  // получаем специфичные параметры
  if (fetchOptions.rawResponse) {
    rawResponse = true
    delete fetchOptions.rawResponse
  }
  if (fetchOptions.muteErrors) {
    muteErrors = true
    delete fetchOptions.muteErrors
  }
  if (fetchOptions.millisecond) {
    fetchOptions.headers['X-Lognex-Format-Millisecond'] = 'true'
    delete fetchOptions.millisecond
  }

  let authHeader = this.getAuthHeader()
  if (authHeader) {
    fetchOptions.headers.Authorization = this.getAuthHeader()
  }

  if (emit) emit('request', { uri, options: fetchOptions })

  /** @type {Response} */
  let response = await this.fetch(uri, fetchOptions)

  if (emit) emit('response', { uri, options: fetchOptions, response })

  if (rawResponse && muteErrors) return response

  if (!response.ok) {
    error = new Error(`${response.status} ${response.statusText}`)
  } else if (rawResponse) {
    return response
  }

  // разбираем тело запроса
  if (
    response.headers.has('Content-Type') &&
    response.headers.get('Content-Type').indexOf('application/json') !== -1
  ) {
    // response.json() может вызвать ошибку, если тело ответа пустое
    try {
      resBodyJson = await response.json()
    } catch (e) {}

    if (emit) emit('response:body', { uri, options: fetchOptions, response, body: resBodyJson })
    error = getResponseError(resBodyJson) || error
  }

  if (error && !muteErrors) {
    if (emit) emit('error', error)
    throw error
  }

  return rawResponse ? response : resBodyJson
}
