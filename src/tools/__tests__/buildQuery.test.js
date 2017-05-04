'use strict'

const test = require('blue-tape')
const buildQuery = require('../buildQuery')

test('buildQuery', t => {
  t.ok(buildQuery)
  t.equals(typeof buildQuery, 'function', 'should to be function')
  t.end()
})

test('buildQuery', t => {
  let query

  query = {
    a: 1,
    b: 'foo',
    c: true,
    e: 'name=foo; value!=1'
  }
  t.equals(buildQuery(query), 'a=1&b=foo&c=true&e=name%3Dfoo%3B%20value!%3D1',
    'should build simple query')

  query = {
    filter: {
      foo: 'foo string',
      bar: ['baz1', 'baz2']
    }
  }
  t.equals(buildQuery(query), 'filter=bar%3Dbaz1%3Bbar%3Dbaz2%3Bfoo%3Dfoo%20string',
    'should transform query.filter object to string')

  query = {
    filter: 'foo=bar baz'
  }
  t.equals(buildQuery(query), 'filter=foo%3Dbar%20baz',
    'should not transform query.filter string')

  t.throws(() => {
    buildQuery({
      filter: ['foo', 'bar']
    })
  }, /filter must to be string or object/, 'should throw if query.filter is not string or object')

  t.end()
})
