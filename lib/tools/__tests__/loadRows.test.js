// TODO Переместить тесты на прямые методы (tools)

'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var test = require('blue-tape');
var Moysklad = require('../../');
var loadRows = require('../loadRows');

var ORDER_LARGE_ID = 'dd5d3aff-08d6-11e7-7a69-97110015919e';
var POSITIONS_LARGE_COUNT = 333;

var ORDER_SMALL_ID = '94510b32-23b3-4167-babf-34463f8a719d';
var POSITIONS_SMALL_COUNT = 89;

var uniqCount = function uniqCount(items) {
  return [].concat(_toConsumableArray(new Set(items))).length;
};

test('loadRows method', function (t) {
  t.equal(typeof loadRows === 'undefined' ? 'undefined' : _typeof(loadRows), 'function', 'should be function');
  t.end();
});

// TODO Test throws on incorrect arguments?

test('loadRows returns rows from expanded collection', function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(t) {
    var ms, order, rows;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            ms = Moysklad();
            _context.next = 3;
            return ms.GET(['entity/customerorder', ORDER_SMALL_ID], { expand: 'positions' });

          case 3:
            order = _context.sent;

            t.ok(order.positions.rows, 'positions is expanded');

            _context.next = 7;
            return loadRows(ms, order.positions);

          case 7:
            rows = _context.sent;


            t.true(rows instanceof Array, 'should return rows array');

            t.equals(rows.length, POSITIONS_SMALL_COUNT, 'should return ' + POSITIONS_SMALL_COUNT + ' positions');
            t.equal(uniqCount(rows.map(function (p) {
              return p.id;
            })), POSITIONS_SMALL_COUNT, 'should return ' + POSITIONS_SMALL_COUNT + ' uniq positions');

          case 11:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function (_x) {
    return _ref.apply(this, arguments);
  };
}());

test('loadRows load and returns rows from not expanded collection', function () {
  var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(t) {
    var ms, order, rows;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            ms = Moysklad();
            _context2.next = 3;
            return ms.GET(['entity/customerorder', ORDER_SMALL_ID]);

          case 3:
            order = _context2.sent;
            _context2.next = 6;
            return loadRows(ms, order.positions);

          case 6:
            rows = _context2.sent;


            t.true(rows instanceof Array, 'should return rows array');

            t.equals(rows.length, POSITIONS_SMALL_COUNT, 'should return ' + POSITIONS_SMALL_COUNT + ' positions');
            t.equal(uniqCount(rows.map(function (p) {
              return p.id;
            })), POSITIONS_SMALL_COUNT, 'should return ' + POSITIONS_SMALL_COUNT + ' uniq positions');

          case 10:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, undefined);
  }));

  return function (_x2) {
    return _ref2.apply(this, arguments);
  };
}());

test('loadRows load and returns rows from not expanded collection (limit specified)', function () {
  var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(t) {
    var LIMIT, ms, order, rows;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            LIMIT = 33;
            ms = Moysklad();
            _context3.next = 4;
            return ms.GET(['entity/customerorder', ORDER_SMALL_ID]);

          case 4:
            order = _context3.sent;
            _context3.next = 7;
            return loadRows(ms, order.positions, { limit: LIMIT });

          case 7:
            rows = _context3.sent;


            t.true(rows instanceof Array, 'should return rows array');

            t.equals(rows.length, POSITIONS_SMALL_COUNT, 'should return ' + POSITIONS_SMALL_COUNT + ' positions');
            t.equal(uniqCount(rows.map(function (p) {
              return p.id;
            })), POSITIONS_SMALL_COUNT, 'should return ' + POSITIONS_SMALL_COUNT + ' uniq positions');

          case 11:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, undefined);
  }));

  return function (_x3) {
    return _ref3.apply(this, arguments);
  };
}());

