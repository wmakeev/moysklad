'use strict'

const test = require('tape')
const { fetch } = require('undici')

const Moysklad = require('..')

test('Moysklad#buildUrl method', t => {
  const ms = Moysklad({ fetch })

  t.equals(
    ms.buildUrl('/path/To//My/Res/'),
    'https://api.moysklad.ru/api/remap/1.2/path/To/My/Res'
  )

  // TODO deprecated
  t.equals(
    ms.buildUrl(['/path/', 'To//My', 'Res/']),
    'https://api.moysklad.ru/api/remap/1.2/path/To/My/Res'
  )

  // TODO deprecated
  t.equals(
    ms.buildUrl(['path', 'to', 'res'], {
      a: 1,
      b: 'tow',
      c: true,
      d: [0, '2']
    }),
    'https://api.moysklad.ru/api/remap/1.2/path/to/res?a=1&b=tow&c=true&d=0&d=2'
  )

  // TODO deprecated
  t.equals(
    ms.buildUrl(['path', 'to', 'res'], {
      a: 1,
      filter: { name: 'foo', value: { $eq: 'bar' } }
    }),
    'https://api.moysklad.ru/api/remap/1.2/path/to/res?a=1&filter=name%3Dfoo%3Bvalue%3Dbar'
  )

  t.equals(
    ms.buildUrl(
      'https://api.moysklad.ru/api/remap/1.2/entity/purchaseorder' +
        '/191ebffa-45df-11e6-7a69-93a7000513f8?expand=agent'
    ),
    'https://api.moysklad.ru/api/remap/1.2/entity/purchaseorder' +
      '/191ebffa-45df-11e6-7a69-93a7000513f8?expand=agent&limit=100'
  )

  t.equals(
    ms.buildUrl(
      'https://api.moysklad.ru/api/remap/1.2/entity/purchaseorder' +
        '/191ebffa-45df-11e6-7a69-93a7000513f8/positions?expand=assortment'
    ),
    'https://api.moysklad.ru/api/remap/1.2/entity/purchaseorder' +
      '/191ebffa-45df-11e6-7a69-93a7000513f8/positions?expand=assortment&limit=100'
  )

  t.equals(
    ms.buildUrl(
      'https://api.moysklad.ru/api/remap/1.2/entity/purchaseorder' +
        '/191ebffa-45df-11e6-7a69-93a7000513f8/positions?expand=assortment&limit=10',
      {
        expand: 'agent',
        offset: 100
      }
    ),
    'https://api.moysklad.ru/api/remap/1.2/entity/purchaseorder' +
      '/191ebffa-45df-11e6-7a69-93a7000513f8/positions?expand=agent&limit=10&offset=100'
  )

  t.equals(
    ms.buildUrl(
      'https://api.moysklad.ru/api/remap/1.2/entity/purchaseorder' +
        '/191ebffa-45df-11e6-7a69-93a7000513f8/positions',
      null
    ),
    'https://api.moysklad.ru/api/remap/1.2/entity/purchaseorder' +
      '/191ebffa-45df-11e6-7a69-93a7000513f8/positions'
  )

  t.equals(
    ms.buildUrl(
      'https://api.moysklad.ru/api/remap/1.2/entity/purchaseorder' +
        '/191ebffa-45df-11e6-7a69-93a7000513f8/positions?expand=agent&limit=10&offset=100',
      null
    ),
    'https://api.moysklad.ru/api/remap/1.2/entity/purchaseorder' +
      '/191ebffa-45df-11e6-7a69-93a7000513f8/positions?expand=agent&limit=10&offset=100'
  )

  t.equals(
    ms.buildUrl(
      'https://api.moysklad.ru/api/remap/1.2/entity/purchaseorder' +
        '/191ebffa-45df-11e6-7a69-93a7000513f8/positions',
      {}
    ),
    'https://api.moysklad.ru/api/remap/1.2/entity/purchaseorder' +
      '/191ebffa-45df-11e6-7a69-93a7000513f8/positions'
  )

  t.equals(
    ms.buildUrl(
      'https://api.moysklad.ru/api/remap/1.2/entity/purchaseorder' +
        '/191ebffa-45df-11e6-7a69-93a7000513f8/positions?expand=agent&limit=10&offset=100',
      {}
    ),
    'https://api.moysklad.ru/api/remap/1.2/entity/purchaseorder' +
      '/191ebffa-45df-11e6-7a69-93a7000513f8/positions?expand=agent&limit=10&offset=100'
  )

  t.end()
})
