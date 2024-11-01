// @ts-check

// Тесты для index.d.ts

import Moysklad from '../index.js'

//#region Работа с датами
const msDate: string = Moysklad.getTimeString(new Date())

// getTimeString
Moysklad.getTimeString(new Date(), true)
Moysklad.getTimeString(123, true)

// Static methods
Moysklad.parseUrl('123')
Moysklad.buildFilter({ foo: 'bar' })
Moysklad.buildQuery({ foo: 'bar' })

const msParsedDate: Date = Moysklad.parseTimeString(msDate)
//#endregion

//#region Инициализация библиотеки
const ms = Moysklad({
  endpoint: 'https://api.moysklad.ru/api',
  api: 'remap',
  apiVersion: '1.2',
  fetch: 'any',
  login: 'login',
  password: 'password'
})

Moysklad({ foo: 'bar' })
//#endregion

//#region Формирование запроса
ms.GET('path/to/doc', {
  filter: {
    foo: 'bar',
    moment: {
      $eq: msParsedDate
    }
  },
  order: 'foo'
})

let str1: string | undefined

ms.GET('path/to/doc', {
  filter: {
    foo: 'bar',
    moment: { $gt: str1 }
  },
  order: 'foo',
  expand: str1
})

ms.GET(
  'path/to/doc',
  {
    order: ['foo', ['bar', 'baz'], ['qux']]
  }
)

async function case1() {
  // @ts-expect-error
  await ms.GET('foo/bar', null, { rawResponse: 'foo' })
  // @ts-expect-error
  await ms.GET('foo/bar', null, { includeResponse: 'foo' })
  // @ts-expect-error
  await ms.GET('foo/bar', null, { muteCollectionErrors: 'foo' })
}
case1

const filter: Moysklad.QueryFilter = {
  foo: 'bar',
  quz: {
    $gte: 10
  }
}

ms.POST('foo/bar', 'any', {
  filter: {
    ...filter,
    foo: 'bar'
  }
})

ms.GET('foo/bar', {
  filter: {
    foo: 'bar',
    baz: undefined, // Можно указывать undefined (параметр будет опущен)
    some: {
      empty: undefined
    }
  }
})

ms.GET('foo/bar', { filter: 'some filter' })
//#endregion

//#region Ошибки
const error = new Moysklad.MoyskladError('foo')
error

const requestError = new Moysklad.MoyskladRequestError('foo')
requestError.status
requestError.statusText
requestError.url

const cond1: Moysklad.MoyskladRequestError extends Moysklad.MoyskladError
  ? true
  : never = true
cond1

const apiError = new Moysklad.MoyskladApiError('foo')
apiError.code
apiError.errors
apiError.message
apiError.moreInfo
apiError.name
apiError.status
apiError.statusText
apiError.url

const cond2: Moysklad.MoyskladApiError extends Moysklad.MoyskladRequestError
  ? true
  : never = true
cond2

// @ts-expect-error
const cond3: Moysklad.MoyskladRequestError extends Moysklad.MoyskladApiError
  ? true
  : never = true

const cond4: Moysklad.MoyskladUnexpectedRedirectError extends Moysklad.MoyskladRequestError
  ? true
  : never = true
cond4

if (apiError instanceof Moysklad.MoyskladError) true
//#endregion
