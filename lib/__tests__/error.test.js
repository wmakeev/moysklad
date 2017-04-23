'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const test = require('blue-tape');
const nodeFetch = require('node-fetch');
const Moysklad = require('..');

test.skip('Moysklad', (() => {
  var _ref = _asyncToGenerator(function* (t) {
    const ms = Moysklad({
      fetch: nodeFetch
    });

    let productsCollection = yield ms.GET('entity/product', {
      filter: {
        code: []
      }
    });

    let patch = productsCollection.rows.map(function (product) {
      return {
        id: product.id,
        buyPrice: {
          currency: {
            meta: {
              href: 'https://online.moysklad.ru/api/remap/1.1/entity/currency/' + '18dad23e-8263-45ea-b399-58b34d513aa7',
              metadataHref: 'https://online.moysklad.ru/api/remap/1.1/entity/currency/metadata',
              type: 'currency',
              mediaType: 'application/json'
            }
          },
          value: product.minPrice
        }
      };
    });

    let patched = yield ms.POST('entity/product', patch);

    console.log(patched.length);
  });

  return function (_x) {
    return _ref.apply(this, arguments);
  };
})());
//# sourceMappingURL=error.test.js.map