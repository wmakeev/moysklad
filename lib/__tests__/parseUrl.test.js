'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

const test = require('blue-tape');
const Moysklad = require('..');

test('Moysklad#parseUrl method', t => {
  let ms = Moysklad();

  var _ms$getOptions = ms.getOptions();

  let endpoint = _ms$getOptions.endpoint,
      api = _ms$getOptions.api,
      apiVersion = _ms$getOptions.apiVersion;


  let common = { endpoint: endpoint, api: api, apiVersion: apiVersion };

  t.deepEqual(ms.parseUrl('https://online.moysklad.ru/api/remap/1.1/path/to/my/res'), _extends({}, common, {
    path: ['path', 'to', 'my', 'res'],
    query: {}
  }));

  t.deepEqual(ms.parseUrl('https://online.moysklad.ru/api/remap/1.1/path/to/my/res?a=1&b=2&' + 'a=one&c=&foo.bar=baz&filter=name%3Dfoo%3Bvalue%3Dbar'), _extends({}, common, {
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

  t.deepEqual(ms.parseUrl('path/to/my/res'), _extends({}, common, {
    path: ['path', 'to', 'my', 'res'],
    query: {}
  }));

  t.deepEqual(ms.parseUrl(['path', '/to//my/', 'res//']), _extends({}, common, {
    path: ['path', 'to', 'my', 'res'],
    query: {}
  }));

  t.end();
});
//# sourceMappingURL=parseUrl.test.js.map