'use strict'

const test = require('blue-tape')
const getResponseError = require('../getResponseError')
const { MoyskladError, MoyskladApiError } = require('../errors')

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
  t.equal(getResponseError([{ meta: {} }]), null, 'should to be null')
})

test('getResponseError (multi error response)', async t => {
  const resp = {
    errors: [createFooError('Ошибка 1', 1000), createFooError('Ошибка 2', 2000)]
  }

  const error = getResponseError(resp)

  t.ok(error instanceof MoyskladError, 'should be instance of MoyskladError')
  t.ok(
    error instanceof MoyskladApiError,
    'should be instance of MoyskladApiError'
  )

  t.equal(error.message, 'Ошибка 1', 'should set error message')
  t.equal(error.code, 1000, 'should set error code')
  t.equal(error.moreInfo, 'https://path/to/info', 'should set error moreInfo')
  t.equal(error.line, 1, 'should set error line')
  t.equal(error.column, 10, 'should set error column')
  t.deepEqual(error.errors, resp.errors, 'should set errors array')
})

test('getResponseError (single error response)', async t => {
  const resp = {
    errors: [createFooError('Ошибка 1', 1000)]
  }

  const error = getResponseError(resp)

  t.ok(error instanceof MoyskladError, 'should be instance of MoyskladError')
  t.ok(
    error instanceof MoyskladApiError,
    'should be instance of MoyskladApiError'
  )

  t.equal(error.message, 'Ошибка 1', 'should set error message')
  t.deepEqual(error.errors, resp.errors, 'should set errors array')
})

test('getResponseError (multi error batch response)', async t => {
  const resp = [
    { foo: 'bar1' },
    {
      errors: [
        createFooError('Ошибка 11', 1100),
        createFooError('Ошибка 12', 1200)
      ]
    },
    { foo: 'bar2' },
    {
      errors: [createFooError('Ошибка 21', 2100)]
    }
  ]

  const error = getResponseError(resp)

  t.ok(error instanceof MoyskladError, 'should be instance of MoyskladError')
  t.ok(
    error instanceof MoyskladApiError,
    'should be instance of MoyskladApiError'
  )

  t.equal(error.message, 'Ошибка 11', 'should set error message')
  t.equal(error.code, 1100, 'should set error code')
  t.equal(error.moreInfo, 'https://path/to/info', 'should set error moreInfo')
  t.equal(error.errors.length, 3, 'should set errors array')
})
