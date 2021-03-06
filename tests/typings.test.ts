// Тесты для index.d.ts

import Moysklad from '..'

//#region Работа с датами
const msDate: string = Moysklad.getTimeString(new Date())

// getTimeString
Moysklad.getTimeString(new Date(), true)
Moysklad.getTimeString(123, true)

const msParsedDate: Date = Moysklad.parseTimeString(msDate)
//#endregion

//#region Инициализация библиотеки
const ms = Moysklad({
  endpoint: 'https://online.moysklad.ru/api',
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

ms.GET(
  'path/to/doc',
  {
    order: ['foo', ['bar', 'baz'], ['qux']]
  },
  {
    millisecond: true
  }
)

ms.GET('foo/bar', null, { muteErrors: true })

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
    baz: undefined, // Можно указывать undefined (парамерт будет опущен)
    some: {
      empty: undefined
    }
  }
})

ms.GET('foo/bar', { filter: 'some filter' })
//#endregion

//#region Ошибки
const error = new Moysklad.MoyskladError('foo')

const requestError = new Moysklad.MoyskladRequestError('foo')
requestError.status
requestError.statusText
requestError.url

const cond1: Moysklad.MoyskladRequestError extends Moysklad.MoyskladError
  ? true
  : never = true

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

// @ts-expect-error
const cond3: Moysklad.MoyskladRequestError extends Moysklad.MoyskladApiError
  ? true
  : never = true

if (apiError instanceof Moysklad.MoyskladError) true
//#endregion
