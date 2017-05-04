'use strict'

/* global MOYSKLAD_LOGIN, MOYSKLAD_PASSWORD */

const base64encode = require('@wmakeev/base64encode')

module.exports = function getAuthHeader () {
  let login
  let password
  let options = this.getOptions()

  if (options.login && options.password) {
    login = options.login
    password = options.password
  } else if (typeof process !== 'undefined' && process.env && process.env.MOYSKLAD_LOGIN &&
    process.env.MOYSKLAD_PASSWORD) {
    login = process.env.MOYSKLAD_LOGIN
    password = process.env.MOYSKLAD_PASSWORD
  } else if (typeof MOYSKLAD_LOGIN !== 'undefined' && typeof MOYSKLAD_PASSWORD !== 'undefined') {
    login = MOYSKLAD_LOGIN
    password = MOYSKLAD_PASSWORD
  } else {
    return null
  }

  return 'Basic ' + base64encode(`${login}:${password}`)
}
