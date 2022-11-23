const { MoyskladError } = require('../errors')
const getEnvVar = require('../getEnvVar')

/**
 * @deprecated Работать с датами нужно в UTC либо преобразовывать
 * вне библиотеки
 */
module.exports = function getTimezoneShift() {
  const localTimeZoneOffset = -(new Date().getTimezoneOffset() * 60 * 1000)

  /** Локальная временная зона в мс */
  let timeZoneMs = localTimeZoneOffset

  /** Временная зона приложения (часовой пояс в минутах) */
  const MOYSKLAD_TIMEZONE = getEnvVar('MOYSKLAD_TIMEZONE')

  if (MOYSKLAD_TIMEZONE) {
    const tz = Number.parseInt(MOYSKLAD_TIMEZONE) * 60 * 1000

    if (Number.isNaN(tz)) {
      throw new MoyskladError(
        'Некорректно указана переменная окружения MOYSKLAD_TIMEZONE' +
          ` - ${MOYSKLAD_TIMEZONE}` // TODO Ссылка на документацию
      )
    }

    timeZoneMs = tz
  }

  return localTimeZoneOffset - timeZoneMs
}
