'use strict'

class MoyskladError extends Error {
  constructor (message) {
    super(message)
    this.name = this.constructor.name
    /* istanbul ignore else  */
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }
  }
}

class MoyskladRequestError extends MoyskladError {
  constructor (message, response) {
    super(message)

    if (response) {
      this.url = response.url
      this.status = response.status
      this.statusText = response.statusText
    }
  }
}

class MoyskladApiError extends MoyskladRequestError {
  constructor (errors, response) {
    const error = errors[0]
    const message = error.error + (error.moreInfo ? ` (${error.moreInfo})` : '')

    super(message, response)

    this.code = error.code
    this.moreInfo = error.moreInfo
    if (error.line != null) this.line = error.line
    if (error.column != null) this.column = error.column
    this.errors = errors
  }
}

module.exports = {
  MoyskladError,
  MoyskladRequestError,
  MoyskladApiError
}
