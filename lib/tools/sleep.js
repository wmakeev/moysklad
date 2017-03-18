'use strict';

/**
 * Async timeout
 * @param {number} ms ms
 * @returns {Promise} timeout
 */

module.exports = function sleep() {
  let ms = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

  return new Promise(resolve => setTimeout(resolve, ms));
};
//# sourceMappingURL=sleep.js.map