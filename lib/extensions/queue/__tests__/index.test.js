'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var test = require('blue-tape');
var Moysklad = require('../../..');
var sleep = require('../../../tools/sleep');

var QueueStamp = require('..');
var ExtendedMoysklad = Moysklad.compose(QueueStamp);

var PRODUCT_ID = '8dff01c6-e06d-413c-a38f-6139eaf4c2c7';
var PRODUCT_NAME = 'Тест 9999+';

test('Moysklad queue', function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(t) {
    var ms, results, i;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            ms = ExtendedMoysklad({ queue: true });

            // Сделаем паузу после предыдущих тестов

            _context.next = 3;
            return sleep(1000);

          case 3:

            t.comment('should plan request to avoid 429 error');
            results = [];

            for (i = 1; i < 10; i++) {
              results.push(ms.GET(['entity/product', PRODUCT_ID]).then(function (p) {
                return p.name;
              }));
            }

            _context.next = 8;
            return Promise.all(results);

          case 8:
            results = _context.sent;


            t.ok(results.every(function (r) {
              return r === PRODUCT_NAME;
            }));

          case 10:
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
//# sourceMappingURL=index.test.js.map