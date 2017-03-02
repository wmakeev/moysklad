'use strict'

const timeStringTailRegExp = /(?:\.\d+)?Z(?:.+)?$/
const mskTimezoneOffset = -120

/**
 * Возвращает дату для фильтра в часовом поясе Москвы
 * @param {Date} date Конвертируемая дата
 * @returns {string} Дата ввиде строки
 */
module.exports = function getTimeString (date) {
  let mskTime = new Date(+date - mskTimezoneOffset)

  return mskTime.toJSON()
    .replace('T', ' ')
    .replace(timeStringTailRegExp, '')
}
