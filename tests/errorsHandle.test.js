'use strict'

const test = require('tape')
const { fetch } = require('undici')
const {
  MoyskladUnexpectedRedirectError,
  MoyskladCollectionError,
  MoyskladRequestError,
  MoyskladApiError,
  MoyskladError
} = require('..')

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

// TODO 2023-07-31 Редирект перестал выполняться (исправление или ошибка в API?) #fkjs94ys
test.skip('MoyskladUnexpectedRedirectError', async t => {
  t.plan(2)

  const ms = Moysklad({ fetch })

  /** id товара из приложения МойСклад */
  const uuidFromApp = 'cb277549-34f4-4029-b9de-7b37e8e25a54'

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

test('MoyskladCollectionError', t => {
  t.plan(6)

  const ms = Moysklad({ fetch })

  const uuidFromApi = '2b461f14-0c41-48d2-bdd8-d6f8b36dfab8'

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
