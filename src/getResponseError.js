'use strict'

const { MoyskladApiError, MoyskladCollectionError } = require('./errors')

module.exports = function getResponseError(responseBody, response) {
  if (!responseBody) return null

  if (Array.isArray(responseBody)) {
    const errorsIndexes = responseBody
      .map((item, index) => {
        if (item.errors) {
          return [index, item.errors]
        } else {
          return null
        }
      })
      .filter(item => item !== null)

    if (errorsIndexes.length === 0) return null

    const errors = errorsIndexes
      .map(errItem => errItem[1])
      .reduce((res, errors) => res.concat(errors), [])

    return new MoyskladCollectionError(errors, errorsIndexes, response)
  } else if (responseBody.errors) {
    return new MoyskladApiError(responseBody.errors, response)
  }

  return null
}
