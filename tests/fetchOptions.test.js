'use strict'

const test = require('blue-tape')
const fetch = require('node-fetch')

const Moysklad = require('..')

test('Response with muteErrors option', t => {
  const ms = Moysklad({ fetch })

  return ms
    .GET('entity/demand2', null, { muteErrors: true })
    .then(async res => {
      t.ok(res.errors instanceof Array, 'should return raw error object')
    })
})

test('Response with rawResponse option', t => {
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
  t.plan(4)

  const ms = Moysklad({ fetch })

  ms.GET('entity/demand2', null, { rawResponse: true }).catch(err => {
    t.ok(err instanceof Error, 'should throw error')
    t.equal(
      err.message,
      "Неизвестный тип: 'demand2' (https://dev.moysklad.ru/doc/api/remap/1.2/#error_1005)",
      'should parse error message'
    )
    t.equal(err.code, 1005, 'should parse error code')
    t.equal(
      err.moreInfo,
      'https://dev.moysklad.ru/doc/api/remap/1.2/#error_1005',
      'should parse error moreInfo'
    )
  })
})

test('Response with rawResponse and muteErrors options', async t => {
  const ms = Moysklad({ fetch })

  const body = {
    template: {
      meta: {
        href:
          'https://online.moysklad.ru/api/remap/1.2/entity/demand/metadata/customtemplate/' +
          '8a686b8a-9e4a-11e5-7a69-97110004af3e',
        type: 'customtemplate',
        mediaType: 'application/json'
      }
    },
    extension: 'pdf'
  }

  const { headers, status: code } = await ms.POST(
    'entity/demand/13abf361-e9c6-45ea-a940-df70289a7f95/export/',
    body,
    null,
    {
      rawResponse: true,
      muteErrors: true
    }
  )

  t.equal(code, 303, 'response.status should to be 303')

  t.ok(headers.get, 'headers should have get method')
  t.ok(
    /vensi_tov_check-03033.pdf/.test(headers.get('location')),
    'headers Location header should contain url to from'
  )
})

test('Response with millisecond option (remap 1.1)', t => {
  t.plan(2)

  const ms = Moysklad({ apiVersion: '1.1', fetch })

  const { parseTimeString } = Moysklad

  ms.GET('entity/product/0010fe40-307d-11e5-7a07-673d0013045f', {
    limit: 1
  }).then(async res => {
    t.ok(parseTimeString(res.updated).getMilliseconds() === 0)
  })

  ms.GET(
    'entity/product/0010fe40-307d-11e5-7a07-673d0013045f',
    { limit: 1 },
    { millisecond: true }
  ).then(async res => {
    t.ok(parseTimeString(res.updated).getMilliseconds() !== 0)
  })
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
