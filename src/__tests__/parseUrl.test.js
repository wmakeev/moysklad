'use strict'

const test = require('blue-tape')
const Moysklad = require('..')

test('Moysklad#parseUrl method', t => {
  let ms = Moysklad()
  let { endpoint, api, apiVersion } = ms.getOptions()

  let common = { endpoint, api, apiVersion }

  t.deepEqual(ms.parseUrl('https://online.moysklad.ru/api/remap/1.1/path/to/my/res'), {
    ...common,
    path: ['path', 'to', 'my', 'res'],
    query: {}
  })

  t.deepEqual(ms.parseUrl('https://online.moysklad.ru/api/remap/1.1/path/to/my/res?a=1&b=2&' +
    'a=one&c=&foo.bar=baz&filter=name%3Dfoo%3Bvalue%3Dbar'), {
    ...common,
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
  })

  t.deepEqual(ms.parseUrl('path/to/my/res'), {
    ...common,
    path: ['path', 'to', 'my', 'res'],
    query: {}
  })

  t.deepEqual(ms.parseUrl(['path', '/to//my/', 'res//']), {
    ...common,
    path: ['path', 'to', 'my', 'res'],
    query: {}
  })

  t.end()
})
