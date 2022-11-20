'use strict'

module.exports = function isSimpleValue(value) {
  return typeof value !== 'object' || value instanceof Date || value === null
}
