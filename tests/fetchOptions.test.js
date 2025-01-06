'use strict'

const test = require('tape')
const { fetch, Response } = require('undici')

const Moysklad = require('..')
const { MoyskladApiError, MoyskladError } = require('../src/errors')
const { TEST_PRODUCT_01_APP_ID, TEST_PRODUCT_01_ID } = require('./env')

test('Response with muteApiErrors option', t => {
  const ms = Moysklad({ fetch })

  return ms
    .GET('entity/demand2', null, { muteApiErrors: true })
    .then(async res => {
      t.ok(res.errors instanceof Array, 'should return raw error object')
    })
})

test('POST error with muteApiErrors', t => {
  t.plan(3)

  const ms = Moysklad({ fetch })

  ms.POST(
    'entity/product',
    [{ foo: 'bar1' }, { id: 'not-id', foo: 'bar2' }],
    null,
    { muteApiErrors: true }
  ).then(res => {
    t.ok(res instanceof Array)
    t.ok(res.length === 2)
    t.ok(res.every(i => i.errors instanceof Array))
  })
})

test('Response with muteCollectionErrors option', async t => {
  const ms = Moysklad({ fetch })

  await ms
    .GET('entity/demand2', null, { muteCollectionErrors: true })
    .catch(err => {
      t.ok(err instanceof MoyskladApiError, 'should throw MoyskladApiError')
    })

  await ms
    .POST(
      'entity/product',
      [
        {
          foo: 'bar'
        }
      ],
      null,
      { muteCollectionErrors: true }
    )
    .then(res => {
      t.equal(res[0].errors[0].code, 3000)
    })
})

test('POST error with muteCollectionErrors', t => {
  t.plan(2)

  const ms = Moysklad({ fetch })

  ms.POST(
    'entity/product',
    [{ foo: 'bar1' }, { id: 'not-id', foo: 'bar2' }],
    null,
    { muteCollectionErrors: true }
  ).then(res => {
    t.ok(res instanceof Array)
  })

  ms.POST(
    'entity/product2',
    [{ foo: 'bar1' }, { id: 'not-id', foo: 'bar2' }],
    null,
    { muteCollectionErrors: true }
  ).catch(err => {
    t.ok(err instanceof MoyskladApiError)
  })
})

test('Response with rawResponse option', t => {
  t.plan(3)

  const ms = Moysklad({ fetch })

  return ms
    .GET('entity/demand', { limit: 2 }, { rawResponse: true })
    .then(async res => {
      const { status: code } = res
      t.equal(code, 200, 'should return code 200')

      const json = await res.json()
      t.ok(json.meta, 'should return entity')
      t.equal(json.rows.length, 2, 'should return 2 rows in collection')
    })
})

test('Response with rawResponse option (with error)', t => {
  t.plan(5)

  const ms = Moysklad({ fetch })

  ms.GET('entity/demand2', null, {
    rawResponse: true,
    // should skipped (test only)
    muteErrors: true
  })
    .then(async res => {
      t.notOk(res.ok)
      t.equals(res.status, 412)

      const response = await res.json()

      const err = response.errors[0]

      t.equal(err.error, "Неизвестный тип: 'demand2'")

      t.equal(err.code, 1005)

      t.equal(
        err.moreInfo,
        'https://dev.moysklad.ru/doc/api/remap/1.2/#error_1005'
      )
    })
    .catch(() => {
      t.fail('should not throw error')
    })
})

test('Response with rawRedirect option', async t => {
  const ms = Moysklad({ fetch })

  /** id товара из приложения МойСклад */
  const uuidFromApp = TEST_PRODUCT_01_APP_ID

  /** id товара из API (отличается от id из приложения) */
  let uuidFromApi

  let product = await ms.GET(`entity/product/${uuidFromApp}`, null, {
    rawRedirect: true
  })

  if (product instanceof Response) {
    t.equal(product.status, 308)

    uuidFromApi = ms.parseUrl(product.headers.get('location')).path.pop()

    product = await ms.GET(`entity/product/${uuidFromApi}`)
  } else {
    t.fail('redirected response expected')
  }

  t.notEquals(product.id, uuidFromApp)
})

test('Response with rawRedirect option and redirect=follow', async t => {
  const ms = Moysklad({ fetch })

  /** id товара из приложения МойСклад */
  const uuidFromApp = TEST_PRODUCT_01_APP_ID

  const product = await ms.GET(`entity/product/${uuidFromApp}`, null, {
    rawRedirect: true,
    redirect: 'follow'
  })

  t.ok(product.id, 'should return product')

  t.notEquals(product.id, uuidFromApp)
})

