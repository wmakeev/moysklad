'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const test = require('blue-tape');
const getResponseError = require('../getResponseError');

const createFooError = (message, code) => ({
  meta: {
    type: 'entity'
  },
  code: code,
  error: message,
  moreInfo: 'https://path/to/info',
  parameter: 'foo',
  column: 10,
  line: 1
});

test('getResponseError (empty response)', (() => {
  var _ref = _asyncToGenerator(function* (t) {
    t.equal(getResponseError(), null, 'should to be null');
    t.equal(getResponseError({}), null, 'should to be null');
    t.equal(getResponseError([{}]), null, 'should to be null');
  });

  return function (_x) {
    return _ref.apply(this, arguments);
  };
})());

test('getResponseError (multi error response)', (() => {
  var _ref2 = _asyncToGenerator(function* (t) {
    let resp = {
      errors: [createFooError('Ошибка 1', 1000), createFooError('Ошибка 2', 2000)]
    };

    let error = getResponseError(resp);

    t.equal(error.message, 'Ошибка 1', 'should set error message');
    t.equal(error.code, 1000, 'should set error code');
    t.equal(error.moreInfo, 'https://path/to/info', 'should set error moreInfo');
    t.equal(error.errors.length, 2, 'should set errors array');
  });

  return function (_x2) {
    return _ref2.apply(this, arguments);
  };
})());

test('getResponseError (single error response)', (() => {
  var _ref3 = _asyncToGenerator(function* (t) {
    let resp = {
      errors: [createFooError('Ошибка 1', 1000)]
    };

    let error = getResponseError(resp);

    t.equal(error.message, 'Ошибка 1', 'should set error message');
    t.notOk(error.errors, 'should set errors array');
  });

  return function (_x3) {
    return _ref3.apply(this, arguments);
  };
})());

test('getResponseError (multi error batch response)', (() => {
  var _ref4 = _asyncToGenerator(function* (t) {
    let resp = [{ foo: 'bar1' }, {
      errors: [createFooError('Ошибка 11', 1100), createFooError('Ошибка 12', 1200)]
    }, { foo: 'bar2' }, {
      errors: [createFooError('Ошибка 21', 2100)]
    }];

    let error = getResponseError(resp);

    t.equal(error.message, 'Ошибка 11', 'should set error message');
    t.equal(error.code, 1100, 'should set error code');
    t.equal(error.moreInfo, 'https://path/to/info', 'should set error moreInfo');
    t.equal(error.errors.length, 2, 'should set errors array');
  });

  return function (_x4) {
    return _ref4.apply(this, arguments);
  };
})());
//# sourceMappingURL=getResponseError.test.js.map