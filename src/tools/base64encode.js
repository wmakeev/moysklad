'use strict'

module.exports = function base64encode (value) {
  if (typeof value !== 'string') {
    throw new Error('value to encoding should to be string')
  }
  if (typeof btoa !== 'undefined') {
    // browser
    return btoa(value)
  } else if (typeof Buffer !== 'undefined') {
    // node
    return (Buffer.from ? Buffer.from(value) : new Buffer(value)).toString('base64')
  } else {
    // unknown context
    throw new Error('Can\'t encode value to base64')
  }
}
