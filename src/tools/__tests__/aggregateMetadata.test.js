'use strict'

const fs = require('fs')
const path = require('path')
const test = require('blue-tape')
const aggregateMetadata = require('../aggregateMetadata')
const model = require('../../../vendor/json-api-model')

const QueueStamp = require('../../../src/extensions/queue')
const Moysklad = require('../../../src')

test('aggregateMetadata is ok', t => {
  t.ok(aggregateMetadata)
  t.equals(typeof aggregateMetadata, 'function')
  t.end()
})

test.skip('aggregateMetadata', async t => {
  let moysklad = Moysklad.compose(QueueStamp).create({ queue: true })
  let metadata = await aggregateMetadata(moysklad, model, {
    customEntityFilter: entName => !['Бренды', 'Города'].includes(entName)
  })

  t.ok(metadata, 'should return metadata')
  fs.writeFileSync(path.resolve('_temp/aggregatedMetadata.json'),
    JSON.stringify(metadata, null, 2))
})
