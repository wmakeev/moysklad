'use strict'

const have = require('../have')
const getResponseError = require('../getResponseError')
const errorsHttp = require('../errorsHttp')

module.exports = async function fetchUri (uri, options = {}) {
  have.strict(arguments, { uri: 'str', options: 'opt Object' })

  let fetchOptions = {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  }

  let authHeader = this.getAuthHeader()
  if (authHeader) {
    fetchOptions.headers.Authorization = this.getAuthHeader()
  }

  if (options.body != null && options.method && options.method !== 'GET') {
    fetchOptions.body = options.body
  }

  /** @type {Response} */
  let response = await this.fetch(uri, fetchOptions)

  let contentType, responseJson, error

  if (response.headers.has('Content-Type')) {
    contentType = response.headers.get('Content-Type')
  }

  if (contentType && contentType.indexOf('application/json') !== -1) {
    // получение ответа сервера и обработка ошибок API
    responseJson = await response.json()
    error = getResponseError(responseJson)
    if (error) { throw error }
  } else if (!response.ok) {
    // обработка ошибок http
    error = errorsHttp[response.status.toString()]
    if (error) {
      throw new Error(error)
    } else {
      throw new Error(`Http error: ${response.status} ${response.statusText}`)
    }
  }

  return responseJson
}
