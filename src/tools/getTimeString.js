'use strict'

const getTimezoneFix = require('./getTimezoneFix')

const timezoneFix = getTimezoneFix()

/** Временная зона API МойСклад (часовой пояс в мс) */
const mskTimezone = +3 * 60 * 60 * 1000 // ms

function pad2 (num) {
  return `0${num}`.slice(-2)
}

/**
 * Возвращает дату для фильтра в часовом поясе Москвы
 * @param {Date} date Конвертируемая дата
 * @returns {string} Дата ввиде строки
 */
module.exports = function getTimeString (date) {
  const mskTime = new Date(+date + mskTimezone + timezoneFix)

  const milliseconds = mskTime.getUTCMilliseconds()

  // 2000-01-01 01:00:00.123
  return [
    mskTime.getUTCFullYear(),
    '-',
    pad2(mskTime.getUTCMonth() + 1),
    '-',
    pad2(mskTime.getUTCDate()),
    ' ',
    pad2(mskTime.getUTCHours()),
    ':',
    pad2(mskTime.getUTCMinutes()),
    ':',
    pad2(mskTime.getUTCSeconds()),
    milliseconds !== 0 ? `.${milliseconds}` : ''
  ].join('')
}