test('Response with rawRedirect (print document)', async t => {
  const ms = Moysklad({ fetch })

  const customTemplate = (
    await ms.GET('entity/customerorder/metadata/embeddedtemplate')
  ).rows[0]

  const body = {
    template: {
      meta: {
        href: ms.buildUrl(
          `entity/customerorder/metadata/embeddedtemplate/${customTemplate.id}`
        ),
        type: 'embeddedtemplate',
        mediaType: 'application/json'
      }
    },
    extension: 'pdf'
  }

  const customerOrderId = (
    await ms.GET('entity/customerorder', {
      limit: 1
    })
  ).rows[0].id

  const { headers, status: code } = await ms.POST(
    `entity/customerorder/${customerOrderId}/export`,
    body,
    null,
    { rawRedirect: true }
  )

  t.equal(code, 303, 'response.status should to be 303')

  t.ok(headers.get, 'headers should have get method')

  const location = headers.get('location').split('/').pop()

  t.ok(
    location.endsWith('.pdf'),
    'headers Location header should contain url to from'
  )
})

test('Response with redirect follow', async t => {
  const ms = Moysklad({ fetch })

  /** id товара из приложения МойСклад */
  const uuidFromApp = TEST_PRODUCT_01_APP_ID

  const product = await ms.GET(`entity/product/${uuidFromApp}`, null, {
    redirect: 'follow'
  })

  t.notEquals(product.id, uuidFromApp)
})

test('Response with includeResponse', async t => {
  const ms = Moysklad({ fetch })

  const [product, response] = await ms.GET(
    `entity/product/${TEST_PRODUCT_01_ID}`,
    null,
    {
      includeResponse: true
    }
  )

  t.ok(product.id, 'should return result')
  t.ok(response instanceof Response, 'should return Response')
})

test('Response with includeResponse and muteApiErrors', async t => {
  const ms = Moysklad({ fetch })

  const [result, response] = await ms.GET('entity/foo', null, {
    includeResponse: true,
    muteApiErrors: true
  })

  t.ok(Array.isArray(result.errors), 'should return result (error)')
  t.ok(response instanceof Response, 'should return Response')
  t.ok(response.ok === false, 'should return not ok Response')
})

test('Response options not compatible: includeResponse and rawResponse', async t => {
  const ms = Moysklad({ fetch })

  try {
    await ms.GET('entity/foo', null, {
      includeResponse: true,
      rawResponse: true
    })

    t.fail('should fail')
  } catch (err) {
    t.ok(err instanceof MoyskladError)
  }
})

test('Response options not compatible: includeResponse and rawRedirect', async t => {
  const ms = Moysklad({ fetch })

  try {
    await ms.GET('entity/foo', null, {
      includeResponse: true,
      rawRedirect: true
    })

    t.fail('should fail')
  } catch (err) {
    t.ok(err instanceof MoyskladError)
  }
})

test('Request with precision option', t => {
  t.plan(2)

  const ms = Moysklad({
    fetch: (url, options) => {
      t.equal(
        options.headers['X-Lognex-Precision'],
        'true',
        'should add header'
      )

      t.notOk(options.precision, 'should remove option from fetch options')

      throw new Error('stop')
    }
  })

  ms.GET('entity/some', null, { precision: true }).catch(() => {
    t.end()
  })
})

test('Request with webHookDisable option', t => {
  t.plan(2)

  const ms = Moysklad({
    fetch: (url, options) => {
      t.equal(
        options.headers['X-Lognex-WebHook-Disable'],
        'true',
        'should add header'
      )

      t.notOk(options.webHookDisable, 'should remove option from fetch options')

      throw new Error('stop')
    }
  })

  ms.GET('entity/some', null, { webHookDisable: true }).catch(() => {
    t.end()
  })
})

test('Request with webHookDisableByPrefix option', t => {
  t.plan(2)

  const ms = Moysklad({
    fetch: (url, options) => {
      t.equal(
        options.headers['X-Lognex-WebHook-DisableByPrefix'],
        'https://example.com/',
        'should add header'
      )

      t.notOk(
        options.webHookDisableByPrefix,
        'should remove option from fetch options'
      )

      throw new Error('stop')
    }
  })

  ms.GET('entity/some', null, {
    webHookDisableByPrefix: 'https://example.com/'
  }).catch(() => {
    t.end()
  })
})

test('Request with downloadExpirationSeconds option', t => {
  t.plan(2)

  const ms = Moysklad({
    fetch: (url, options) => {
      t.equal(
        options.headers['X-Lognex-Download-Expiration-Seconds'],
        '3600',
        'should add header'
      )

      t.notOk(
        options.downloadExpirationSeconds,
        'should remove option from fetch options'
      )

      throw new Error('stop')
    }
  })

  ms.GET('entity/some', null, { downloadExpirationSeconds: 60 * 60 }).catch(
    () => {
      t.end()
    }
  )
})
