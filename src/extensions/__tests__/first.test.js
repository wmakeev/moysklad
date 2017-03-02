'use strict'

const test = require('blue-tape')
const Moysklad = require('../..')
const first = require('../first')

const PRODUCT_ID = '8dff01c6-e06d-413c-a38f-6139eaf4c2c7'
const PRODUCT_NAME = 'Тест 9999+'

let ExtendedMoysklad = Moysklad.compose(first)

test('Moysklad#first method (extension)', async t => {
  let ms = ExtendedMoysklad()

  t.ok(ms.first, 'should add `first` method')

  // TODO Почему не работает с product?
  // https://support.moysklad.ru/hc/ru/articles/214273398/comments/115000266047
  let product = await ms.first('entity/assortment', { filter: { id: PRODUCT_ID } })

  t.ok(product, 'should return first item from collection.rows')
  t.equals(product.name, PRODUCT_NAME, 'should return first product for "entity/assortment" path')
})
