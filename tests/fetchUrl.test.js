'use strict'

const test = require('tape')
const { fetch } = require('undici')

const Moysklad = require('..')

test('fetchUrl redirect', async t => {
  t.plan(2)

  const ms = Moysklad({ fetch })

  const PRODUCT_UI_ID = 'cb277549-34f4-4029-b9de-7b37e8e25a54'
  const href = ms.buildUrl(`entity/product/${PRODUCT_UI_ID}`)

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
