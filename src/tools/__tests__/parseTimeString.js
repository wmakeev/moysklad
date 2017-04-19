'use strict'

const test = require('blue-tape')
const parseTimeString = require('../parseTimeString')

test('parseTimeString', t => {
  t.equals(typeof parseTimeString, 'function', 'should be function')
  t.end()
})

test('parseTimeString', t => {
  let date

  date = parseTimeString('2017-04-08 13:33:00')
  t.equals(date.toISOString(), '2017-04-08T10:33:00.000Z', 'should parse time string')

  date = parseTimeString('2017-04-08 13:33:00.123')
  t.equals(date.toISOString(), '2017-04-08T10:33:00.123Z', 'should parse time string with ms')

  t.throws(() => parseTimeString('2017-04-08 3:33:00'), /Некорректный формат/)

  t.throws(() => parseTimeString('2017-04-08 03:33:00.12'), /Некорректный формат/)

  t.end()
})
