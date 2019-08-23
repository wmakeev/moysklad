'use strict'

/* global MOYSKLAD_LOGIN, MOYSKLAD_PASSWORD */
/* eslint no-undef:0 */

const base64encode = require('@wmakeev/base64encode')

const bearerAuth = token => `Bearer ${token}`
const basicAuth = (login, password) => 'Basic ' + base64encode(`${login}:${password}`)

const getEnvKey = (() => {
  if (
    typeof process !== 'undefined' &&
    process.env
  ) {
    return key => process.env[key]
  } else {
    return () => null
  }
})()

module.exports = function getAuthHeader () {
  let token
  let login
  let password

  const options = this.getOptions()

  switch (true) {
    case options.token != null:
      token = options.token
      break

    case options.login != null:
      login = options.login
      password = options.password
      break

    case getEnvKey('MOYSKLAD_TOKEN') != null:
      token = getEnvKey('MOYSKLAD_TOKEN')
      break

    case getEnvKey('MOYSKLAD_LOGIN') != null:
      login = getEnvKey('MOYSKLAD_LOGIN')
      password = getEnvKey('MOYSKLAD_PASSWORD')
      break

    case typeof MOYSKLAD_TOKEN !== 'undefined':
      token = MOYSKLAD_TOKEN
      break

    case typeof MOYSKLAD_LOGIN !== 'undefined':
      login = MOYSKLAD_LOGIN
      if (typeof MOYSKLAD_PASSWORD !== 'undefined') {
        password = MOYSKLAD_PASSWORD
      }
      break

    default:
      return undefined
  }

  if (token) {
    return bearerAuth(token)
  } else if (password) {
    return basicAuth(login, password)
  } else {
    throw new Error('Не указан пароль для доступа к API')
  }
}
