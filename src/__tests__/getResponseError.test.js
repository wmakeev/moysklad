'use strict'

const test = require('blue-tape')
const getResponseError = require('../getResponseError')

const createFooError = (message, code) => ({
  meta: {
    type: 'entity'
  },
  code,
  error: message,
  moreInfo: 'https://path/to/info',
  parameter: 'foo',
  column: 10,
  line: 1
})

test('getResponseError (empty response)', async t => {
  t.equal(getResponseError(), null, 'should to be null')
  t.equal(getResponseError({}), null, 'should to be null')
  t.equal(getResponseError([{}]), null, 'should to be null')
})

test('getResponseError (multi error response)', async t => {
  let resp = {
    errors: [
      createFooError('Ошибка 1', 1000),
      createFooError('Ошибка 2', 2000)
    ]
  }

  let error = getResponseError(resp)

  t.equal(error.message, 'Ошибка 1', 'should set error message')
  t.equal(error.code, 1000, 'should set error code')
  t.equal(error.moreInfo, 'https://path/to/info', 'should set error moreInfo')
  t.equal(error.errors.length, 2, 'should set errors array')
})

test('getResponseError (single error response)', async t => {
  let resp = {
    errors: [
      createFooError('Ошибка 1', 1000)
    ]
  }

  let error = getResponseError(resp)

  t.equal(error.message, 'Ошибка 1', 'should set error message')
  t.notOk(error.errors, 'should set errors array')
})

test('getResponseError (multi error batch response)', async t => {
  let resp = [
    { foo: 'bar1' },
    {
      errors: [
        createFooError('Ошибка 11', 1100),
        createFooError('Ошибка 12', 1200)
      ]
    },
    { foo: 'bar2' },
    {
      errors: [
        createFooError('Ошибка 21', 2100)
      ]
    }
  ]

  let error = getResponseError(resp)

  t.equal(error.message, 'Ошибка 11', 'should set error message')
  t.equal(error.code, 1100, 'should set error code')
  t.equal(error.moreInfo, 'https://path/to/info', 'should set error moreInfo')
  t.equal(error.errors.length, 2, 'should set errors array')
})
