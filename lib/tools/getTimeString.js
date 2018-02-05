'use strict';

const MSK_TIMEZONE_OFFSET = 180 * 60 * 1000;

/**
 * Возвращает дату для фильтра в часовом поясе Москвы
 * @param {Date} date Конвертируемая дата
 * @param {boolean} includeMs Отображать миллисекунды
 * @returns {string} Дата ввиде строки
 */
module.exports = function getTimeString(date, includeMs) {
  let mskTime = new Date(+date + MSK_TIMEZONE_OFFSET);

  return mskTime.toJSON().replace('T', ' ').replace(includeMs ? /Z$/ : /(\.\d{3})?Z$/, '');
};
//# sourceMappingURL=getTimeString.js.map