'use strict'

const test = require('blue-tape')
const parseTimeString = require('../../src/tools/parseTimeString')

test('parseTimeString', t => {
  t.equals(typeof parseTimeString, 'function', 'should be function')
  t.end()
})

test('parseTimeString', t => {
  let date

  date = parseTimeString('2017-04-08 13:33:00')
  t.equals(
    date.toISOString(),
    '2017-04-08T10:33:00.000Z',
    'should parse time string'
  )

  date = parseTimeString('2017-04-08 13:33:00.123')
  t.equals(
    date.toISOString(),
    '2017-04-08T10:33:00.123Z',
    'should parse time string with ms'
  )

  t.throws(() => parseTimeString('2017-04-08 3:33:00'), /Некорректный формат/)

  t.throws(
    () => parseTimeString('2017-04-08 03:33:00.12'),
    /Некорректный формат/
  )

  t.end()
})

test('getTimeString (other timezone)', t => {
  // Установка переменной окружения и очистка кеша require
  process.env.MOYSKLAD_TIMEZONE = String(6 * 60) // +6 Омск - 360 мин
  delete require.cache[require.resolve('../../src/tools/parseTimeString')]

  const parseTimeString = require('../../src/tools/parseTimeString')

  let date

  // Без учета миллисекунд
  date = parseTimeString('2017-04-08 13:33:00')
  t.equals(date.getFullYear(), 2017, 'should parse year')
  t.equals(date.getMonth() + 1, 4, 'should parse month')
  t.equals(date.getDate(), 8, 'should parse date')

  // Получаем локальное время как часовом поясе Омска (+6)
  t.equals(date.getHours(), 16, 'should parse hours')

  t.equals(date.getMinutes(), 33, 'should parse minutes')
  t.equals(date.getMilliseconds(), 0, 'should parse ms')

  // С учетом миллисекунд
  date = parseTimeString('2017-04-08 13:33:00.123')
  t.equals(date.getFullYear(), 2017, 'should parse year')
  t.equals(date.getMonth() + 1, 4, 'should parse month')
  t.equals(date.getDate(), 8, 'should parse date')
  t.equals(date.getHours(), 16, 'should parse hours')
  t.equals(date.getMinutes(), 33, 'should parse minutes')
  t.equals(date.getMilliseconds(), 123, 'should parse ms')

  // Восстановление прежнего состояния
  delete process.env.MOYSKLAD_TIMEZONE
  delete require.cache[require.resolve('../../src/tools/parseTimeString')]

  t.end()
})
