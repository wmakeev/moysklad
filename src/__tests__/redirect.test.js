'use strict'

const test = require('blue-tape')
const nodeFetch = require('node-fetch')
const Moysklad = require('..')

test('Array response with muted errors', async t => {
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
    extension: 'html'
  }

  let [headers, result, response] = await ms
    .POST('entity/demand/773e16c5-ef53-11e6-7a69-9711001669c5/export/', body, null, {
      includeHeaders: true,
      muteErrors: true
    })

  t.ok(headers.get, 'headers should have get method')
  t.ok(/https:\/\/120708.selcdn.ru\/prod-files/.test(headers.get('location')),
    'headers Location header should contain url to from')
  t.equal(result, undefined, 'result should to be undefined')
  t.equal(response.status, 307, 'response.status should to be 307')
})
