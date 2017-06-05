'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const have = require('../have');
const getResponseError = require('../getResponseError');
const errorsHttp = require('../errorsHttp');

module.exports = (() => {
  var _ref = _asyncToGenerator(function* (uri) {
    let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    have.strict(arguments, { url: 'url', options: 'opt Object' });

    // Специфические параметры (не передаются в опции fetch)
    let includeHeaders = false;
    let muteErrors = false;
    let emit = this.emitter ? this.emitter.emit.bind(this.emitter) : null;

    let fetchOptions = _extends({
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      redirect: 'manual'
    }, options);

    if (fetchOptions.includeHeaders) {
      includeHeaders = true;
      delete fetchOptions.includeHeaders;
    }
    if (fetchOptions.muteErrors) {
      muteErrors = true;
      delete fetchOptions.muteErrors;
    }

    let authHeader = this.getAuthHeader();
    if (authHeader) {
      fetchOptions.headers.Authorization = this.getAuthHeader();
    }

    if (emit) emit('request:start', { uri: uri, options: fetchOptions });
    /** @type {Response} */
    let response = yield this.fetch(uri, fetchOptions);

    let contentType, responseJson, error;

    if (emit) emit('response:head', { uri: uri, options: fetchOptions, response: response });
    if (response.headers.has('Content-Type')) {
      contentType = response.headers.get('Content-Type');
    }

    if (contentType && contentType.indexOf('application/json') !== -1) {
      // получение ответа сервера и обработка ошибок API
      responseJson = yield response.json();
      if (emit) emit('response:body', { uri: uri, options: fetchOptions, response: response, body: responseJson });
      error = getResponseError(responseJson);
    } else if (!response.ok) {
      // обработка ошибок http
      error = errorsHttp[response.status.toString()];
      error = new Error(error || `Http error: ${response.status} ${response.statusText}`);
    }

    if (error) {
      if (emit) emit('error', error);
      if (!muteErrors) throw error;
    }

    return includeHeaders ? [response.headers, responseJson, response] : responseJson;
  });

  function fetchUrl(_x2) {
    return _ref.apply(this, arguments);
  }

  return fetchUrl;
})();
//# sourceMappingURL=fetchUrl.js.map