'use strict'

const test = require('blue-tape')
const buildFilter = require('../buildFilter')

test('buildFilter', t => {
  t.ok(buildFilter)
  t.equals(typeof buildFilter, 'function', 'should to be function')
  t.end()
})

test('buildFilter with simple filter', t => {
  let query = {
    name: 'foo',
    value: 3,
    moment: new Date('2017-01-09T19:15:06.556Z'),
    some: null,
    other: true
  }

  t.deepEqual(buildFilter(query),
    'moment=2017-01-09 22:15:06;name=foo;other=true;some=;value=3')

  t.end()
})

test('buildFilter with simple deep and many condition filter', t => {
  let query = {
    name: 'foo',
    value: 0,
    moment: new Date('2017-01-09T19:15:06.556Z'),
    'deep.one': 5,
    deep: {
      tow: false
    },
    many: [1, 'baz']
  }

  t.deepEqual(buildFilter(query),
    'deep.one=5;deep.tow=false;many=1;many=baz;moment=2017-01-09 22:15:06;name=foo;value=0')

  t.end()
})

test('buildFilter with mogo query comparison selectors', t => {
  let query = {
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
      $lte: new Date('2017-01-09T19:15:06.556Z')
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
      $gt: 0
    }
  }

  t.deepEqual(buildFilter(query),
    'deep.tow!=bar;many!=;many=1;many=baz;moment>=2017-01-09 22:15:06;name=foo;notMany!=3;' +
    'notMany!=6;notMany>0;num<10;num>=5;value>5')

  t.end()
})

test('buildFilter with mogo query logical selectors', t => {
  let query = {
    name: {
      $and: [
        { $eq: 'foo' },
        { $eq: 'bar' }
      ]
    },
    value: {
      $not: {
        $eq: 10,
        $in: [5, 6]
      }
    }
  }

  t.deepEqual(buildFilter(query),
    'name=bar;name=foo;value!=10;value!=5;value!=6;value=')

  t.end()
})

test('buildFilter errors', t => {
  t.throws(() => {
    buildFilter()
  }, 'filter must to be an object')

  t.throws(() => {
    buildFilter({ foo: undefined })
  }, 'filter "foo" key value is undefined')

  t.throws(() => {
    buildFilter({ foo: Symbol('foo') })
  }, 'filter "foo" key value is incorrect')

  t.throws(() => {
    buildFilter({ foo: { $eq: { a: 1 } } })
  }, '$eq: value must to be string, number, date or null')

  t.throws(() => {
    buildFilter({ foo: { $in: { a: 1 } } })
  }, '$in: selector value must to be an array')

  t.throws(() => {
    buildFilter({ foo: { $and: { a: 1 } } })
  }, '$and: selector value must to be an array')

  t.throws(() => {
    buildFilter({ foo: { $not: 3 } })
  }, '$not: selector value must to be an object')

  t.throws(() => {
    buildFilter({ foo: { $exists: 'boo' } })
  }, '$exists: elector value must to be boolean')

  t.end()
})

// debugger
