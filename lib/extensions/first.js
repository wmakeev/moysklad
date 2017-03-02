'use strict';

var first = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var _have$strict, path, query, _have$strict$options, options, collection;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _have$strict = have.strict(args, [{ path: 'str or str arr', query: 'opt Object', options: 'opt Object' }, have.argumentsObject]), path = _have$strict.path, query = _have$strict.query, _have$strict$options = _have$strict.options, options = _have$strict$options === undefined ? {} : _have$strict$options;
            _context.next = 3;
            return this.GET({
              path: path,
              query: Object.assign({}, query, { limit: 1 }),
              options: options
            });

          case 3:
            collection = _context.sent;

            if (!(collection && collection.rows)) {
              _context.next = 8;
              break;
            }

            return _context.abrupt('return', collection.rows[0]);

          case 8:
            throw new Error('first: response is not collection');

          case 9:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function first() {
    return _ref.apply(this, arguments);
  };
}();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var stampit = require('stampit');
var have = require('../have');

module.exports = stampit({
  methods: {
    first: first
  }
});
//# sourceMappingURL=first.js.map