'use strict'

const test = require('blue-tape')
const buildQuery = require('../buildQuery')

test('buildQuery', t => {
  t.ok(buildQuery)
  t.equals(typeof buildQuery, 'function', 'should to be function')

  let query

  // Преобразует поля объекта в строку запроса
  query = {
    str: 'some string',
    num: 1,
    bool: true,
    nil: null,
    nothing: undefined,
    arr: ['str', 1, true, null, undefined]
  }

  t.equals(
    buildQuery(query),
    'str=some%20string&num=1&bool=true&nil=&arr=str&arr=1&arr=true&arr=',
    'should build query'
  )

  t.throws(
    () => buildQuery({ foo: {} }),
    /url query key value must to be string, number, boolean, null or undefined/,
    'should throw if query key value not string, number, boolean, null or undefined'
  )

  t.throws(
    () => buildQuery({ arr: [1, 'str', Function] }),
    /url query key value must to be string, number, boolean, null or undefined/,
    'should throw if query key value not string, number, boolean, null or undefined'
  )

  // Преобразует поле filter
  query = {
    filter: {
      foo: 'foo string',
      bar: ['baz1', 'baz2']
    }
  }
  t.equals(
    buildQuery(query),
    'filter=bar%3Dbaz1%3Bbar%3Dbaz2%3Bfoo%3Dfoo%20string',
    'should transform query.filter object to string'
  )

  // Преобразует поле order (если представлено ввиде массива)
  query = {
    order: 'foo;bar,asc'
  }
  t.equals(
    buildQuery(query),
    'order=foo%3Bbar%2Casc',
    'should not transform query.order string'
  )

  query = {
    order: ['foo', ['bar', 'asc'], 'baz,desc', ['qux']]
  }
  t.equals(
    buildQuery(query),
    'order=foo%3Bbar%2Casc%3Bbaz%2Cdesc%3Bqux',
    'should transform query.order array notation to string'
  )

  // Не преобразует поле фильтр, если указана строка
  query = {
    filter: 'foo=bar baz'
  }

  t.equals(
    buildQuery(query),
    'filter=foo%3Dbar%20baz',
    'should not transform query.filter string'
  )

  t.equals(
    buildQuery({
      expand: 'foo'
    }),
    'expand=foo&limit=100',
    'should append query.limit=100 for expand field without limit'
  )

  t.equals(
    buildQuery({
      expand: 'foo',
      limit: 0
    }),
    'expand=foo&limit=0',
    'should not change existing query.limit'
  )

  t.equals(
    buildQuery({
      foo: 'bar',
      expand: undefined
    }),
    'foo=bar',
    'should drop empty expand'
  )

  t.throws(
    () => buildQuery({ filter: ['foo', 'bar'] }),
    /filter must to be string or object/,
    'should throw if query.filter is not string or object'
  )

  t.end()
})
