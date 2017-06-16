'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

const have = require('../have');

module.exports = function DELETE() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  var _have$strict = have.strict(args, [{ path: 'str or str arr', options: 'opt Object' }, have.argumentsObject]);

  let path = _have$strict.path;
  var _have$strict$options = _have$strict.options;
  let options = _have$strict$options === undefined ? {} : _have$strict$options;


  let uri = this.buildUrl(path);

  return this.fetchUrl(uri, _extends({}, options, { method: 'DELETE', rawResponse: true }));
};
//# sourceMappingURL=DELETE.js.map