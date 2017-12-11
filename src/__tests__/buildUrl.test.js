'use strict'

const test = require('blue-tape')
const Moysklad = require('..')

test('Moysklad#buildUrl method', t => {
  let ms = Moysklad()

  t.equals(ms.buildUrl(['/path/', 'To//My', 'Res/']),
    'https://online.moysklad.ru/api/remap/1.1/path/to/my/res')

  t.equals(ms.buildUrl(['path', 'to', 'res'], {
    a: 1,
    b: 'tow',
    c: true,
    d: [0, '2']
  }), 'https://online.moysklad.ru/api/remap/1.1/path/to/res?a=1&b=tow&c=true&d=0&d=2')

  t.equals(ms.buildUrl(['path', 'to', 'res'], {
    a: 1,
    filter: { name: 'foo', value: { $eq: 'bar' } }
  }), 'https://online.moysklad.ru/api/remap/1.1/path/to/res?a=1&filter=name%3Dfoo%3Bvalue%3Dbar')

  t.equals(
    ms.buildUrl('https://online.moysklad.ru/api/remap/1.1/entity/purchaseorder' +
      '/191ebffa-45df-11e6-7a69-93a7000513f8/positions?expand=assortment'),
    'https://online.moysklad.ru/api/remap/1.1/entity/purchaseorder' +
      '/191ebffa-45df-11e6-7a69-93a7000513f8/positions?expand=assortment')

  t.equals(
    ms.buildUrl('https://online.moysklad.ru/api/remap/1.1/entity/purchaseorder' +
      '/191ebffa-45df-11e6-7a69-93a7000513f8/positions?expand=assortment&limit=10', {
      expand: 'agent', offset: 100
    }),
    'https://online.moysklad.ru/api/remap/1.1/entity/purchaseorder' +
      '/191ebffa-45df-11e6-7a69-93a7000513f8/positions?expand=agent&limit=10&offset=100')

  t.equals(
    ms.buildUrl('https://online.moysklad.ru/api/remap/1.1/entity/purchaseorder' +
      '/191ebffa-45df-11e6-7a69-93a7000513f8/positions', null),
    'https://online.moysklad.ru/api/remap/1.1/entity/purchaseorder' +
      '/191ebffa-45df-11e6-7a69-93a7000513f8/positions')

  t.equals(
    ms.buildUrl('https://online.moysklad.ru/api/remap/1.1/entity/purchaseorder' +
      '/191ebffa-45df-11e6-7a69-93a7000513f8/positions', {}),
    'https://online.moysklad.ru/api/remap/1.1/entity/purchaseorder' +
      '/191ebffa-45df-11e6-7a69-93a7000513f8/positions')

  t.end()
})
