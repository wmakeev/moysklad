'use strict';

const have = require('../have');

module.exports = function PUT() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  var _have$strict = have.strict(args, [{
    path: 'str or str arr',
    payload: 'Object',
    query: 'opt Object',
    options: 'opt Object'
  }, have.argumentsObject]);

  let path = _have$strict.path,
      payload = _have$strict.payload,
      query = _have$strict.query;
  var _have$strict$options = _have$strict.options;
  let options = _have$strict$options === undefined ? {} : _have$strict$options;


  let uri = this.buildUri(path, query);
  let fetchOptions = {
    method: 'PUT',
    body: JSON.stringify(payload)
  };

  return this.fetchUri(uri, Object.assign({}, options, fetchOptions));
};
//# sourceMappingURL=PUT.js.map