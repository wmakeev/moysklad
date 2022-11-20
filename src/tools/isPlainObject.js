'use strict'

module.exports = function isPlainObject(value) {
  return Object.prototype.toString.call(value) === '[object Object]'
}
