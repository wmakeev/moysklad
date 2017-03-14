'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var test = require('blue-tape');
var Moysklad = require('..');
// const sleep = require('../tools/sleep')

// const PRODUCT_ID = '8dff01c6-e06d-413c-a38f-6139eaf4c2c7'
// const PRODUCT_NAME = 'Тест 9999+'

// const PRODUCT_ID_LIST = [
//   '1a675fb4-5df2-11e5-90a2-8ecb0008e7d8',
//   '1a660c84-5df2-11e5-90a2-8ecb0008e7be',
//   '1a5f4f7f-5df2-11e5-90a2-8ecb0008e749',
//   '1a607140-5df2-11e5-90a2-8ecb0008e756',
//   '1a612644-5df2-11e5-90a2-8ecb0008e763',
//   '1a61e09e-5df2-11e5-90a2-8ecb0008e770',
//   '1a628f5a-5df2-11e5-90a2-8ecb0008e77d',
//   '1a634466-5df2-11e5-90a2-8ecb0008e78a',
//   '1a63f958-5df2-11e5-90a2-8ecb0008e797',
//   '1a64b216-5df2-11e5-90a2-8ecb0008e7a4'
// ]

test('Moysklad constructor', function (t) {
  t.ok(Moysklad);
  t.end();
});

test('Moysklad static methods', function (t) {
  t.equals(_typeof(Moysklad.getTimeString), 'function');
  t.end();
});

test('Moysklad instance methods', function (t) {
  var ms = Moysklad();
  t.ok(ms);
  t.equals(_typeof(ms.getOptions), 'function');
  t.equals(_typeof(ms.getAuthHeader), 'function');
  t.equals(_typeof(ms.fetchUri), 'function');
  t.equals(_typeof(ms.buildUri), 'function');
  t.equals(_typeof(ms.parseUri), 'function');
  t.equals(_typeof(ms.GET), 'function');
  t.equals(_typeof(ms.POST), 'function');
  t.equals(_typeof(ms.PUT), 'function');
  t.equals(_typeof(ms.DELETE), 'function');
  t.end();
});

test('Create Moysklad instance with options', function (t) {
  var options = {
    login: 'login',
    password: 'password'
  };

  var ms = Moysklad(options);
  var msOptions = ms.getOptions();

  t.true(msOptions !== options);
  t.equals(msOptions.login, 'login');
  t.equals(msOptions.password, 'password');

  t.end();
});

test('Create Moysklad instance methods', function (t) {
  var ms = Moysklad({
    login: 'login',
    password: 'password'
  });
  t.ok(ms);
  t.end();
});

test('Moysklad#buildUri method', function (t) {
  var ms = Moysklad();

  t.equals(ms.buildUri(['/path/', 'To//My', 'Res/']), 'https://online.moysklad.ru/api/remap/1.1/path/to/my/res');

  t.equals(ms.buildUri(['path', 'to', 'res'], {
    a: 1,
    b: 'tow',
    c: true,
    d: [1, '2']
  }), 'https://online.moysklad.ru/api/remap/1.1/path/to/res?a=1&b=tow&c=true&d=1&d=2');

  t.equals(ms.buildUri(['path', 'to', 'res'], {
    a: 1,
    filter: { name: 'foo', value: { $eq: 'bar' } }
  }), 'https://online.moysklad.ru/api/remap/1.1/path/to/res?a=1&filter=name%3Dfoo%3Bvalue%3Dbar');

  t.end();
});

