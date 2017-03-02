'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

module.exports = function isSimpleValue(value) {
  return (typeof value === 'undefined' ? 'undefined' : _typeof(value)) !== 'object' || value instanceof Date || value === null;
};
//# sourceMappingURL=isSimpleValue.js.map