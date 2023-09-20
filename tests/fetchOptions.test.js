'use strict'

const test = require('tape')
const { fetch, Response } = require('undici')

const Moysklad = require('..')
const { MoyskladApiError } = require('../src/errors')

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
  const uuidFromApp = 'cb277549-34f4-4029-b9de-7b37e8e25a54'

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
    // TODO 2023-07-31 Редирект перестал выполняться (исправление или ошибка в API?) #fkjs94ys
    // t.fail('redirected response expected')
  }

  t.notEquals(product.id, uuidFromApp)
})

test('Response with rawRedirect (print document)', async t => {
  const ms = Moysklad({ fetch })

  const body = {
    template: {
      meta: {
        href: ms.buildUrl(
          'entity/demand/metadata/customtemplate/8a686b8a-9e4a-11e5-7a69-97110004af3e'
        ),
        type: 'customtemplate',
        mediaType: 'application/json'
      }
    },
    extension: 'pdf'
  }

  const { headers, status: code } = await ms.POST(
    'entity/demand/13abf361-e9c6-45ea-a940-df70289a7f95/export',
    body,
    null,
    { rawRedirect: true }
  )

  t.equal(code, 303, 'response.status should to be 303')

  t.ok(headers.get, 'headers should have get method')
  t.ok(
    /vensi_tov_check-03033.pdf/.test(headers.get('location')),
    'headers Location header should contain url to from'
  )
})

test('Response with redirect follow', async t => {
  const ms = Moysklad({ fetch })

  /** id товара из приложения МойСклад */
  const uuidFromApp = 'cb277549-34f4-4029-b9de-7b37e8e25a54'

  const product = await ms.GET(`entity/product/${uuidFromApp}`, null, {
    redirect: 'follow'
  })

  t.notEquals(product.id, uuidFromApp)
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
