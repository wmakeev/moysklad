'use strict'

const { MoyskladError } = require('../errors')
const getTimezoneShift = require('./getTimezoneShift')

const timezoneFix = getTimezoneShift()

// https://regex101.com/r/Bxq7dZ/2
const MS_TIME_REGEX =
  /^(\d{4})-(\d{2})-(\d{2})\s(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?$/

function rightPad2(num) {
  return `${num}00`.slice(0, 3)
}

/**
 * Преобразует строку времени МойСклад в объект даты (с учетом временной зоны)
 * @param {string} timeString Время в формате МойСклад ("2017-04-08 13:33:00.123")
 * @returns {Date} Дата
 */
module.exports = function parseTimeString(timeString) {
  // 2017-04-08 13:33:00.123
  const m = MS_TIME_REGEX.exec(timeString)
  if (!m || m.length < 7 || m.length > 8) {
    throw new MoyskladError(`Некорректный формат даты "${timeString}"`)
  }

  const dateExp = `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}${
    m[7] && Number.parseInt(m[7]) !== 0 ? '.' + rightPad2(m[7]) : ''
  }+03:00`

  const date = new Date(dateExp)

  return timezoneFix ? new Date(+date - timezoneFix) : date
}
