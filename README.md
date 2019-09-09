![moysklad](https://wmakeev-public-files.s3-eu-west-1.amazonaws.com/images/logos/logoMS500x350.png)
===========

[![npm](https://img.shields.io/npm/v/moysklad.svg?cacheSeconds=1800&style=flat-square)](https://www.npmjs.com/package/moysklad)
[![Travis](https://img.shields.io/travis/wmakeev/moysklad.svg?cacheSeconds=1800&style=flat-square)](https://travis-ci.org/wmakeev/moysklad)
[![Coveralls](https://img.shields.io/coveralls/wmakeev/moysklad.svg?cacheSeconds=1800&style=flat-square)](https://coveralls.io/github/wmakeev/moysklad)
[![Code Climate](https://img.shields.io/codeclimate/maintainability-percentage/wmakeev/moysklad.svg?cacheSeconds=1800&style=flat-square)](https://codeclimate.com/github/wmakeev/moysklad/maintainability)
[![Code Climate](https://img.shields.io/codeclimate/tech-debt/wmakeev/moysklad.svg?cacheSeconds=1800&style=flat-square)](https://codeclimate.com/github/wmakeev/moysklad)
[![JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?cacheSeconds=1800&style=flat-square)](http://standardjs.com/)

> Библиотека для взаимодействия с JSON API сервиса МойСклад для node.js и браузера.

> **ВНИМАНИЕ!** Библиотека находится в стадии разработки и становления функционала. Не весь код протестирован. API к релизной версии может быть изменен. Перед обновлением версии смотрите [историю изменений](https://github.com/wmakeev/moysklad/blob/master/CHANGELOG.md).

## Содержание

<!-- TOC -->

- [Содержание](#содержание)
- [Особенности](#особенности)
- [Установка](#установка)
- [Использование](#использование)
- [Параметры инициализации](#параметры-инициализации)
- [Аутентификация](#аутентификация)
- [Фильтрация](#фильтрация)
- [Расширения](#расширения)
- [API](#api)
  - [Статические методы](#статические-методы)
    - [getTimeString](#gettimestring)
    - [parseTimeString](#parsetimestring)
  - [Методы экземпляра](#методы-экземпляра)
    - [GET](#get)
    - [POST](#post)
    - [PUT](#put)
    - [DELETE](#delete)
    - [getOptions](#getoptions)
    - [buildUrl](#buildurl)
    - [parseUrl](#parseurl)
    - [fetchUrl](#fetchurl)
    - [Основные аргументы](#основные-аргументы)
      - [`path`](#path)
      - [`query`](#query)
      - [`options` (параметры запроса)](#options-параметры-запроса)
  - [События](#события)
- [Вероятные изменения API в следующих версиях](#вероятные-изменения-api-в-следующих-версиях)
- [TODO](#todo)
- [История изменений](#история-изменений)

<!-- /TOC -->

## Особенности

Библиотека представляет максимально простой и прозрачный интерфейс к существующим методам [API МойСклад](https://online.moysklad.ru/api/remap/1.1/doc) и не выполняет никаких внутренних преобразований отправляемых и получаемых данных.

При необходимости, можно расширить функционал библиотеки [внешними модулями](#расширения).

## Установка

> Поддерживаются версии node.js >=8.10

```
$ npm install moysklad
```

для работы библиотеки в node.js, дополнительно нужно установить полифил для
[Fetch API](https://developer.mozilla.org/en/docs/Web/API/Fetch_API) или явно указать модуль с соответствующим интерфейсом при создании экземпляра библиотеки

**Полифил:**

```
$ npm install isomorphic-fetch
```

```js
require('isomorphic-fetch') // polyfill
const Moysklad = require('moysklad')

const moysklad = Moysklad()
```

**Модуль:**

```
$ npm install node-fetch
```

```js
const nodeFetch = require('node-fetch')
const Moysklad = require('moysklad')

const moysklad = Moysklad({ fetch: nodeFetch })
```

В примерах выше приведены две наиболее популярные библиотеки реализующие Fetch API в node.js

Для работы с библиотекой в браузере установка полифила или отдельного модуля не требуется.

## Использование

```js
const Moysklad = require('moysklad')

// Инициализировать экземпляр библиотеки можно без ключевого слова new
const ms = Moysklad({ login, password })

ms.GET('entity/customerorder', {
  filter: {
    applicable: true,
    sum: { $gt: 1000000, $lt: 2000000 }
  },
  limit: 10,
  order: 'moment,desc',
  expand: 'agent'
}).then(({ meta, rows }) => {
  console.log(`Последние ${meta.limit} из ${meta.size} проведенных заказов ` +
    `на сумму от 10000 до 20000 руб`)
  rows.forEach(row => {
    console.log(`${row.name} ${row.agent.name} ${row.sum / 100}`)
  })
})
```

> С другими примерами использования можно ознакомиться в папке [examples](https://github.com/wmakeev/moysklad/tree/master/examples)

## Параметры инициализации

Все параметры опциональные (имеют значения по умолчанию)

Параметр | Значение по умолчанию | Описание
---------|--------------|----------
`fetch` | глобальный fetch | Функция с интерфейсом [Fetch API](https://developer.mozilla.org/ru/docs/Web/API/Fetch_API). Если глобальный fetch не найден, то будет выброшена ошибка при попытке осуществить http запрос.
`endpoint` | `"https://online.moysklad.ru/api"` | Точка досупа к API
`api` | `"remap"` | Раздел API
`apiVersion` | `"1.1"` | Версия API
`token` | `undefined` | Токен доступа к API (см. [Аутентификация](#аутентификация))
`login` | `undefined` | Логин для доступа к API (см. [Аутентификация](#аутентификация))
`password` | `undefined` | Пароль для доступа к API (см. [Аутентификация](#аутентификация))
`emitter` | `undefined` | экземляр [EventEmitter](https://nodejs.org/api/events.html#events_class_eventemitter) для передачи [событий библиотеки](#события)

Некоторые [внешние расширения](#расширения) могут добавлять свои дополнительные параметры.

Пример использования:

```js
const Moysklad = require('moysklad')

// Явное указание используемой версии API
const moysklad = Moysklad({ apiVersion: '1.2' })
```

## Аутентификация

Есть несколько способов передачи параметров аутентификации:

1. Напрямую при инициализации экземпляра

    ```js
    // Аутентификация по логину и паролю
    const moysklad = Moysklad({ login, password })
    ```

    ```js
    // Аутентификация по токену
    const moysklad = Moysklad({ token })
    ```

2. Через глобальные переменные или переменные окружения

    Если параметры аутентификации не указаны при инициализации клиента,

    ```js
    const moysklad = Moysklad()
    ```

    то будет проведен поиск параметров в следующем порядке:

      1. Переменная окружения `process.env.MOYSKLAD_TOKEN`
      2. Переменные окружения `process.env.MOYSKLAD_LOGIN` и `process.env.MOYSKLAD_PASSWORD`
      3. Глобальная переменная `global.MOYSKLAD_TOKEN`
      4. Глобальные переменные `global.MOYSKLAD_LOGIN` и `global.MOYSKLAD_PASSWORD`

## Фильтрация

Для построения фильтра можно использовать селекторы в стиле Mongo

Селектор | Фильтр МойСклад | Описание
---------|-----------------|---------
`key: { $eq: value }` | `key=value` | равно
`key: { $ne: value }` | `key!=value` | не равно
`key: { $gt: value }` | `key>value` | больше
`key: { $gte: value }` | `key>=value` | больше или равно
`key: { $lt: value }` | `key<value` | меньше
`key: { $lte: value }` | `key<=value` | меньше или равно
`key: { $st: value }` | `key~=value` | начинается со строки
`key: { $et: value }` | `key=~value` | заканчивается строкой
`key: { $contains: value }` | `key~value` | содержит строку
`key: { $in: [..] }` или `key: [..]`| `key=value1;key=value2;...` | входит в
`key: { $nin: [..] }` | `key!=value1;key!=value2;...` | не входит в
`key: { $exists: true }` | `key!=` | наличие значения (не null)
`key: { $exists: false }` | `key=` | пустое значение (null)
`key: { $and: [{..}, ..] }` |  | объединение условий
`key: { $not: {..} }` |  | отрицание условия

На один ключ можно использовать несколько селекторов

```js
const filter = {
  key: {
    $eq: 'value',
    $exists: true
  }
}
```

## Расширения

Библиотеку можно расширять дополнительными возможностями, подключая [внешние модули расширений](https://github.com/wmakeev/moysklad-tools).

Пример подключения [расширения для очереди запросов](https://github.com/wmakeev/moysklad-tools/tree/master/packages/moysklad-extension-queue):

```js
const MoyskladCore = require('moysklad')
const MoyskladQueueExtension = require('moysklad-extension-queue')

const Moysklad = MoyskladCore.compose(MoyskladQueueExtension)

const moysklad = Moysklad({
  queue: true // включение очереди запросов
})
```

## API

### Статические методы

#### getTimeString

> Преобразует дату в строку в формате API МойСклад в часовом поясе Москвы (статический метод)

`Moysklad.getTimeString(date: Date, includeMs?: boolean) : string`

**Параметры:**

`date` - дата

`includeMs` - если `true`, то в результирующую дату будут включены миллисекунды

**Пример использования:**

```js
const date = new Date('2017-02-01T07:10:11.123Z')
const timeString = Moysklad.getTimeString(date, true)

assert.equal(timeString, '2017-02-01 10:10:11.123')
```

#### parseTimeString

> Преобразует строку с датой в формате API МойСклад в объект даты (с учетом часового пояса исходной даты)

`Moysklad.parseTimeString(date: string) : Date`

**Параметры:**

`date` - дата в формате МойСклад (напр. `2017-04-08 13:33:00.123`)

**Пример использования:**

```js
const parsedDate = Moysklad.parseTimeString('2017-04-08 13:33:00.123')

assert.equal(parsedDate.toISOString(), '2017-04-08T10:33:00.123Z')
```

### Методы экземпляра

#### GET

> GET запрос

- `ms.GET(path: string | string[], query?: object, options?: object) : Promise`

- `ms.GET(args: object) : Promise`

**Параметры:**

`path` - [url ресурса](#path)

`query` - [параметры запроса](#query)

`options` - [опции запроса](#options-параметры-запроса)

**Пример использования:**

```js
const productsCollection = await ms.GET('entity/product', { limit: 50 })

const order = await ms.GET(['entity', 'customerorder', orderId], { expand: 'positions' })
```

#### POST

> POST запрос

- `ms.POST(path: string | string[], payload?: object|Array<object>, query?: object, options?: object) : Promise`

- `ms.POST(args: object) : Promise`

**Параметры:**

`path` - [url ресурса](#path)

`payload` - объект или коллекция объектов (будет преобразовано в строку методом `JSON.stringify`)

`query` - [параметры запроса](#query)

`options` - [опции запроса](#options-параметры-запроса)

**Пример использования:**

```js
const newProduct = await ms.POST('entity/product', { name: 'Новый товар' })
```

#### PUT

> PUT запрос

- `ms.PUT(path: string | string[], payload?: object, query?: object, options?: object) : Promise`

- `ms.PUT(args: object) : Promise`

**Параметры:**

`path` - [url ресурса](#path)

`payload` - обнвляемый объект (будет преобразован в строку методом `JSON.stringify`)

`query` - [параметры запроса](#query)

`options` - [опции запроса](#options-параметры-запроса)

**Пример использования:**

```js
const updatedProduct = await ms.PUT(['entity/product', id], product)
```

#### DELETE

> DELETE запрос

- `ms.DELETE(path: string | string[], options?: object) : Promise`

- `ms.DELETE(args: object) : Promise`

**Параметры:**

`path` - [url ресурса](#path)

`options` - [опции запроса](#options-параметры-запроса)

Метод `DELETE` возвращает `undefined` при успешном запросе.

**Пример использования:**

```js
await ms.DELETE(['entity/product', product.id])
```

#### getOptions

> Возвращает опции переданные в момент инициализации экземпляра библиотеки

**Пример использования:**

```js
const options = {
  login: 'login',
  password: 'password'
}

const ms = Moysklad(options)

const msOptions = ms.getOptions()

assert.ok(msOptions !== options)
assert.equal(msOptions.login, 'login')
assert.equal(msOptions.password, 'password')
```

#### buildUrl

> Формирует url запроса

- `ms.buildUrl(url: string, query?: object) : string`

- `ms.buildUrl(path: string | string[], query?: object) : string`

- `ms.buildUrl(args: object) : string`

**Параметры:**

`url` - полный url (должен соответствовать настройкам)

`path` - [url ресурса](#path)

`query` - [параметры запроса](#query)

**Пример использования:**

```js
const url = ms.buildUrl('https://online.moysklad.ru/api/remap/1.1/entity/customerorder?expand=positions', { limit: 100 })

assert.equal(url, 'https://online.moysklad.ru/api/remap/1.1/entity/customerorder?expand=positions&limit=100')
```

```js
const url = ms.buildUrl('entity/customerorder', { expand: 'positions' })

assert.equal(url, 'https://online.moysklad.ru/api/remap/1.1/entity/customerorder?expand=positions')
```

```js
const url = ms.buildUrl(['entity', 'customerorder'], { expand: 'positions' })

assert.equal(url, 'https://online.moysklad.ru/api/remap/1.1/entity/customerorder?expand=positions')
```

#### parseUrl

> Разбор url на составные компоненты

- `ms.parseUrl(url: string) : object`

**Параметры:**

`url` - url ресурса

**Пример использования:**

```js
const parsedUri = ms.parseUrl('https://online.moysklad.ru/api/remap/1.1/entity/customerorder?expand=positions')

assert.deepEqual(parsedUri, {
  endpoint: 'https://online.moysklad.ru/api',
  api: 'remap'
  apiVersion: '1.1',
  path: ['entity', 'customerorder'],
  query: {
    expand: 'positions'
  }
})
```

#### fetchUrl

> Выполнить запрос по указанному url

- `ms.fetchUrl(url: string, options?: object) : Promise`

**Параметры:**

`url` - url ресурса

`options` - [опции запроса](#options-параметры-запроса)

**Пример использования:**

```js
const url = `https://online.moysklad.ru/api/remap/1.1/entity/customerorder/eb7bcc22-ae8d-11e3-9e32-002590a28eca`

const patch = { applicable: false }

const updatedOrder = await ms.fetchUrl(url, {
  method: 'PUT',
  body: JSON.stringify(patch)
})
```

#### Основные аргументы

##### `path`

Строка или массив строк.

**Примеры:**

```js
// Три запроса ниже аналогичны

ms.GET(`https://online.moysklad.ru/api/remap/1.1/entity/customerorder/${ORDER_ID}/positions/${POSITION_ID}?expand=assortment`)

ms.GET(`entity/customerorder/${ORDER_ID}/positions/${POSITION_ID}`, { expand: 'assortment' })

ms.GET(['entity/customerorder', ORDER_ID, 'positions', POSITION_ID], { expand: 'assortment' })
```

##### `query`

Все поля объекта запроса преобразуются в соответствующую строку запроса url. Некоторые поля (поле `filter`) подвергаются преобразованию.

Поле объекта запроса должно иметь тип: `string`, `number`, `boolean`, `null` или `undefined`, любое другое значение вызовет ошибку.

```js
const query = {
  str: 'some string',
  num: 1,
  bool: true,
  nil: null, // будет добавлено в строку запроса с пустым значением
  nothing: undefined, // поле будет пропущено
  arr: ['str', 1, true, null, undefined]
}

// https://online.moysklad.ru/api/remap/1.1/entity/demand?str=some%20string&num=1&bool=true&nil=&arr=str&arr=1&arr=true&arr=
ms.GET('entity/demand', query)
```

Если поле `filter` объект, то вложенные поля `filter` преобразуется в параметры фильтра в соответствии со следующими правилами:

- `string`, `number`, `boolean` не проходят дополнительных преобразований (`key=value`)
- `null` преобразуется в пустую строку (`key=`)
- `Date` преобразуется в строку методом [`getTimeString`](#gettimestring) (`key=YYYY-MM-DD HH:mm:ss`)
- `object` интерпретируется как набор селекторов (см. в разделе [Фильтрация](#фильтрация)) и как набор вложенных полей (см. пример ниже)

```js
// Соответствует следующему значению фильтра: id=5;name.sub=bar;name=foo;name>15
const query = {
  filter: {
    id: 5,
    name: {
      $gt: 15,
      $eq: 'foo',
      sub: 'bar'
    }
  }
}
```

##### `options` (параметры запроса)

Все опции переданные в объекте `options` (за исключением описанных ниже) передаются напрямую в опции метода `fetch` ([Fetch API](http://github.github.io/fetch/)) при осуществлении запроса.

Поля специфичные для библиотеки (не передаются в `fetch`):

Поле | Тип | Описание
---------|-----|---------
`rawResponse` | `boolean` | Если `true`, то метод вернет результат в виде объекта [Response](https://developer.mozilla.org/en-US/docs/Web/API/Response)
`muteErrors` | `boolean` | Если `true`, то все ошибки будут проигнорированы (метод не будет генерировать ошибку если код ответа сервера не в диапазоне 200-299 и/или тело ответа содержит описание ошибки МойСклад).
`millisecond` | `boolean` | Если `true`, то в запрос будет включен заголовок `X-Lognex-Format-Millisecond` со значением `true` (все даты объекта будут возвращены с учетом миллисекунд).
`precision` | `boolean` | Если `true`, то в запрос будет включен заголовок `X-Lognex-Precision` со значением `true` (отключение округления цен и себестоимости до копеек).
`webHookDisable` | `boolean` | Если `true`, то в запрос будет включен заголовок `X-Lognex-WebHook-Disable` со значением `true` (отключить уведомления вебхуков в контексте данного запроса).

**Примеры:**

- Формирование заполненного шаблона печатной формы и получение ссылки для загрузки:

  ```js
  const ms = Moysklad({ fetch: require('node-fetch') })

  const body = {
    template: {
      meta: {
        href: ms.buildUrl(['entity/demand/metadata/customtemplate', TEMPLATE_ID]),
        type: 'customtemplate',
        mediaType: 'application/json'
      }
    },
    extension: 'pdf'
  }

  const { headers, status } = await ms
    .POST(['entity/demand', DEMAND_ID, 'export'], body, null, {
      rawResponse: true, // вернуть результат запроса без предварительного разбора
      muteErrors: true   // не обрабатывать ошибки, если код ответа сервера не в диапазоне 200-299
    })

  assert.equal(status, 307)

  const location = headers.get('location')
  assert.true(/https:\/\/120708.selcdn.ru\/prod-files/.test(location))
  ```

- Указание кастомного заголовка

  ```js
  const ms = Moysklad({ fetch: require('node-fetch') })

  const folder = {
    meta: {
      type: 'productfolder',
      href: ms.buildUrl(['entity/productfolder', FOLDER_ID])
    },
    description: 'Новое описание группы товаров'
  }

  // Указываем кастомный заголовок X-Lognex-WebHook-Disable для PUT запроса
  const updatedFolder = await ms.PUT(['entity/productfolder', FOLDER_ID], folder, null, {
    // вместо этого можно использовать webHookDisable: true
    headers: {
      'X-Lognex-WebHook-Disable' : true
    }
  })

  assert.equal(updatedFolder.description, folder.description)
  ```

### События

Событие         | Передаваемый объект | Момент наступления
----------------|---------------------|---------
`request`       | `{ url, options }`  | Отправлен http запрос
`response`      | `{ url, options, response }` | Получен ответ на запрос
`response:body` | `{ url, options, response, body }` | Загружено тело ответа
`error`         | `Error`             | Ошибка при выполнении запроса

Пример использования:

```js
const fetch = require('node-fetch')
const Moysklad = require('moysklad')
const { EventEmitter } = require('events')

const emitter = new EventEmitter()
const ms = Moysklad({ fetch, emitter })

emitter.on('request', ({ url, options }) => {
  console.log(`${options.method} ${url}`)
})

ms.GET('entity/customerorder', { limit: 1 }).then(res => {
  console.log('Order name: ' + res.rows[0].name)
})
```

Более подробный пример смотрите в [examples/events.js](https://github.com/wmakeev/moysklad/blob/master/examples/events.js).

## Вероятные изменения API в следующих версиях

> Ниже описаны изменения которые могут быть в следующих версиях библиотеки

- Метод `fetchUrl` и все остальные завязанные на него методы (`GET`, `POST` и пр.), ;**вероятно** будут возвращать специальный объект с набором методов для более тонкого управления запросом. При этом запрос к сервису будет выполнен только после вызова одного из специальных методов.

  ```js
  // получение объекта запроса (запрос к сервису еще не выполнен)
  const request1 = ms.GET(['entity/customerorder', someId])

  // установка заголовка (возвращается новый объекта запроса)
  request2 = request1.setHeader('X-Lognex-Format-Millisecond', true)

  // получение данных по текущему запросу (метод может быть вызван повторно с тем же результатом)
  const order = await request2.data()
  ```

- Часть функционала библиотеки будет выненеса в отдельные модули-плагины и дальнейшее добавление новых фич будет происходить преимущественно путем написания соответствующих плагинов.

## TODO

Фичи, которые могут быть включены в следующие версии, описаны в [TODO.md](https://github.com/wmakeev/moysklad/blob/master/TODO.md)

## История изменений

[CHANGELOG.md](https://github.com/wmakeev/moysklad/blob/master/CHANGELOG.md)
