'use strict'

const test = require('blue-tape')
const fetch = require('node-fetch')

const Moysklad = require('../..')

test('Moysklad#parseUrl method', t => {
  const ms = Moysklad({ fetch })
  const { endpoint, api, apiVersion } = ms.getOptions()

  const common = { endpoint, api, apiVersion }

  t.deepEqual(
    ms.parseUrl('https://online.moysklad.ru/api/remap/1.1/path/to/my/res'),
    {
      ...common,
      path: ['path', 'to', 'my', 'res'],
      query: {}
    }
  )

  t.deepEqual(
    ms.parseUrl('https://online.moysklad.ru/api/phone/1.0/path/to/my/res'),
    {
      ...common,
      api: 'phone',
      apiVersion: '1.0',
      path: ['path', 'to', 'my', 'res'],
      query: {}
    }
  )

  t.deepEqual(
    ms.parseUrl(
      'https://online.moysklad.ru/api/remap/1.1/path/to/my/res?a=1&b=2&' +
        'a=one&c=&foo.bar=baz&filter=name%3Dfoo%3Bvalue%3Dbar'
    ),
    {
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
    }
  )

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

  t.throws(() => {
    ms.parseUrl('https://foo.ru/bar/baz')
  }, /Url не соответсвует/)

  t.throws(() => {
    ms.parseUrl('https://online.moysklad.ru/api/remap/1.1')
  }, /Url не соответсвует/)

  t.throws(() => {
    ms.parseUrl('https://online.moysklad.ru/remap/1.1/path')
  }, /Url не соответсвует/)

  t.end()
})
