'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const test = require('blue-tape');
const Moysklad = require('..');

test('Moysklad constructor', t => {
  t.ok(Moysklad);
  t.end();
});

test('Moysklad static methods', t => {
  t.equals(typeof Moysklad.getTimeString, 'function');
  t.end();
});

test('Moysklad instance methods', t => {
  let ms = Moysklad();
  t.ok(ms);
  t.equals(typeof ms.getOptions, 'function');
  t.equals(typeof ms.getAuthHeader, 'function');
  t.equals(typeof ms.fetchUrl, 'function');
  t.equals(typeof ms.buildUrl, 'function');
  t.equals(typeof ms.parseUrl, 'function');
  t.equals(typeof ms.GET, 'function');
  t.equals(typeof ms.POST, 'function');
  t.equals(typeof ms.PUT, 'function');
  t.equals(typeof ms.DELETE, 'function');
  t.end();
});

test('Create Moysklad instance with options', t => {
  let options = {
    login: 'login',
    password: 'password'
  };

  let ms = Moysklad(options);
  t.ok(ms);

  let msOptions = ms.getOptions();
  t.true(msOptions !== options);
  t.equals(msOptions.login, 'login');
  t.equals(msOptions.password, 'password');

  t.end();
});

test('Moysklad#GET method', (() => {
  var _ref = _asyncToGenerator(function* (t) {
    let ms = Moysklad();

    let counterparties = yield ms.GET('entity/counterparty', { limit: 1 });
    t.equals(typeof counterparties, 'object', 'should return object');
    t.ok(counterparties.rows instanceof Array, 'should return counterparties collection');

    var _ref2 = yield Promise.all([ms.fetchUrl(counterparties.context.employee.meta.href), ms.fetchUrl(counterparties.rows[0].group.meta.href)]),
        _ref3 = _slicedToArray(_ref2, 2);

    let employee = _ref3[0],
        group = _ref3[1];


    t.equals(typeof employee, 'object', 'Moysklad#fetchUrl method should fetch employee object by href');

    t.equals(typeof group, 'object', 'Moysklad#fetchUrl method should fetch group object by href');
  });

  return function (_x) {
    return _ref.apply(this, arguments);
  };
})());

test('Moysklad#POST/PUT/DELETE', (() => {
  var _ref4 = _asyncToGenerator(function* (t) {
    let ms = Moysklad();

    let code = 'test-' + Date.now();
    let product = {
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

    let newProduct = yield ms.POST('entity/product', product);

    t.ok(newProduct, 'POST should create new entity');
    t.equals(newProduct.name, product.name, 'new entity name should equals');
    t.equals(newProduct.code, code, 'new entity name should have some property');

    code = 'test-' + Date.now();
    newProduct = yield ms.PUT(['entity/product', newProduct.id], { code: code });

    t.ok(newProduct, 'PUT should update entity');
    t.equals(newProduct.code, code, 'updated entity field should be equal');

    yield ms.DELETE(['entity/product', newProduct.id]);

    yield t.shouldFail(function () {
      return ms.GET(['entity/product', newProduct.id]);
    }(), /не найден/i);
  });

  return function (_x2) {
    return _ref4.apply(this, arguments);
  };
})());
//# sourceMappingURL=index.test.js.map