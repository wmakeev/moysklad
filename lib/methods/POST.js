'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

const have = require('../have');

module.exports = function POST() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  // TODO Test payload: 'Object or Object arr'
  var _have$strict = have.strict(args, [{
    path: 'str or str arr',
    payload: 'opt Object or Object arr',
    query: 'opt Object',
    options: 'opt Object'
  }, have.argumentsObject]);

  let path = _have$strict.path,
      payload = _have$strict.payload,
      query = _have$strict.query;
  var _have$strict$options = _have$strict.options;
  let options = _have$strict$options === undefined ? {} : _have$strict$options;


  let uri = this.buildUrl(path, query);
  let fetchOptions = { method: 'POST' };
  if (payload) fetchOptions.body = JSON.stringify(payload);

  return this.fetchUrl(uri, _extends({}, options, fetchOptions));
};
//# sourceMappingURL=POST.js.map