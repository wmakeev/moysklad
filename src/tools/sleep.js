'use strict'

/**
 * Async timeout
 * @param {number} ms ms
 * @returns {Promise} timeout
 */
module.exports = function sleep(ms = 0) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
