'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var fs = require('fs');
var path = require('path');
var test = require('blue-tape');
var aggregateMetadata = require('../aggregateMetadata');
var model = require('../../../vendor/json-api-model');

var QueueStamp = require('../../../src/extensions/queue');
var Moysklad = require('../../../src');

test('aggregateMetadata is ok', function (t) {
  t.ok(aggregateMetadata);
  t.equals(typeof aggregateMetadata === 'undefined' ? 'undefined' : _typeof(aggregateMetadata), 'function');
  t.end();
});

test.skip('aggregateMetadata', function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(t) {
    var moysklad, metadata;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            moysklad = Moysklad.compose(QueueStamp).create({ queue: true });
            _context.next = 3;
            return aggregateMetadata(moysklad, model, {
              customEntityFilter: function customEntityFilter(entName) {
                return !['Бренды', 'Города'].includes(entName);
              }
            });

          case 3:
            metadata = _context.sent;


            t.ok(metadata, 'should return metadata');
            fs.writeFileSync(path.resolve('_temp/aggregatedMetadata.json'), JSON.stringify(metadata, null, 2));

          case 6:
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
//# sourceMappingURL=aggregateMetadata.test.js.map