test('Moysklad#parseUri method', function (t) {
  var ms = Moysklad();

  var _ms$getOptions = ms.getOptions(),
      endpoint = _ms$getOptions.endpoint,
      api = _ms$getOptions.api,
      apiVersion = _ms$getOptions.apiVersion;

  var common = { endpoint: endpoint, api: api, apiVersion: apiVersion };

  t.deepEqual(ms.parseUri('https://online.moysklad.ru/api/remap/1.1/path/to/my/res'), Object.assign({}, common, {
    path: ['path', 'to', 'my', 'res'],
    query: undefined
  }));

  t.deepEqual(ms.parseUri('https://online.moysklad.ru/api/remap/1.1/path/to/my/res?a=1&b=2&' + 'a=one&c=&foo.bar=baz&filter=name%3Dfoo%3Bvalue%3Dbar'), Object.assign({}, common, {
    path: ['path', 'to', 'my', 'res'],
    query: {
      a: [1, 'one'],
      b: 2,
      c: null,
      'foo.bar': 'baz',
      filter: 'name=foo;value=bar'
      // TODO Filter parsing
      // filter: {
      //   name: 'foo',
      //   value: 'bar'
      // }
    }
  }));

  t.end();
});

test('Moysklad#GET method', function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(t) {
    var ms, counterparties, _ref2, _ref3, employee, group;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            ms = Moysklad();
            _context.next = 3;
            return ms.GET('entity/counterparty', { limit: 1 });

          case 3:
            counterparties = _context.sent;

            t.equals(typeof counterparties === 'undefined' ? 'undefined' : _typeof(counterparties), 'object', 'should return object');
            t.ok(counterparties.rows instanceof Array, 'should return counterparties collection');

            _context.next = 8;
            return Promise.all([ms.fetchUri(counterparties.context.employee.meta.href), ms.fetchUri(counterparties.rows[0].group.meta.href)]);

          case 8:
            _ref2 = _context.sent;
            _ref3 = _slicedToArray(_ref2, 2);
            employee = _ref3[0];
            group = _ref3[1];


            t.equals(typeof employee === 'undefined' ? 'undefined' : _typeof(employee), 'object', 'Moysklad#fetchUri method should fetch employee object by href');

            t.equals(typeof group === 'undefined' ? 'undefined' : _typeof(group), 'object', 'Moysklad#fetchUri method should fetch group object by href');

          case 14:
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

test('Moysklad#POST/PUT/DELETE', function () {
  var _ref4 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(t) {
    var ms, code, product, newProduct;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            ms = Moysklad();
            code = 'test-' + Date.now();
            product = {
              name: 'TEST-' + Date.now(),
              code: code,
              attributes: [{
                id: '0008b3f4-1897-11e3-d76c-7054d21a8d1e',
                name: 'Вид товара',
                value: {
                  name: 'Рюкзак'
                }
              }, {
                id: 'f4c073c5-1bcc-4d91-8b41-ed825495b677',
                name: 'Бренд',
                value: {
                  name: 'No Brand'
                }
              }, {
                id: '71f17086-1a7f-47f1-b447-59b71351bfad',
                name: 'Сезон',
                value: {
                  name: '02 Осень/Зима'
                }
              }, {
                id: 'b4bee095-4278-4147-95e0-0328c9207be0',
                name: 'Вид номенклатуры',
                value: {
                  name: 'Товары в обороте'
                }
              }]
            };
            _context2.next = 5;
            return ms.POST('entity/product', product);

          case 5:
            newProduct = _context2.sent;


            t.ok(newProduct, 'POST should create new entity');
            t.equals(newProduct.name, product.name, 'new entity name should equals');
            t.equals(newProduct.code, code, 'new entity name should have some property');

            code = 'test-' + Date.now();
            _context2.next = 12;
            return ms.PUT(['entity/product', newProduct.id], { code: code });

          case 12:
            newProduct = _context2.sent;


            t.ok(newProduct, 'PUT should update entity');
            t.equals(newProduct.code, code, 'updated entity field should be equal');

            _context2.next = 17;
            return ms.DELETE(['entity/product', newProduct.id]);

          case 17:
            _context2.next = 19;
            return t.shouldFail(function () {
              return ms.GET(['entity/product', newProduct.id]);
            }(), /не найден/i);

          case 19:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, undefined);
  }));

  return function (_x2) {
    return _ref4.apply(this, arguments);
  };
}());
//# sourceMappingURL=index.test.js.map