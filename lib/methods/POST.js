'use strict';

var have = require('../have');

module.exports = function POST() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  // TODO Test payload: 'Object or Object arr'
  var _have$strict = have.strict(args, [{
    path: 'str or str arr',
    payload: 'Object or Object arr',
    query: 'opt Object',
    options: 'opt Object'
  }, have.argumentsObject]),
      path = _have$strict.path,
      payload = _have$strict.payload,
      query = _have$strict.query,
      _have$strict$options = _have$strict.options,
      options = _have$strict$options === undefined ? {} : _have$strict$options;

  var uri = this.buildUri(path, query);
  var fetchOptions = {
    method: 'POST',
    body: JSON.stringify(payload)
  };

  return this.fetchUri(uri, Object.assign({}, options, fetchOptions));
};
//# sourceMappingURL=POST.js.map