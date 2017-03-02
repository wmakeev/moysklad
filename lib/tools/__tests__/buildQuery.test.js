'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var test = require('blue-tape');
var buildQuery = require('../buildQuery');

test('buildQuery is ok', function (t) {
  t.ok(buildQuery);
  t.equals(typeof buildQuery === 'undefined' ? 'undefined' : _typeof(buildQuery), 'function');
  t.end();
});

test('buildQuery', function (t) {
  var query = {
    a: 1,
    b: 'foo',
    c: true,
    e: 'name=foo; value!=1'
  };
  t.equals(buildQuery(query), 'a=1&b=foo&c=true&e=name%3Dfoo%3B%20value!%3D1');
  t.end();
});
//# sourceMappingURL=buildQuery.test.js.map