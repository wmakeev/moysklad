'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const defaultsDeep = require('lodash.defaultsdeep');

const have = require('../have');
const getResponseError = require('../getResponseError');

module.exports = (() => {
  var _ref = _asyncToGenerator(function* (uri) {
    let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    have.strict(arguments, { url: 'url', options: 'opt Object' });

    let resBodyJson, error;

    // Специфические параметры (не передаются в опции fetch)
    let rawResponse = false;
    let muteErrors = false;

    let emit = this.emitter ? this.emitter.emit.bind(this.emitter) : null;

    let fetchOptions = defaultsDeep(_extends({}, options), {
      headers: {
        'Content-Type': 'application/json'
      },
      redirect: 'manual'
    });

    if (!fetchOptions.headers.Authorization) {
      fetchOptions.credentials = 'include';
    }

    // получаем специфичные параметры
    if (fetchOptions.rawResponse) {
      rawResponse = true;
      delete fetchOptions.rawResponse;
    }
    if (fetchOptions.muteErrors) {
      muteErrors = true;
      delete fetchOptions.muteErrors;
    }
    if (fetchOptions.millisecond) {
      fetchOptions.headers['X-Lognex-Format-Millisecond'] = 'true';
      delete fetchOptions.millisecond;
    }

    let authHeader = this.getAuthHeader();
    if (authHeader) {
      fetchOptions.headers.Authorization = this.getAuthHeader();
    }

    if (emit) emit('request', { uri: uri, options: fetchOptions });

    /** @type {Response} */
    let response = yield this.fetch(uri, fetchOptions);

    if (emit) emit('response', { uri: uri, options: fetchOptions, response: response });

    if (rawResponse && muteErrors) return response;

    if (!response.ok) {
      error = new Error(`${response.status} ${response.statusText}`);
    } else if (rawResponse) {
      return response;
    }

    // разбираем тело запроса
    if (response.headers.has('Content-Type') && response.headers.get('Content-Type').indexOf('application/json') !== -1) {
      // response.json() может вызвать ошибку, если тело ответа пустое
      try {
        resBodyJson = yield response.json();
      } catch (e) {}

      if (emit) emit('response:body', { uri: uri, options: fetchOptions, response: response, body: resBodyJson });
      error = getResponseError(resBodyJson) || error;
    }

    if (error && !muteErrors) {
      if (emit) emit('error', error);
      throw error;
    }

    return rawResponse ? response : resBodyJson;
  });

  function fetchUrl(_x2) {
    return _ref.apply(this, arguments);
  }

  return fetchUrl;
})();
//# sourceMappingURL=fetchUrl.js.map