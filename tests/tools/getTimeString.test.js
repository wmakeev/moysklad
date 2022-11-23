'use strict'

const test = require('tape')

test('getTimeString', t => {
  const { getTimeString } = require('../..')

  t.ok(getTimeString)
  t.equals(typeof getTimeString, 'function', 'should be function')
  t.end()
})

test('getTimeString', t => {
  const { getTimeString } = require('../..')

  const date1 = new Date('2017-02-01T07:10:11Z')

  t.equals(
    getTimeString(date1),
    '2017-02-01 10:10:11',
    'should return time string'
  )

  t.equals(
    getTimeString(+date1),
    '2017-02-01 10:10:11',
    'should return time string by date as number'
  )

  const date2 = new Date('2017-02-01T07:10:11.123Z')

  t.equals(
    getTimeString(date2),
    '2017-02-01 10:10:11',
    'should return time string without ms'
  )

  t.equals(
    getTimeString(date2, true),
    '2017-02-01 10:10:11.123',
    'should return time string with ms'
  )

  const date3 = new Date('2017-02-01T10:10:11.03Z')

  t.equals(
    getTimeString(date3, true),
    '2017-02-01 13:10:11.030',
    'should return time string with 30 ms'
  )

  const date4 = new Date('2017-02-01T10:10:11.003Z')

  t.equals(
    getTimeString(date4, true),
    '2017-02-01 13:10:11.003',
    'should return time string with 3 ms'
  )

  const date5 = new Date('2017-02-01T10:10:11.0Z')

  t.equals(
    getTimeString(date5, true),
    '2017-02-01 13:10:11',
    'should return time string with 0 ms'
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

  t.equals(
    getTimeString(date1),
    '2017-02-01 07:10:11', // Время для Омска
    'should return time string'
  )

  const date2 = new Date('2017-02-01T10:10:11.123')

  t.equals(
    getTimeString(date2),
    '2017-02-01 07:10:11',
    'should return time string without ms'
  )

  t.equals(
    getTimeString(date2, true),
    '2017-02-01 07:10:11.123',
    'should return time string with 123 ms'
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
