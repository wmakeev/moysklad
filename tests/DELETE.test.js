'use strict'

const { fetch } = require('undici')
const test = require('tape')
const env = require('./env')

const { TEST_ORGANIZATION_ID, TEST_PRODUCT_01_ID, TEST_PRODUCT_02_ID } = env

const Moysklad = require('..')

test('Moysklad#DELETE', async t => {
  t.plan(4)

  const ms = Moysklad({ fetch })

  let internalorder

  try {
    internalorder = await ms.POST(
      'entity/internalorder',
      {
        organization: {
          meta: {
            type: 'organization',
            href: ms.buildUrl(`entity/organization/${TEST_ORGANIZATION_ID}`)
          }
        },
        positions: [
          {
            assortment: {
              meta: {
                type: 'product',
                href: ms.buildUrl(`entity/product/${TEST_PRODUCT_01_ID}`)
              }
            },
            quantity: 1
          },
          {
            assortment: {
              meta: {
                type: 'product',
                href: ms.buildUrl(`entity/product/${TEST_PRODUCT_02_ID}`)
              }
            },
            quantity: 1
          }
        ]
      },
      { expand: 'positions' }
    )

    t.equal(internalorder.positions.rows.length, 2)

    await ms.POST(
      `entity/internalorder/${internalorder.id}/positions/delete`,
      internalorder.positions.rows.map(pos => ({ meta: pos.meta }))
    )
  } finally {
    if (internalorder) {
      let result = await ms.DELETE(internalorder.meta.href)
      t.equal(result, undefined, 'should return undefined')

      try {
        await ms.DELETE(internalorder.meta.href)
      } catch (err) {
        t.ok(
          err.message.includes('не найден'),
          'should throw on deletion deleted entity'
        )
      }

      result = await ms.DELETE(internalorder.meta.href, {
        // deprecated
        muteErrors: true
      })
      t.ok(
        result.errors[0].error.includes('не найден'),
        'should return error object on deletion deleted entity'
      )
    }
  }
})
