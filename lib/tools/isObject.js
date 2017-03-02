'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

module.exports = function isObject(value) {
  return value != null && (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object';
};
//# sourceMappingURL=isObject.js.map