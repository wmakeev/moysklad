// TODO Переместить тесты на прямые методы (tools)

'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var test = require('blue-tape');
var Moysklad = require('../../');
var loadPositions = require('../loadPositions');

var ORDER_ID = '94510b32-23b3-4167-babf-34463f8a719d';
var POSITIONS_COUNT = 89;
var OFFSET = 29;
var LIMIT = 20;

var uniqCount = function uniqCount(items) {
  return [].concat(_toConsumableArray(new Set(items))).length;
};

var ExtendedMoysklad = Moysklad.compose(loadPositions);

test('Moysklad#loadPositions method (extension)', function (t) {
  var ms = ExtendedMoysklad();
  t.ok(ms.loadPositions, 'should add `loadPositions` method');
  t.end();
});

test('Moysklad#loadPositions method extension (one request)', function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(t) {
    var ms, positions;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            ms = ExtendedMoysklad();


            t.ok(ms.loadPositions, 'should add `loadPositions` method');

            _context.next = 4;
            return ms.loadPositions('customerorder', ORDER_ID, { limit: 100 });

          case 4:
            positions = _context.sent;


            t.true(positions instanceof Array, 'should return positions array');

            t.equals(positions.length, POSITIONS_COUNT, 'should return ' + POSITIONS_COUNT + ' positions');

            t.equal(uniqCount(positions.map(function (p) {
              return p.id;
            })), POSITIONS_COUNT, 'should return ' + POSITIONS_COUNT + ' uniq positions');

          case 8:
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

test('Moysklad#loadPositions (several requests)', function () {
  var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(t) {
    var ms, positions;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            ms = ExtendedMoysklad();
            _context2.next = 3;
            return ms.loadPositions('customerorder', ORDER_ID, { limit: LIMIT });

          case 3:
            positions = _context2.sent;


            t.true(positions instanceof Array, 'should return positions array');

            t.equals(positions.length, POSITIONS_COUNT, 'should return ' + POSITIONS_COUNT + ' positions');

            t.equal(uniqCount(positions.map(function (p) {
              return p.id;
            })), POSITIONS_COUNT, 'should return ' + POSITIONS_COUNT + ' uniq positions');

          case 7:
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

test('Moysklad#loadPositions (several requests with start offset)', function () {
  var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(t) {
    var ms, positions;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            ms = ExtendedMoysklad();
            _context3.next = 3;
            return ms.loadPositions('customerorder', ORDER_ID, {
              offset: OFFSET, limit: LIMIT
            });

          case 3:
            positions = _context3.sent;


            t.true(positions instanceof Array, 'should return positions array');

            t.equals(positions.length, POSITIONS_COUNT - OFFSET, 'should return ' + (POSITIONS_COUNT - OFFSET) + ' positions');

            t.equal(uniqCount(positions.map(function (p) {
              return p.id;
            })), POSITIONS_COUNT - OFFSET, 'should return ' + (POSITIONS_COUNT - OFFSET) + ' uniq positions');

          case 7:
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
//# sourceMappingURL=loadPositions.test.js.map