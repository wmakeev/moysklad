'use strict'

const test = require('blue-tape')
const Moysklad = require('../..')
const createAttrStamp = require('../createAttr')

const ATTR_ID = '48a9dbca-75f3-4f1c-933b-57df18b5169f'
const ENTITY_ID = '3e2a8f95-e4d2-4ae7-90a4-e61ff2dde955/55e6f545-b41f-4a72-8b85-363058b68598'

test('Moysklad#createAttr method (extension)', t => {
  const client = Moysklad.compose(createAttrStamp).create()
  const { createAttr } = client

  t.ok(createAttr)
  t.equals(typeof createAttr, 'function')

  t.deepEqual(createAttr(ATTR_ID, ENTITY_ID), {
    id: ATTR_ID,
    value: {
      meta: {
        type: 'customentity',
        href: 'https://online.moysklad.ru/api/remap/1.1/entity/customentity/' + ENTITY_ID,
        mediaType: 'application/json'
      }
    }
  }, 'should create customentity attribute')

  t.deepEqual(createAttr(ATTR_ID, 'strValue'), {
    id: ATTR_ID,
    value: 'strValue'
  }, 'should create string value attribute')

  t.deepEqual(createAttr(ATTR_ID, 0), {
    id: ATTR_ID,
    value: 0
  }, 'should create number value attribute')

  t.deepEqual(createAttr(ATTR_ID, 42), {
    id: ATTR_ID,
    value: 42
  }, 'should create number value attribute')

  // TODO Add fail test after have fix

  t.end()
})
