'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var test = require('blue-tape');
var Moysklad = require('../..');
var createAttrStamp = require('../createAttr');

var ATTR_ID = '48a9dbca-75f3-4f1c-933b-57df18b5169f';
var ENTITY_ID = '3e2a8f95-e4d2-4ae7-90a4-e61ff2dde955/55e6f545-b41f-4a72-8b85-363058b68598';

test('Moysklad#createAttr method (extension)', function (t) {
  var client = Moysklad.compose(createAttrStamp).create();
  var createAttr = client.createAttr;


  t.ok(createAttr);
  t.equals(typeof createAttr === 'undefined' ? 'undefined' : _typeof(createAttr), 'function');

  t.deepEqual(createAttr(ATTR_ID, ENTITY_ID), {
    id: ATTR_ID,
    value: {
      meta: {
        type: 'customentity',
        href: 'https://online.moysklad.ru/api/remap/1.1/entity/customentity/' + ENTITY_ID,
        mediaType: 'application/json'
      }
    }
  }, 'should create customentity attribute');

  t.deepEqual(createAttr(ATTR_ID, 'strValue'), {
    id: ATTR_ID,
    value: 'strValue'
  }, 'should create string value attribute');

  t.deepEqual(createAttr(ATTR_ID, 0), {
    id: ATTR_ID,
    value: 0
  }, 'should create number value attribute');

  t.deepEqual(createAttr(ATTR_ID, 42), {
    id: ATTR_ID,
    value: 42
  }, 'should create number value attribute');

  // TODO Add fail test after have fix

  t.end();
});
//# sourceMappingURL=createAttr.test.js.map