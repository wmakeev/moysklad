'use strict'

const test = require('tape')
const { fetch } = require('undici')
const { EventEmitter } = require('events')

const Moysklad = require('..')

test('Moysklad events (request)', t => {
  t.plan(12)

  const emitter = new EventEmitter()
  const ms = Moysklad({ fetch, emitter })

  let curRequestId

  emitter
    .on('request', ({ requestId, url, options }) => {
      t.ok(requestId !== undefined)

      curRequestId = requestId

      t.equal(
        url,
        'https://api.moysklad.ru/api/remap/1.2/entity/customerorder?limit=1',
        'should emit request url'
      )

      t.equal(options.method, 'GET', 'should emit request options')
    })
    .on('response', ({ requestId, url, options, response }) => {
      t.equal(requestId, curRequestId)

      t.equal(
        url,
        'https://api.moysklad.ru/api/remap/1.2/entity/customerorder?limit=1',
        'should emit response url'
      )

      t.equal(options.method, 'GET', 'should emit response options')

      t.equal(response.status, 200, 'should emit response object')
    })
    .on('response:body', ({ requestId, url, options, response, body }) => {
      t.equal(requestId, curRequestId)

      t.equal(
        url,
        'https://api.moysklad.ru/api/remap/1.2/entity/customerorder?limit=1',
        'should emit response:body url'
      )

      t.equal(options.method, 'GET', 'should emit response:body options')

      t.equal(response.status, 200, 'should emit response:body object')

      t.equal(body.meta.type, 'customerorder', 'should emit response:body body')
    })
    .on('error', () => {
      t.fail('error event not expected')
    })

  ms.GET('entity/customerorder', { limit: 1 }).catch(err => {
    t.fail(err.message)
  })
})

test('Moysklad events (request error)', t => {
  t.plan(12)

  const emitter = new EventEmitter()
  const ms = Moysklad({ fetch, emitter })

  let curRequestId

  emitter
    .on('request', ({ requestId, url, options }) => {
      curRequestId = requestId

      t.equal(
        url,
        'https://api.moysklad.ru/api/remap/1.2/entity/customerorder2?limit=1',
        'should emit request url'
      )
      t.equal(options.method, 'GET', 'should emit request options')
    })
    .on('response', ({ url, options, response }) => {
      t.equal(
        url,
        'https://api.moysklad.ru/api/remap/1.2/entity/customerorder2?limit=1',
        'should emit response url'
      )
      t.equal(options.method, 'GET', 'should emit response options')
      t.equal(response.status, 412, 'should emit response object')
    })
    .on('response:body', ({ url, options, response, body }) => {
      t.equal(
        url,
        'https://api.moysklad.ru/api/remap/1.2/entity/customerorder2?limit=1',
        'should emit response:body url'
      )
      t.equal(options.method, 'GET', 'should emit response:body options')
      t.equal(response.status, 412, 'should emit response:body object')
      t.equal(body.errors[0].code, 1005, 'should emit response:body body')
    })
    .on('error', (err, { requestId }) => {
      t.equal(requestId, curRequestId)

      t.equal(
        err.message,
        "Неизвестный тип: 'customerorder2' (https://dev.moysklad.ru/doc/api/remap/1.2/#error_1005)",
        'should emit response error'
      )
    })

  ms.GET('entity/customerorder2', { limit: 1 })
    .then(() => {
      t.fail('should not return result')
    })
    .catch(err => {
      t.pass(`should throw error - "${err.message}"`)
    })
})

// TODO Хорошо бы протестировать события в нестандартных запросах (с разными типами ошибок и пр.)
