'use strict'

const test = require('blue-tape')
const Moysklad = require('../..')
const createMetaStamp = require('../createMeta')

test('Moysklad#createMeta method (extension)', t => {
  const client = Moysklad.compose(createMetaStamp).create()
  const { createMeta } = client

  t.ok(createMeta)
  t.equals(typeof createMeta, 'function')

  t.deepEqual(createMeta('sometype', 'path/to/type'), {
    type: 'sometype',
    href: 'https://online.moysklad.ru/api/remap/1.1/path/to/type',
    mediaType: 'application/json'
  }, 'should create meta value')

  t.end()
})
