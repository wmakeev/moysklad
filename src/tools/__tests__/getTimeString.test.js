'use strict'

const test = require('blue-tape')
const getTimeString = require('../getTimeString')

test('getTimeString is ok', t => {
  t.ok(getTimeString)
  t.equals(typeof getTimeString, 'function')
  t.end()
})

test('getTimeString', t => {
  let date = new Date(2017, 1, 1, 12, 10, 11)
  let timeString = getTimeString(date)
  t.equals(timeString, '2017-02-01 07:10:11')
  t.end()
})
