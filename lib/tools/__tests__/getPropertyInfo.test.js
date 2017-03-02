'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var test = require('blue-tape');
var getPropertyInfo = require('../getPropertyInfo');
var model = require('../../../vendor/json-api-model');

test('getPropertyInfo is ok', function (t) {
  t.ok(getPropertyInfo);
  t.equals(typeof getPropertyInfo === 'undefined' ? 'undefined' : _typeof(getPropertyInfo), 'function');
  t.end();
});

test('getPropertyInfo', function (t) {
  var propInfo = getPropertyInfo(model, 'RetailShift', 'description');
  t.equals(propInfo.type, 'String');

  propInfo = getPropertyInfo(model, 'RetailShift', 'foo');
  t.equals(propInfo, null);

  t.end();
});
//# sourceMappingURL=getPropertyInfo.test.js.map