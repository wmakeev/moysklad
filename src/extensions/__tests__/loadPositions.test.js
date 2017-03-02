// TODO Переместить тесты на прямые методы (tools)

'use strict'

const test = require('blue-tape')
const Moysklad = require('../../')
const loadPositions = require('../loadPositions')

const ORDER_ID = '94510b32-23b3-4167-babf-34463f8a719d'
const POSITIONS_COUNT = 89
const OFFSET = 29
const LIMIT = 20

const uniqCount = items => [...new Set(items)].length

let ExtendedMoysklad = Moysklad.compose(loadPositions)

test('Moysklad#loadPositions method (extension)', t => {
  let ms = ExtendedMoysklad()
  t.ok(ms.loadPositions, 'should add `loadPositions` method')
  t.end()
})

test('Moysklad#loadPositions method extension (one request)', async t => {
  let ms = ExtendedMoysklad()

  t.ok(ms.loadPositions, 'should add `loadPositions` method')

  let positions = await ms.loadPositions('customerorder', ORDER_ID, { limit: 100 })

  t.true(positions instanceof Array, 'should return positions array')

  t.equals(positions.length, POSITIONS_COUNT,
    `should return ${POSITIONS_COUNT} positions`)

  t.equal(uniqCount(positions.map(p => p.id)), POSITIONS_COUNT,
    `should return ${POSITIONS_COUNT} uniq positions`)
})

test('Moysklad#loadPositions (several requests)', async t => {
  let ms = ExtendedMoysklad()

  let positions = await ms.loadPositions('customerorder', ORDER_ID, { limit: LIMIT })

  t.true(positions instanceof Array, 'should return positions array')

  t.equals(positions.length, POSITIONS_COUNT,
    `should return ${POSITIONS_COUNT} positions`)

  t.equal(uniqCount(positions.map(p => p.id)), POSITIONS_COUNT,
    `should return ${POSITIONS_COUNT} uniq positions`)
})

test('Moysklad#loadPositions (several requests with start offset)', async t => {
  let ms = ExtendedMoysklad()
  let positions = await ms.loadPositions('customerorder', ORDER_ID, {
    offset: OFFSET, limit: LIMIT
  })

  t.true(positions instanceof Array, 'should return positions array')

  t.equals(positions.length, POSITIONS_COUNT - OFFSET,
    `should return ${POSITIONS_COUNT - OFFSET} positions`)

  t.equal(uniqCount(positions.map(p => p.id)), POSITIONS_COUNT - OFFSET,
    `should return ${POSITIONS_COUNT - OFFSET} uniq positions`)
})
