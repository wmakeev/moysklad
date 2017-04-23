'use strict'

const test = require('blue-tape')
const nodeFetch = require('node-fetch')
const Moysklad = require('..')

test.skip('Moysklad', async t => {
  const ms = Moysklad({
    fetch: nodeFetch
  })

  let productsCollection = await ms.GET('entity/product', {
    filter: {
      code: []
    }
  })

  let patch = productsCollection.rows.map(product => {
    return {
      id: product.id,
      buyPrice: {
        currency: {
          meta: {
            href: 'https://online.moysklad.ru/api/remap/1.1/entity/currency/' +
              '18dad23e-8263-45ea-b399-58b34d513aa7',
            metadataHref: 'https://online.moysklad.ru/api/remap/1.1/entity/currency/metadata',
            type: 'currency',
            mediaType: 'application/json'
          }
        },
        value: product.minPrice
      }
    }
  })

  let patched = await ms.POST('entity/product', patch)

  console.log(patched.length)
})
