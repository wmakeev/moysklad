'use strict'

const test = require('blue-tape')
const buildQuery = require('../buildQuery')

test('buildQuery is ok', t => {
  t.ok(buildQuery)
  t.equals(typeof buildQuery, 'function')
  t.end()
})

test('buildQuery', t => {
  let query = {
    a: 1,
    b: 'foo',
    c: true,
    e: 'name=foo; value!=1'
  }
  t.equals(buildQuery(query), 'a=1&b=foo&c=true&e=name%3Dfoo%3B%20value!%3D1')
  t.end()
})
