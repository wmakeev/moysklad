'use strict'

const test = require('tape')
const { fetch } = require('undici')

const Moysklad = require('..')
const { TEST_PRODUCT_01_APP_ID } = require('./env')

test('fetchUrl redirect', async t => {
  t.plan(2)

  const ms = Moysklad({ fetch })

  const href = ms.buildUrl(`entity/product/${TEST_PRODUCT_01_APP_ID}`)

  try {
    await ms.fetchUrl(href)
  } catch (err) {
    t.equal(
      err.message,
      'Неожиданное перенаправление запроса с кодом 308' +
        ' (см. подробнее https://github.com/wmakeev/moysklad#moyskladunexpectedredirecterror)',
      'should throw on redirect'
    )
  }

  const product = await ms.fetchUrl(href, {
    redirect: 'follow'
  })

  t.ok(product, 'should follow redirects')
})
