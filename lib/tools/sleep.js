'use strict';

/**
 * Async timeout
 * @param {number} ms ms
 * @returns {Promise} timeout
 */

module.exports = function sleep() {
  var ms = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

  return new Promise(function (resolve) {
    return setTimeout(resolve, ms);
  });
};
//# sourceMappingURL=sleep.js.map