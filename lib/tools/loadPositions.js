'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var have = require('../have');
var loadRows = require('./loadRows');

module.exports = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
    var _have$strict,
        client,
        type,
        id,
        _have$strict$query,
        query,
        collection,
        _args = arguments;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _have$strict = have.strict(_args, [{ client: 'obj', type: 'str', id: 'str', query: 'opt obj' }, have.argumentsObject]), client = _have$strict.client, type = _have$strict.type, id = _have$strict.id, _have$strict$query = _have$strict.query, query = _have$strict$query === undefined ? {} : _have$strict$query;
            _context.next = 3;
            return client.GET(['entity', type, id, 'positions'], query);

          case 3:
            collection = _context.sent;
            _context.next = 6;
            return loadRows(client, collection, query);

          case 6:
            return _context.abrupt('return', _context.sent);

          case 7:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  function loadPositions() {
    return _ref.apply(this, arguments);
  }

  return loadPositions;
}();
//# sourceMappingURL=loadPositions.js.map