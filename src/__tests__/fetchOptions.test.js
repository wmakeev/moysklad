'use strict'

const test = require('blue-tape')
const nodeFetch = require('node-fetch')
const Moysklad = require('..')

test('Response with muteErrors option', t => {
  const ms = Moysklad({
    fetch: nodeFetch
  })

  return ms.GET('entity/demand2', null, { muteErrors: true })
    .then(async res => {
      t.ok(res.errors instanceof Array, 'should return raw error object')
    })
})

test('Response with rawResponse option', t => {
  const ms = Moysklad({
    fetch: nodeFetch
  })

  return ms.GET('entity/demand', { limit: 2 }, { rawResponse: true })
    .then(async res => {
      let { status: code } = res
      t.equal(code, 200, 'should return code 200')

      let json = await res.json()
      t.ok(json.meta, 'should return entity')
      t.equal(json.rows.length, 2, 'should return 2 rows in collection')
    })
})

test('Response with rawResponse option (with error)', t => {
  t.plan(4)

  const ms = Moysklad({
    fetch: nodeFetch
  })

  ms.GET('entity/demand2', null, { rawResponse: true })
    .catch(err => {
      t.ok(err instanceof Error, 'should throw error')
      t.equal(err.message, 'Неизвестный тип: \'demand2\'', 'should parse error message')
      t.equal(err.code, 1005, 'should parse error code')
      t.equal(err.moreInfo, 'https://online.moysklad.ru/api/remap/1.1/doc#обработка-ошибок-1005',
        'should parse error moreInfo')
    })
})

test('Response with rawResponse and muteErrors options', async t => {
  const ms = Moysklad({
    fetch: nodeFetch
  })

  let body = {
    template: {
      meta: {
        href: 'https://online.moysklad.ru/api/remap/1.1/entity/demand/metadata/customtemplate/' +
          '8a686b8a-9e4a-11e5-7a69-97110004af3e',
        type: 'customtemplate',
        mediaType: 'application/json'
      }
    },
    extension: 'pdf'
  }

  let { headers, status: code } = await ms
    .POST('entity/demand/773e16c5-ef53-11e6-7a69-9711001669c5/export/', body, null, {
      rawResponse: true,
      muteErrors: true
    })

  t.equal(code, 303, 'response.status should to be 303')

  t.ok(headers.get, 'headers should have get method')
  t.ok(/vensi_tov_check-NA-dmd-09995.pdf/.test(headers.get('location')),
    'headers Location header should contain url to from')
})

test('Response with millisecond option', t => {
  const ms = Moysklad({
    fetch: nodeFetch
  })

  const { parseTimeString } = Moysklad

  return ms.GET('entity/product/0010fe40-307d-11e5-7a07-673d0013045f',
    { limit: 1 }, { millisecond: true })
    .then(async res => {
      t.equal(parseTimeString(res.updated).getMilliseconds(), 216)
    })
})
