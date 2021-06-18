'use strict'

const defaultsDeep = require('lodash.defaultsdeep')

const have = require('../have')
const getResponseError = require('../getResponseError')
const { MoyskladRequestError } = require('../errors')

module.exports = async function fetchUrl (url, options = {}) {
  have.strict(arguments, { url: 'url', options: 'opt Object' })

  let resBodyJson, error

  // Специфические параметры (не передаются в опции fetch)
  let rawResponse = false
  let muteErrors = false

  const emit = this.emitter ? this.emitter.emit.bind(this.emitter) : null

  const fetchOptions = defaultsDeep(
    {
      headers: {
        'User-Agent': this.getOptions().userAgent
      }
    },
    { ...options },
    {
      headers: {
        'Content-Type': 'application/json'
      },
      redirect: 'manual'
    }
  )

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

  // X-Lognex
  if (fetchOptions.millisecond) {
    fetchOptions.headers['X-Lognex-Format-Millisecond'] = 'true'
    delete fetchOptions.millisecond
  }
  if (fetchOptions.precision) {
    fetchOptions.headers['X-Lognex-Precision'] = 'true'
    delete fetchOptions.precision
  }
  if (fetchOptions.webHookDisable) {
    fetchOptions.headers['X-Lognex-WebHook-Disable'] = 'true'
    delete fetchOptions.webHookDisable
  }

  const authHeader = this.getAuthHeader()
  if (authHeader) {
    fetchOptions.headers.Authorization = this.getAuthHeader()
  }

  if (emit) emit('request', { url, options: fetchOptions })

  /** @type {Response} */
  const response = await this.fetch(url, fetchOptions)

  if (emit) emit('response', { url, options: fetchOptions, response })

  if (rawResponse && muteErrors) return response

  // response.ok → res.status >= 200 && res.status < 300
  if (!response.ok) {
    error = new MoyskladRequestError(
      `${response.status}${
        response.statusText ? ` ${response.statusText}` : ''
      }`,
      response
    )
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

    if (emit) {
      emit('response:body', {
        url,
        options: fetchOptions,
        response,
        body: resBodyJson
      })
    }
    error = getResponseError(resBodyJson, response) || error
  }

  if (error && !muteErrors) {
    if (emit) emit('error', error)
    throw error
  }

  return rawResponse ? response : resBodyJson
}
