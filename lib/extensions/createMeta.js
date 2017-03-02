'use strict';

var stampit = require('stampit');
var have = require('../have');

function createMeta() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  var _have$strict = have.strict(args, [{ type: 'str', path: 'str or str arr' }, have.argumentsObject]),
      type = _have$strict.type,
      path = _have$strict.path;

  return {
    href: this.buildUri(path),
    type: type,
    mediaType: 'application/json'
  };
}

module.exports = stampit.init(function () {
  this.createMeta = createMeta.bind(this);
});
//# sourceMappingURL=createMeta.js.map