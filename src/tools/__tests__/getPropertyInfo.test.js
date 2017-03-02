'use strict'

const test = require('blue-tape')
const getPropertyInfo = require('../getPropertyInfo')
const model = require('../../../vendor/json-api-model')

test('getPropertyInfo is ok', t => {
  t.ok(getPropertyInfo)
  t.equals(typeof getPropertyInfo, 'function')
  t.end()
})

test('getPropertyInfo', t => {
  let propInfo = getPropertyInfo(model, 'RetailShift', 'description')
  t.equals(propInfo.type, 'String')

  propInfo = getPropertyInfo(model, 'RetailShift', 'foo')
  t.equals(propInfo, null)

  t.end()
})
