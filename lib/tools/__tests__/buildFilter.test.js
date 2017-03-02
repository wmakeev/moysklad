'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var test = require('blue-tape');
var buildFilter = require('../buildFilter');

test('buildFilter is ok', function (t) {
  t.ok(buildFilter);
  t.equals(typeof buildFilter === 'undefined' ? 'undefined' : _typeof(buildFilter), 'function');
  t.end();
});

test('buildFilter with simple filter', function (t) {
  var query = {
    name: 'foo',
    value: 3,
    moment: new Date(2017, 0, 10, 0, 15, 6, 556),
    some: null
  };

  t.deepEqual(buildFilter(query), 'moment=2017-01-09 19:15:06;name=foo;some=;value=3');

  t.end();
});

test('buildFilter with simple deep and many condition filter', function (t) {
  var query = {
    name: 'foo',
    value: 3,
    moment: new Date(2017, 0, 10, 0, 15, 6, 556),
    'deep.one': 5,
    deep: {
      tow: 'bar'
    },
    many: [1, 'baz']
  };

  t.deepEqual(buildFilter(query), 'deep.one=5;deep.tow=bar;many=1;many=baz;moment=2017-01-09 19:15:06;name=foo;value=3');

  t.end();
});

test('buildFilter with mogo query comparison selectors', function (t) {
  var query = {
    name: {
      $eq: 'foo'
    },
    value: {
      $gt: 5
    },
    num: {
      $gte: 5, $lt: 10
    },
    moment: {
      $lte: new Date(2017, 0, 10, 0, 15, 6, 556)
    },
    deep: {
      tow: {
        $ne: 'bar'
      }
    },
    many: {
      $exists: true,
      $in: [1, 'baz']
    },
    notMany: {
      $nin: [3, 6],
      $gt: 5
    }
  };

  t.deepEqual(buildFilter(query), 'deep.tow!=bar;many!=;many=1;many=baz;moment>=2017-01-09 19:15:06;name=foo;notMany!=3;' + 'notMany!=6;notMany>5;num<10;num>=5;value>5');

  t.end();
});

test('buildFilter with mogo query logical selectors', function (t) {
  var query = {
    name: {
      $and: [{ $eq: 'foo' }, { $eq: 'bar' }]
    },
    value: {
      $not: {
        $eq: 10,
        $in: [5, 6]
      }
    }
  };

  t.deepEqual(buildFilter(query), 'name=bar;name=foo;value!=10;value!=5;value!=6;value=');

  t.end();
});

test('buildFilter errors', function (t) {
  t.throws(function () {
    buildFilter();
  }, 'filter must to be an object');

  t.throws(function () {
    buildFilter({ foo: undefined });
  }, 'filter "foo" key value is undefined');

  t.throws(function () {
    buildFilter({ foo: Symbol('foo') });
  }, 'filter "foo" key value is incorrect');

  t.throws(function () {
    buildFilter({ foo: { $eq: { a: 1 } } });
  }, '$eq: value must to be string, number, date or null');

  t.throws(function () {
    buildFilter({ foo: { $in: { a: 1 } } });
  }, '$in: selector value must to be an array');

  t.throws(function () {
    buildFilter({ foo: { $and: { a: 1 } } });
  }, '$and: selector value must to be an array');

  t.throws(function () {
    buildFilter({ foo: { $not: 3 } });
  }, '$not: selector value must to be an object');

  t.throws(function () {
    buildFilter({ foo: { $exists: 'boo' } });
  }, '$exists: elector value must to be boolean');

  t.end();
});

// debugger
//# sourceMappingURL=buildFilter.test.js.map