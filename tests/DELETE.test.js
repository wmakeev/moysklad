'use strict'

const { fetch } = require('undici')
const test = require('tape')

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
            href: ms.buildUrl(
              'entity/organization/bf6bc7ce-444e-4fd2-9826-3134ce89c54b'
            )
          }
        },
        positions: [
          {
            assortment: {
              meta: {
                type: 'product',
                href: ms.buildUrl([
                  'entity/product/d29f9d08-30d1-11e7-7a34-5acf004eda99'
                ])
              }
            },
            quantity: 1
          },
          {
            assortment: {
              meta: {
                type: 'product',
                href: ms.buildUrl([
                  'entity/product/d29f038e-30d1-11e7-7a34-5acf004eda8c'
                ])
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
      ['entity/internalorder', internalorder.id, 'positions/delete'],
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

      result = await ms.DELETE(internalorder.meta.href, { muteErrors: true })
      t.ok(
        result.errors[0].error.includes('не найден'),
        'should return error object on deletion deleted entity'
      )
    }
  }
})
