'use strict'

const test = require('blue-tape')
const Moysklad = require('../../..')
const sleep = require('../../../tools/sleep')

const QueueStamp = require('..')
const ExtendedMoysklad = Moysklad.compose(QueueStamp)

const PRODUCT_ID = '8dff01c6-e06d-413c-a38f-6139eaf4c2c7'
const PRODUCT_NAME = 'Тест 9999+'

test('Moysklad queue', async t => {
  let ms = ExtendedMoysklad({ queue: true })

  // Сделаем паузу после предыдущих тестов
  await sleep(1000)

  t.comment('should plan request to avoid 429 error')
  let results = []
  for (let i = 1; i < 10; i++) {
    results.push(ms.GET(['entity/product', PRODUCT_ID]).then(p => p.name))
  }

  results = await Promise.all(results)

  t.ok(results.every(r => r === PRODUCT_NAME))
})
