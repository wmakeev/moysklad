'use strict'

const test = require('blue-tape')
const fetch = require('node-fetch')

const Moysklad = require('../..')

test('fetchUrl redirect', async t => {
  t.plan(2)

  const ms = Moysklad({ fetch })

  const PRODUCT_UI_ID = 'cb277549-34f4-4029-b9de-7b37e8e25a54'
  const href = ms.buildUrl(['entity/product', PRODUCT_UI_ID])

  try {
    await ms.fetchUrl(href)
  } catch (err) {
    t.equal(err.message, '308 Permanent Redirect', 'should throw on redirect')
  }

  const product = await ms.fetchUrl(href, {
    redirect: 'follow'
  })

  t.ok(product, 'should follow redirects')
})
