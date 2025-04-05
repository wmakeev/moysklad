'use strict'

class MoyskladError extends Error {
  constructor(message, ...args) {
    super(message, ...args)
    this.name = this.constructor.name
    /* c8 ignore else  */
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }
  }
}

class MoyskladRequestError extends MoyskladError {
  constructor(message, response, ...args) {
    super(message, ...args)

    if (response) {
      this.url = response.url
      this.status = response.status
      this.statusText = response.statusText
    }
  }
}

class MoyskladUnexpectedRedirectError extends MoyskladRequestError {
  constructor(response) {
    super(
      `Неожиданное перенаправление запроса с кодом ${response.status}` +
        ' (см. подробнее https://github.com/wmakeev/moysklad#moyskladunexpectedredirecterror)',
      response
    )

    const location = response.headers.get('location')

    if (response) {
      this.url = response.url
      this.status = response.status
      this.statusText = response.statusText
      this.location = location
    }
  }
}

class MoyskladApiError extends MoyskladRequestError {
  constructor(errors, response, requestBody) {
    const error = errors[0]
    /* c8 ignore next */
    const message = error.error + (error.moreInfo ? ` (${error.moreInfo})` : '')

    super(message, response)

    this.code = error.code
    this.moreInfo = error.moreInfo
    if (error.line != null) {
      this.location = {
        start: {
          line: error.line,
          column: error.column
        }
      }
    }
    this.requestBody = requestBody
    this.errors = errors
  }
}

class MoyskladCollectionError extends MoyskladApiError {
  constructor(errors, errorsIndexes, response, requestBody) {
    super(errors, response, requestBody)
    this.errorsIndexes = errorsIndexes
  }
}

module.exports = {
  MoyskladError,
  MoyskladRequestError,
  MoyskladUnexpectedRedirectError,
  MoyskladApiError,
  MoyskladCollectionError
}
