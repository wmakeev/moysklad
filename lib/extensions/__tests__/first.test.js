'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var test = require('blue-tape');
var Moysklad = require('../..');
var first = require('../first');

var PRODUCT_ID = '8dff01c6-e06d-413c-a38f-6139eaf4c2c7';
var PRODUCT_NAME = 'Тест 9999+';

var ExtendedMoysklad = Moysklad.compose(first);

test('Moysklad#first method (extension)', function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(t) {
    var ms, product;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            ms = ExtendedMoysklad();


            t.ok(ms.first, 'should add `first` method');

            // TODO Почему не работает с product?
            // https://support.moysklad.ru/hc/ru/articles/214273398/comments/115000266047
            _context.next = 4;
            return ms.first('entity/assortment', { filter: { id: PRODUCT_ID } });

          case 4:
            product = _context.sent;


            t.ok(product, 'should return first item from collection.rows');
            t.equals(product.name, PRODUCT_NAME, 'should return first product for "entity/assortment" path');

          case 7:
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
//# sourceMappingURL=first.test.js.map