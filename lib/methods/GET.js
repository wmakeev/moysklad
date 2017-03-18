'use strict';

const have = require('../have');

module.exports = function GET() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  var _have$strict = have.strict(args, [{ path: 'str or str arr', query: 'opt Object', options: 'opt Object' }, have.argumentsObject]);

  let path = _have$strict.path,
      query = _have$strict.query;
  var _have$strict$options = _have$strict.options;
  let options = _have$strict$options === undefined ? {} : _have$strict$options;


  let uri = this.buildUri(path, query);

  return this.fetchUri(uri, Object.assign({}, options, { method: 'GET' }));
};
//# sourceMappingURL=GET.js.map