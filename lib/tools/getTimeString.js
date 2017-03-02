'use strict';

var timeStringTailRegExp = /(?:\.\d+)?Z(?:.+)?$/;
var mskTimezoneOffset = -120;

/**
 * Возвращает дату для фильтра в часовом поясе Москвы
 * @param {Date} date Конвертируемая дата
 * @returns {string} Дата ввиде строки
 */
module.exports = function getTimeString(date) {
  var mskTime = new Date(+date - mskTimezoneOffset);

  return mskTime.toJSON().replace('T', ' ').replace(timeStringTailRegExp, '');
};
//# sourceMappingURL=getTimeString.js.map