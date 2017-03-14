// TODO Переместить тесты на прямые методы (tools)

'use strict'

const test = require('blue-tape')
const Moysklad = require('../../')
const loadRows = require('../loadRows')

const ORDER_LARGE_ID = 'dd5d3aff-08d6-11e7-7a69-97110015919e'
const POSITIONS_LARGE_COUNT = 333

const ORDER_SMALL_ID = '94510b32-23b3-4167-babf-34463f8a719d'
const POSITIONS_SMALL_COUNT = 89

const uniqCount = items => [...new Set(items)].length

test('loadRows method', t => {
  t.equal(typeof loadRows, 'function', 'should be function')
  t.end()
})

// TODO Test throws on incorrect arguments?

test('loadRows returns rows from expanded collection', async t => {
  const ms = Moysklad()

  let order = await ms.GET(['entity/customerorder', ORDER_SMALL_ID], { expand: 'positions' })
  t.ok(order.positions.rows, 'positions is expanded')

  let rows = await loadRows(ms, order.positions)

  t.true(rows instanceof Array, 'should return rows array')

  t.equals(rows.length, POSITIONS_SMALL_COUNT,
    `should return ${POSITIONS_SMALL_COUNT} positions`)
  t.equal(uniqCount(rows.map(p => p.id)), POSITIONS_SMALL_COUNT,
    `should return ${POSITIONS_SMALL_COUNT} uniq positions`)
})

test('loadRows load and returns rows from not expanded collection', async t => {
  const ms = Moysklad()

  let order = await ms.GET(['entity/customerorder', ORDER_SMALL_ID])
  let rows = await loadRows(ms, order.positions)

  t.true(rows instanceof Array, 'should return rows array')

  t.equals(rows.length, POSITIONS_SMALL_COUNT,
    `should return ${POSITIONS_SMALL_COUNT} positions`)
  t.equal(uniqCount(rows.map(p => p.id)), POSITIONS_SMALL_COUNT,
    `should return ${POSITIONS_SMALL_COUNT} uniq positions`)
})

test('loadRows load and returns rows from not expanded collection (limit specified)', async t => {
  const LIMIT = 33
  const ms = Moysklad()

  let order = await ms.GET(['entity/customerorder', ORDER_SMALL_ID])
  let rows = await loadRows(ms, order.positions, { limit: LIMIT })

  t.true(rows instanceof Array, 'should return rows array')

  t.equals(rows.length, POSITIONS_SMALL_COUNT,
    `should return ${POSITIONS_SMALL_COUNT} positions`)
  t.equal(uniqCount(rows.map(p => p.id)), POSITIONS_SMALL_COUNT,
    `should return ${POSITIONS_SMALL_COUNT} uniq positions`)
})

test('loadRows returns from expanded collection and load others pages', async t => {
  let ms = Moysklad()

  let order = await ms.GET(['entity/customerorder', ORDER_LARGE_ID], { expand: 'positions' })
  let rows = await loadRows(ms, order.positions)

  t.true(rows instanceof Array, 'should return rows array')

  t.equals(rows.length, POSITIONS_LARGE_COUNT,
    `should return ${POSITIONS_LARGE_COUNT} positions`)
  t.equal(uniqCount(rows.map(p => p.id)), POSITIONS_LARGE_COUNT,
    `should return ${POSITIONS_LARGE_COUNT} uniq positions`)
})

test('loadRows returns from expanded collection and load others pages (with offset) #1',
  async t => {
    const LIMIT = 55
    const OFFSET = 60
    const ms = Moysklad()

    let order = await ms.GET(['entity/customerorder', ORDER_LARGE_ID], { expand: 'positions' })
    let rows = await loadRows(ms, order.positions, {
      offset: OFFSET, limit: LIMIT
    })

    t.true(rows instanceof Array, 'should return positions array')

    t.equals(rows.length, POSITIONS_LARGE_COUNT - OFFSET,
      `should return ${POSITIONS_LARGE_COUNT - OFFSET} positions`)

    t.equal(uniqCount(rows.map(p => p.id)), POSITIONS_LARGE_COUNT - OFFSET,
      `should return ${POSITIONS_LARGE_COUNT - OFFSET} uniq positions`)
  })

test('loadRows returns from expanded collection and load others pages (with offset) #2',
  async t => {
    const LIMIT = 50
    const OFFSET = 133
    const ms = Moysklad()

    let order = await ms.GET(['entity/customerorder', ORDER_LARGE_ID], { expand: 'positions' })
    let rows = await loadRows(ms, order.positions, {
      offset: OFFSET, limit: LIMIT
    })

    t.true(rows instanceof Array, 'should return positions array')

    t.equals(rows.length, POSITIONS_LARGE_COUNT - OFFSET,
      `should return ${POSITIONS_LARGE_COUNT - OFFSET} positions`)

    t.equal(uniqCount(rows.map(p => p.id)), POSITIONS_LARGE_COUNT - OFFSET,
      `should return ${POSITIONS_LARGE_COUNT - OFFSET} uniq positions`)
  })

// TODO проверить результат по заранее полученной эталонной коллекции
