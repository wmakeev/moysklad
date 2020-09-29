'use strict'

const test = require('blue-tape')

test('getTimeString', t => {
  const getTimeString = require('../../src/tools/getTimeString')

  t.ok(getTimeString)
  t.equals(typeof getTimeString, 'function', 'should be function')
  t.end()
})

test('getTimeString', t => {
  const getTimeString = require('../../src/tools/getTimeString')

  const date1 = new Date('2017-02-01T07:10:11Z')
  const date2 = new Date('2017-02-01T07:10:11.123Z')

  t.equals(
    getTimeString(date1),
    '2017-02-01 10:10:11',
    'should return time string'
  )

  t.equals(
    getTimeString(date2),
    '2017-02-01 10:10:11',
    'should return time string with ms'
  )

  t.equals(
    getTimeString(date2, true),
    '2017-02-01 10:10:11.123',
    'should return time string with ms'
  )

  t.end()
})

test('getTimeString (other timezone)', t => {
  // Установка переменной окружения и очистка кеша require
  process.env.MOYSKLAD_TIMEZONE = String(6 * 60) // +6 Омск - 360 мин
  delete require.cache[require.resolve('../../src/tools/getTimeString')]

  const getTimeString = require('../../src/tools/getTimeString')

  // Дата указывается в локальном времени.
  // Часовой пояс может отличатся от указанного в MOYSKLAD_TIMEZONE.
  // Считается, что локальное время соов. времени в часовом поясе MOYSKLAD_TIMEZONE.
  const date1 = new Date('2017-02-01T10:10:11')
  const date2 = new Date('2017-02-01T10:10:11.123')

  t.equals(
    getTimeString(date1),
    '2017-02-01 07:10:11', // Время для Омска
    'should return time string'
  )

  t.equals(
    getTimeString(date2),
    '2017-02-01 07:10:11',
    'should return time string without ms'
  )

  t.equals(
    getTimeString(date2, true),
    '2017-02-01 07:10:11.123',
    'should return time string with ms'
  )

  // Восстановление прежнего состояния
  delete process.env.MOYSKLAD_TIMEZONE
  delete require.cache[require.resolve('../../src/tools/getTimeString')]

  t.end()
})

test('getTimeString (wrong MOYSKLAD_TIMEZONE value)', t => {
  process.env.MOYSKLAD_TIMEZONE = 'foo'

  // Очистим кеш require для установки новой переменной окружения
  delete require.cache[require.resolve('../../src/tools/getTimeString')]

  t.throws(() => {
    require('../../src/tools/getTimeString')
  }, /Некорректно указана переменная окружения MOYSKLAD_TIMEZONE/)

  // Восстановим прежнее состояние
  delete process.env.MOYSKLAD_TIMEZONE
  delete require.cache[require.resolve('../../src/tools/getTimeString')]

  t.end()
})
