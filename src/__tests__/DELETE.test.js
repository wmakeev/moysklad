'use strict'

const test = require('blue-tape')
const Moysklad = require('..')

test('Moysklad#DELETE', async t => {
  let ms = Moysklad()

  let internalorder

  try {
    internalorder = await ms.POST('entity/internalorder', {
      organization: {
        meta: {
          type: 'organization',
          href: ms.buildUrl('entity/organization/bf6bc7ce-444e-4fd2-9826-3134ce89c54b')
        }
      },
      positions: [
        {
          assortment: {
            meta: {
              type: 'product',
              href: ms.buildUrl(['entity/product/d29f9d08-30d1-11e7-7a34-5acf004eda99'])
            }
          },
          quantity: 1
        },
        {
          assortment: {
            meta: {
              type: 'product',
              href: ms.buildUrl(['entity/product/d29f038e-30d1-11e7-7a34-5acf004eda8c'])
            }
          },
          quantity: 1
        }
      ]
    }, { expand: 'positions' })

    t.equal(internalorder.positions.rows.length, 2, 'should create order with 2 positions')

    await ms.POST(['entity/internalorder', internalorder.id, 'positions/delete'],
      internalorder.positions.rows.map(pos => ({ meta: pos.meta })))
  } finally {
    if (internalorder) await ms.DELETE(internalorder.meta.href)
  }
})
