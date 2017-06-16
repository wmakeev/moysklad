'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const test = require('blue-tape');
const Moysklad = require('..');

test('Moysklad#DELETE', (() => {
  var _ref = _asyncToGenerator(function* (t) {
    let ms = Moysklad();

    let internalorder;

    try {
      internalorder = yield ms.POST('entity/internalorder', {
        organization: {
          meta: {
            type: 'organization',
            href: ms.buildUrl('entity/organization/bf6bc7ce-444e-4fd2-9826-3134ce89c54b')
          }
        },
        positions: [{
          assortment: {
            meta: {
              type: 'product',
              href: ms.buildUrl(['entity/product/d29f9d08-30d1-11e7-7a34-5acf004eda99'])
            }
          },
          quantity: 1
        }, {
          assortment: {
            meta: {
              type: 'product',
              href: ms.buildUrl(['entity/product/d29f038e-30d1-11e7-7a34-5acf004eda8c'])
            }
          },
          quantity: 1
        }]
      }, { expand: 'positions' });

      t.equal(internalorder.positions.rows.length, 2, 'should create order with 2 positions');

      yield ms.POST(['entity/internalorder', internalorder.id, 'positions/delete'], internalorder.positions.rows.map(function (pos) {
        return { meta: pos.meta };
      }));
    } finally {
      if (internalorder) yield ms.DELETE(internalorder.meta.href);
    }
  });

  return function (_x) {
    return _ref.apply(this, arguments);
  };
})());
//# sourceMappingURL=DELETE.test.js.map