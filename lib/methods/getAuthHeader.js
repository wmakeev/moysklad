'use strict';

/* global MOYSKLAD_LOGIN, MOYSKLAD_PASSWORD */

const base64encode = require('../tools/base64encode');

module.exports = function getAuthHeader() {
  let login;
  let password;
  let options = this.getOptions();

  if (options.login && options.password) {
    login = options.login;
    password = options.password;
  } else if (process && process.env && process.env.MOYSKLAD_LOGIN && process.env.MOYSKLAD_PASSWORD) {
    login = process.env.MOYSKLAD_LOGIN;
    password = process.env.MOYSKLAD_PASSWORD;
  } else if (MOYSKLAD_LOGIN && MOYSKLAD_PASSWORD) {
    login = MOYSKLAD_LOGIN;
    password = MOYSKLAD_PASSWORD;
  } else {
    return null;
  }

  return 'Basic ' + base64encode(`${login}:${password}`);
};
//# sourceMappingURL=getAuthHeader.js.map