'use strict'

class MoyskladError extends Error {
  constructor (message) {
    super(message)
    this.name = this.constructor.name
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }
  }
}

class MoyskladApiError extends MoyskladError {
  constructor (errors) {
    const error = errors[0]
    const message = error.error
    super(message)
    this.code = error.code
    this.moreInfo = error.moreInfo
    if (error.line != null) this.line = error.line
    if (error.column != null) this.column = error.column
    this.errors = errors
  }
}

module.exports = {
  MoyskladError,
  MoyskladApiError
}
