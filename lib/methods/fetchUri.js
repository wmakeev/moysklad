'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var have = require('../have');
var getResponseError = require('../getResponseError');
var errorsHttp = require('../errorsHttp');

module.exports = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(uri) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var fetchOptions,
        authHeader,
        response,
        contentType,
        responseJson,
        error,
        _args = arguments;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            have.strict(_args, { uri: 'str', options: 'opt Object' });

            fetchOptions = {
              method: options.method || 'GET',
              headers: {
                'Content-Type': 'application/json'
              },
              credentials: 'include'
            };
            authHeader = this.getAuthHeader();

            if (authHeader) {
              fetchOptions.headers.Authorization = this.getAuthHeader();
            }

            if (options.body != null && options.method && options.method !== 'GET') {
              fetchOptions.body = options.body;
            }

            /** @type {Response} */
            _context.next = 7;
            return this.fetch(uri, fetchOptions);

          case 7:
            response = _context.sent;
            contentType = void 0, responseJson = void 0, error = void 0;


            if (response.headers.has('Content-Type')) {
              contentType = response.headers.get('Content-Type');
            }

            if (!(contentType && contentType.indexOf('application/json') !== -1)) {
              _context.next = 19;
              break;
            }

            _context.next = 13;
            return response.json();

          case 13:
            responseJson = _context.sent;

            error = getResponseError(responseJson);

            if (!error) {
              _context.next = 17;
              break;
            }

            throw error;

          case 17:
            _context.next = 26;
            break;

          case 19:
            if (response.ok) {
              _context.next = 26;
              break;
            }

            // обработка ошибок http
            error = errorsHttp[response.status.toString()];

            if (!error) {
              _context.next = 25;
              break;
            }

            throw new Error(error);

          case 25:
            throw new Error('Http error: ' + response.status + ' ' + response.statusText);

          case 26:
            return _context.abrupt('return', responseJson);

          case 27:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  function fetchUri(_x) {
    return _ref.apply(this, arguments);
  }

  return fetchUri;
}();
//# sourceMappingURL=fetchUri.js.map