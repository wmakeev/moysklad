'use strict'

const test = require('blue-tape')
const getAttr = require('../getAttr')
const getAttrVal = require('../getAttrVal')

let entity = {
  attributes: [
    {
      id: 'f4c073c5-1bcc-4d91-8b41-ed825495b677',
      value: 'foo'
    },
    {
      id: 'f4c073c5-1bcc-4d91-8b41-ed825495b672',
      value: 'bar'
    }
  ]
}

test('getAttr', t => {
  t.ok(getAttr)
  t.equals(typeof getAttr, 'function')
  t.equal(getAttr(entity, entity.attributes[0].id), entity.attributes[0],
    'should return attribute')
  t.end()
})

test('getAttrVal', t => {
  t.ok(getAttrVal)
  t.equals(typeof getAttrVal, 'function')
  t.equal(getAttrVal(entity, entity.attributes[1].id), entity.attributes[1].value,
    'should return attribute value')
  t.end()
})
