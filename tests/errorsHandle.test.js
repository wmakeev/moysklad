'use strict'

const test = require('tape')
const { fetch } = require('undici')

const Moysklad = require('..')

test('PUT error', t => {
  t.plan(10)

  const ms = Moysklad({ fetch })

  ms.PUT('entity/product', {
    foo: 'bar'
  }).catch(err => {
    if (err instanceof Moysklad.MoyskladApiError) {
      t.equal(err.name, 'MoyskladApiError')
      t.equal(
        err.message,
        'Не указан идентификатор объекта (https://dev.moysklad.ru/doc/api/remap/1.2/#error_1012)'
      )
      t.equal(err.code, 1012)
      t.equal(
        err.moreInfo,
        'https://dev.moysklad.ru/doc/api/remap/1.2/#error_1012'
      )
      t.equal(err.status, 400)
      t.equal(err.statusText, 'Bad Request')
      t.equal(
        err.url,
        'https://online.moysklad.ru/api/remap/1.2/entity/product'
      )
      t.equal(err.errors[0].code, err.code)
      t.equal(err.errors[0].error, 'Не указан идентификатор объекта')
      t.equal(err.errors[0].moreInfo, err.moreInfo)
    } else {
      t.fail('should handle only MoyskladApiError')
    }
  })
})

test('POST error', t => {
  t.plan(2)

  const ms = Moysklad({ fetch })

  ms.POST('entity/product', [
    { foo: 'bar1' },
    { id: 'not-id', foo: 'bar2' }
  ]).catch(err => {
    t.equal(
      err.message,
      "Ошибка сохранения объекта: поле 'name' не может быть пустым или отсутствовать" +
        ' (https://dev.moysklad.ru/doc/api/remap/1.2/#error_3000)'
    )
    t.equal(err.code, 3000)
  })
})

test('POST error with muteErrors', t => {
  t.plan(2)

  const ms = Moysklad({ fetch })

  ms.POST(
    'entity/product',
    [{ foo: 'bar1' }, { id: 'not-id', foo: 'bar2' }],
    null,
    { muteErrors: true }
  ).then(res => {
    t.ok(res instanceof Array)
    t.ok(res.every(i => i.errors instanceof Array))
  })
})

test('POST with MoyskladRequestError', t => {
  t.plan(5)

  const ms = Moysklad({ fetch, api: 'foo', apiVersion: '0' })

  ms.POST(
    'foo/bar',
    [{ foo: 'bar1' }, { id: 'not-id', foo: 'bar2' }],
    null
  ).catch(err => {
    if (err instanceof Moysklad.MoyskladRequestError) {
      t.equal(err.name, 'MoyskladRequestError')
      t.equal(err.message, '404 Not Found')
      t.equal(err.status, 404)
      t.equal(err.statusText, 'Not Found')
      t.equal(err.url, 'https://online.moysklad.ru/api/foo/0/foo/bar')
    } else {
      t.fail('should raise MoyskladRequestError')
    }
  })
})
