// Тесты для index.d.ts

import Moysklad from '..'

//#region Работа с датами
const msDate: string = Moysklad.getTimeString(new Date())

Moysklad.getTimeString(new Date(), true)

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
