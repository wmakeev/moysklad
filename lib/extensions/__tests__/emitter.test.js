'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var test = require('blue-tape');
var EventEmitter = require('events');

var Moysklad = require('../../');
var EmitterStamp = require('../emitter');

var PRODUCT_ID = '8dff01c6-e06d-413c-a38f-6139eaf4c2c7';

var ExtendedMoysklad = Moysklad.compose(EmitterStamp);

test.skip('Moysklad emitter (extension)', function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(t) {
    var emitter, ms, emitted;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            emitter = new EventEmitter();
            ms = ExtendedMoysklad({ eventEmitter: emitter });
            emitted = false;

            emitter.on('request', function (data) {
              // console.log(data.uri)
              emitted = true;
            });

            _context.next = 6;
            return ms.GET(['entity/product', PRODUCT_ID]);

          case 6:

            t.true(emitted, 'client should emit request events');

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
//# sourceMappingURL=emitter.test.js.map