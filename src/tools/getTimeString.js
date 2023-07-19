'use strict'

const getTimezoneShift = require('./getTimezoneShift')

const timezoneFix = getTimezoneShift()

/** Временная зона API МойСклад (часовой пояс в мс) */
const mskTimezone = +3 * 60 * 60 * 1000 // ms

function leftPad1(num) {
  return `0${num}`.slice(-2)
}

function leftPad2(num) {
  return `00${num}`.slice(-3)
}

/**
 * Возвращает дату для фильтра в часовом поясе Москвы
 *
 * @param {Date | number} date Конвертируемая дата
 * @param {Boolean} includeMs Необходимо ли включить миллисекунды в дату
 * @returns {string} Дата ввиде строки
 */
module.exports = function getTimeString(date, includeMs) {
  const mskTime = new Date(+date + mskTimezone + timezoneFix)

  const milliseconds = mskTime.getUTCMilliseconds()

  // 2000-01-01 01:00:00.123
  return [
    mskTime.getUTCFullYear(),
    '-',
    leftPad1(mskTime.getUTCMonth() + 1),
    '-',
    leftPad1(mskTime.getUTCDate()),
    ' ',
    leftPad1(mskTime.getUTCHours()),
    ':',
    leftPad1(mskTime.getUTCMinutes()),
    ':',
    leftPad1(mskTime.getUTCSeconds()),
    includeMs ? `.${leftPad2(milliseconds)}` : ''
  ].join('')
}
