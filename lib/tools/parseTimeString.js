'use strict';

// https://regex101.com/r/Bxq7dZ/2

const MS_TIME_REGEX = new RegExp(/^(\d{4})-(\d{2})-(\d{2})\s(\d{2}):(\d{2}):(\d{2})(?:\.(\d{3}))?$/);

/**
 * Преобразует строку времени МойСклад в объект даты (с учетом временной зоны)
 * @param {string} timeString Время в формате МойСклад ("2017-04-08 13:33:00.123")
 * @returns {Date} Дата
 */
module.exports = function parseTimeString(timeString) {
  // 2017-04-08 13:33:00.123
  let m = MS_TIME_REGEX.exec(timeString);
  if (!m || m.length < 7 || m.length > 8) {
    throw new Error(`Некорректный формат даты "${timeString}"`);
  }
  return new Date(`${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}${m[7] ? '.' + m[7] : ''}+03:00`);
};
//# sourceMappingURL=parseTimeString.js.map