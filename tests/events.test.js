'use strict'

const test = require('blue-tape')
const fetch = require('node-fetch')
const { EventEmitter } = require('events')

const Moysklad = require('..')

test('Moysklad events (request)', t => {
  t.plan(9)

  const emitter = new EventEmitter()
  const ms = Moysklad({ fetch, emitter })

  emitter
    .on('request', ({ url, options }) => {
      t.equal(
        url,
        'https://online.moysklad.ru/api/remap/1.1/entity/customerorder?limit=1',
        'should emit request url'
      )
      t.equal(options.method, 'GET', 'should emit request options')
    })
    .on('response', ({ url, options, response }) => {
      t.equal(
        url,
        'https://online.moysklad.ru/api/remap/1.1/entity/customerorder?limit=1',
        'should emit response url'
      )
      t.equal(options.method, 'GET', 'should emit response options')
      t.equal(response.status, 200, 'should emit response object')
    })
    .on('response:body', ({ url, options, response, body }) => {
      t.equal(
        url,
        'https://online.moysklad.ru/api/remap/1.1/entity/customerorder?limit=1',
        'should emit response:body url'
      )
      t.equal(options.method, 'GET', 'should emit response:body options')
      t.equal(response.status, 200, 'should emit response:body object')
      t.equal(body.meta.type, 'customerorder', 'should emit response:body body')
    })
    .on('error', err => {
      console.log('Error event: ', err.message)
    })

  ms.GET('entity/customerorder', { limit: 1 }).catch(err => {
    t.fail(err.message)
  })
})

test('Moysklad events (request error)', t => {
  t.plan(11)

  const emitter = new EventEmitter()
  const ms = Moysklad({ fetch, emitter })

  emitter
    .on('request', ({ url, options }) => {
      t.equal(
        url,
        'https://online.moysklad.ru/api/remap/1.1/entity/customerorder2?limit=1',
        'should emit request url'
      )
      t.equal(options.method, 'GET', 'should emit request options')
    })
    .on('response', ({ url, options, response }) => {
      t.equal(
        url,
        'https://online.moysklad.ru/api/remap/1.1/entity/customerorder2?limit=1',
        'should emit response url'
      )
      t.equal(options.method, 'GET', 'should emit response options')
      t.equal(response.status, 412, 'should emit response object')
    })
    .on('response:body', ({ url, options, response, body }) => {
      t.equal(
        url,
        'https://online.moysklad.ru/api/remap/1.1/entity/customerorder2?limit=1',
        'should emit response:body url'
      )
      t.equal(options.method, 'GET', 'should emit response:body options')
      t.equal(response.status, 412, 'should emit response:body object')
      t.equal(body.errors[0].code, 1005, 'should emit response:body body')
    })
    .on('error', err => {
      t.equal(
        err.message,
        "Неизвестный тип: 'customerorder2'",
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
