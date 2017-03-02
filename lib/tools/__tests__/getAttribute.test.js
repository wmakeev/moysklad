'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var test = require('blue-tape');
var getAttr = require('../getAttr');
var getAttrVal = require('../getAttrVal');

var entity = {
  attributes: [{
    id: 'f4c073c5-1bcc-4d91-8b41-ed825495b677',
    value: 'foo'
  }, {
    id: 'f4c073c5-1bcc-4d91-8b41-ed825495b672',
    value: 'bar'
  }]
};

test('getAttr', function (t) {
  t.ok(getAttr);
  t.equals(typeof getAttr === 'undefined' ? 'undefined' : _typeof(getAttr), 'function');
  t.equal(getAttr(entity, entity.attributes[0].id), entity.attributes[0], 'should return attribute');
  t.end();
});

test('getAttrVal', function (t) {
  t.ok(getAttrVal);
  t.equals(typeof getAttrVal === 'undefined' ? 'undefined' : _typeof(getAttrVal), 'function');
  t.equal(getAttrVal(entity, entity.attributes[1].id), entity.attributes[1].value, 'should return attribute value');
  t.end();
});
//# sourceMappingURL=getAttribute.test.js.map