'use strict'

const { MoyskladApiError } = require('./errors')

module.exports = function getResponseError (resp, response) {
  let errors

  if (!resp) return null

  if (resp instanceof Array) {
    errors = resp
      .filter(item => item.errors)
      .map(errItem => errItem.errors)
      .reduce((res, errors) => res.concat(errors), [])
  } else if (resp.errors) {
    errors = resp.errors
  }

  return errors && errors.length ? new MoyskladApiError(errors, response) : null
}
