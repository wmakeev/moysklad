'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var test = require('blue-tape');
var Moysklad = require('../..');
var createMetaStamp = require('../createMeta');

test('Moysklad#createMeta method (extension)', function (t) {
  var client = Moysklad.compose(createMetaStamp).create();
  var createMeta = client.createMeta;


  t.ok(createMeta);
  t.equals(typeof createMeta === 'undefined' ? 'undefined' : _typeof(createMeta), 'function');

  t.deepEqual(createMeta('sometype', 'path/to/type'), {
    type: 'sometype',
    href: 'https://online.moysklad.ru/api/remap/1.1/path/to/type',
    mediaType: 'application/json'
  }, 'should create meta value');

  t.end();
});
//# sourceMappingURL=createMeta.test.js.map