test('loadRows returns from expanded collection and load others pages', function () {
  var _ref4 = _asyncToGenerator(regeneratorRuntime.mark(function _callee4(t) {
    var ms, order, rows;
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            ms = Moysklad();
            _context4.next = 3;
            return ms.GET(['entity/customerorder', ORDER_LARGE_ID], { expand: 'positions' });

          case 3:
            order = _context4.sent;
            _context4.next = 6;
            return loadRows(ms, order.positions);

          case 6:
            rows = _context4.sent;


            t.true(rows instanceof Array, 'should return rows array');

            t.equals(rows.length, POSITIONS_LARGE_COUNT, 'should return ' + POSITIONS_LARGE_COUNT + ' positions');
            t.equal(uniqCount(rows.map(function (p) {
              return p.id;
            })), POSITIONS_LARGE_COUNT, 'should return ' + POSITIONS_LARGE_COUNT + ' uniq positions');

          case 10:
          case 'end':
            return _context4.stop();
        }
      }
    }, _callee4, undefined);
  }));

  return function (_x4) {
    return _ref4.apply(this, arguments);
  };
}());

test('loadRows returns from expanded collection and load others pages (with offset) #1', function () {
  var _ref5 = _asyncToGenerator(regeneratorRuntime.mark(function _callee5(t) {
    var LIMIT, OFFSET, ms, order, rows;
    return regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            LIMIT = 55;
            OFFSET = 60;
            ms = Moysklad();
            _context5.next = 5;
            return ms.GET(['entity/customerorder', ORDER_LARGE_ID], { expand: 'positions' });

          case 5:
            order = _context5.sent;
            _context5.next = 8;
            return loadRows(ms, order.positions, {
              offset: OFFSET, limit: LIMIT
            });

          case 8:
            rows = _context5.sent;


            t.true(rows instanceof Array, 'should return positions array');

            t.equals(rows.length, POSITIONS_LARGE_COUNT - OFFSET, 'should return ' + (POSITIONS_LARGE_COUNT - OFFSET) + ' positions');

            t.equal(uniqCount(rows.map(function (p) {
              return p.id;
            })), POSITIONS_LARGE_COUNT - OFFSET, 'should return ' + (POSITIONS_LARGE_COUNT - OFFSET) + ' uniq positions');

          case 12:
          case 'end':
            return _context5.stop();
        }
      }
    }, _callee5, undefined);
  }));

  return function (_x5) {
    return _ref5.apply(this, arguments);
  };
}());

test('loadRows returns from expanded collection and load others pages (with offset) #2', function () {
  var _ref6 = _asyncToGenerator(regeneratorRuntime.mark(function _callee6(t) {
    var LIMIT, OFFSET, ms, order, rows;
    return regeneratorRuntime.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            LIMIT = 50;
            OFFSET = 133;
            ms = Moysklad();
            _context6.next = 5;
            return ms.GET(['entity/customerorder', ORDER_LARGE_ID], { expand: 'positions' });

          case 5:
            order = _context6.sent;
            _context6.next = 8;
            return loadRows(ms, order.positions, {
              offset: OFFSET, limit: LIMIT
            });

          case 8:
            rows = _context6.sent;


            t.true(rows instanceof Array, 'should return positions array');

            t.equals(rows.length, POSITIONS_LARGE_COUNT - OFFSET, 'should return ' + (POSITIONS_LARGE_COUNT - OFFSET) + ' positions');

            t.equal(uniqCount(rows.map(function (p) {
              return p.id;
            })), POSITIONS_LARGE_COUNT - OFFSET, 'should return ' + (POSITIONS_LARGE_COUNT - OFFSET) + ' uniq positions');

          case 12:
          case 'end':
            return _context6.stop();
        }
      }
    }, _callee6, undefined);
  }));

  return function (_x6) {
    return _ref6.apply(this, arguments);
  };
}());

// TODO проверить результат по заранее полученной эталонной коллекции
//# sourceMappingURL=loadRows.test.js.map