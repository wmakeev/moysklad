'use strict'

const { MoyskladApiError } = require('./errors')

module.exports = function getResponseError (responseBody, response) {
  let errors

  if (!responseBody) return null

  if (responseBody instanceof Array) {
    errors = responseBody
      .filter(item => item.errors)
      .map(errItem => errItem.errors)
      .reduce((res, errors) => res.concat(errors), [])
  } else if (responseBody.errors) {
    errors = responseBody.errors
  }

  return errors && errors.length ? new MoyskladApiError(errors, response) : null
}
