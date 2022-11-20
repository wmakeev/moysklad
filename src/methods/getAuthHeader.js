'use strict'

const { MoyskladError } = require('../errors')

/* global MOYSKLAD_LOGIN, MOYSKLAD_PASSWORD */
/* eslint no-undef:0 no-unused-vars:0 */

const base64encode = require('@wmakeev/base64encode')

const getEnvVar = require('../getEnvVar')

const bearerAuth = token => `Bearer ${token}`
const basicAuth = (login, password) =>
  'Basic ' + base64encode(`${login}:${password}`)

module.exports = function getAuthHeader() {
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

    case getEnvVar('MOYSKLAD_TOKEN') != null:
      token = getEnvVar('MOYSKLAD_TOKEN')
      break

    case getEnvVar('MOYSKLAD_LOGIN') != null:
      login = getEnvVar('MOYSKLAD_LOGIN')
      password = getEnvVar('MOYSKLAD_PASSWORD')
      break

    default:
      return undefined
  }

  if (token) {
    return bearerAuth(token)
  } else if (password) {
    return basicAuth(login, password)
  } else {
    throw new MoyskladError('Не указан пароль для доступа к API')
  }
}
