'use strict'

const test = require('blue-tape')
const EventEmitter = require('events')

const Moysklad = require('../../')
const EmitterStamp = require('../emitter')

const PRODUCT_ID = '8dff01c6-e06d-413c-a38f-6139eaf4c2c7'

let ExtendedMoysklad = Moysklad.compose(EmitterStamp)

test.skip('Moysklad emitter (extension)', async t => {
  const emitter = new EventEmitter()

  let ms = ExtendedMoysklad({ eventEmitter: emitter })

  let emitted = false
  emitter.on('request', data => {
    // console.log(data.uri)
    emitted = true
  })

  await ms.GET(['entity/product', PRODUCT_ID])

  t.true(emitted, 'client should emit request events')
})
