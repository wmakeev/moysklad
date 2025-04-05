'use strict'

const test = require('tape')
const { fetch } = require('undici')
const { codeFrameColumns } = require('@babel/code-frame')
const jsonMap = require('json-source-map')
const {
  MoyskladUnexpectedRedirectError,
  MoyskladCollectionError,
  MoyskladRequestError,
  MoyskladApiError,
  MoyskladError
} = require('..')
const { TEST_PRODUCT_01_ID, TEST_PRODUCT_01_APP_ID } = require('./env')

const Moysklad = require('..')

test('MoyskladError', async t => {
  t.plan(2)

  const ms = Moysklad({ fetch })

  try {
    await ms.GET('entity/product', {
      filter: 123
    })
  } catch (err) {
    if (err instanceof MoyskladError) {
      t.equal(err.name, 'MoyskladError')
      t.ok(err.message)
    }
  }
})

test('MoyskladRequestError', async t => {
  t.plan(5)

  const ms = Moysklad({ fetch, api: 'foo', apiVersion: '0' })

  await ms
    .POST('foo/bar', [{ foo: 'bar1' }, { id: 'not-id', foo: 'bar2' }], null)
    .catch(err => {
      if (err instanceof MoyskladRequestError) {
        t.equal(err.name, 'MoyskladRequestError')
        t.equal(err.message, '503 Service Unavailable')
        t.equal(err.status, 503)
        t.equal(err.statusText, 'Service Unavailable')
        t.equal(err.url, 'https://api.moysklad.ru/api/foo/0/foo/bar')
      }
    })
})

test('MoyskladUnexpectedRedirectError', async t => {
  t.plan(2)

  const ms = Moysklad({ fetch })

  /** id товара из приложения МойСклад */
  const uuidFromApp = TEST_PRODUCT_01_APP_ID

  try {
    await ms.GET(`entity/product/${uuidFromApp}`)
  } catch (err) {
    if (err instanceof MoyskladUnexpectedRedirectError) {
      t.ok(err instanceof MoyskladRequestError)
      t.ok(err.location)
    }
  }
})

test('MoyskladApiError', async t => {
  t.plan(10)

  const ms = Moysklad({ fetch })

  await ms
    .PUT('entity/product', {
      foo: 'bar'
    })
    .catch(err => {
      if (err instanceof MoyskladApiError) {
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
        t.equal(err.url, 'https://api.moysklad.ru/api/remap/1.2/entity/product')
        t.equal(err.errors[0].code, err.code)
        t.equal(err.errors[0].error, 'Не указан идентификатор объекта')
        t.equal(err.errors[0].moreInfo, err.moreInfo)
      }
    })
})

test('MoyskladApiError', async t => {
  t.plan(14)

  const ms = Moysklad({ fetch })

  await ms
    .POST('entity/product', {
      name: 'foo-1',
      supplier: {
        meta: {
          type: 'counterparty',
          href: 'incorrect-href'
        }
      }
    })
    .catch(err => {
      if (err instanceof MoyskladApiError) {
        t.equal(err.name, 'MoyskladApiError')
        t.equal(
          err.message,
          'Некорректный сервер в идентификаторе объекта: incorrect-href (https://dev.moysklad.ru/doc/api/remap/1.2/#error_1059)'
        )
        t.equal(err.code, 1059)
        t.equal(
          err.moreInfo,
          'https://dev.moysklad.ru/doc/api/remap/1.2/#error_1059'
        )
        t.equal(err.status, 400)
        t.equal(err.statusText, 'Bad Request')
        t.equal(err.url, 'https://api.moysklad.ru/api/remap/1.2/entity/product')
        t.equal(err.errors[0].code, err.code)
        t.equal(
          err.errors[0].error,
          'Некорректный сервер в идентификаторе объекта: incorrect-href'
        )
        t.equal(err.errors[0].moreInfo, err.moreInfo)
        t.equal(
          err.requestBody,
          '{"name":"foo-1","supplier":{"meta":{"type":"counterparty","href":"incorrect-href"}}}'
        )
        t.equal(err.location.start.line, 1)
        t.equal(err.location.start.column, 37)

        //#region Prettify error location
        let json = err.requestBody
        let location = err.location
        const parsedJson = jsonMap.parse(err.requestBody)
        const pos = err.location.start.column - 1

        const mappings = []
        for (const [p, locs] of Object.entries(parsedJson.pointers)) {
          for (const [key, loc] of Object.entries(locs)) {
            mappings.push([[p, key], loc])
          }
        }

        let pointerLoc = null
        for (let i = mappings.length - 1; i >= 0; i--) {
          const m = mappings[i]
          if (pos >= m[1].pos) {
            pointerLoc = m[0]
            break
          }
        }

        if (pointerLoc) {
          const mappedJson = jsonMap.stringify(parsedJson.data, null, 2)
          json = mappedJson.json
          const locationStart =
            mappedJson.pointers[pointerLoc[0]][pointerLoc[1]]
          t.ok(locationStart)
          location = { start: locationStart }
        }

        console.log(
          codeFrameColumns(json, location, {
            message: err.message,
            forceColor: true
          })
        )
        //#endregion
      }
    })
})

test('MoyskladCollectionError', t => {
  t.plan(6)

  const ms = Moysklad({ fetch })

  const uuidFromApi = TEST_PRODUCT_01_ID

  ms.POST('entity/product', [
    { foo: 'bar1' },
    {
      meta: {
        type: 'product',
        href: ms.buildUrl(`entity/product/${uuidFromApi}`)
      },
      weight: 42
    },
    { id: 'not-id', foo: 'bar2' }
  ]).catch(err => {
    if (err instanceof MoyskladCollectionError) {
      t.equal(
        err.message,
        "Ошибка сохранения объекта: поле 'name' не может быть пустым или отсутствовать" +
          ' (https://dev.moysklad.ru/doc/api/remap/1.2/#error_3000)'
      )

      t.equal(err.code, 3000)
      t.ok(err.errorsIndexes)

      const errMap = new Map(err.errorsIndexes)

      t.equal(errMap.size, 2)
      t.equal(errMap.get(0)[0].code, 3000)
      t.equal(errMap.get(2)[0].code, 2016)
    }
  })
})
