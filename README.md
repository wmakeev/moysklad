moysklad
========

[![npm](https://img.shields.io/npm/v/moysklad.svg?maxAge=1800&style=flat-square)](https://www.npmjs.com/package/moysklad)
[![Travis](https://img.shields.io/travis/wmakeev/moysklad.svg?maxAge=1800&style=flat-square)](https://travis-ci.org/wmakeev/moysklad)
[![Coveralls](https://img.shields.io/coveralls/wmakeev/moysklad.svg?maxAge=1800&style=flat-square)](https://coveralls.io/github/wmakeev/moysklad)
[![bitHound Dependencies](https://img.shields.io/bithound/dependencies/github/wmakeev/moysklad.svg?maxAge=1800&style=flat-square)](https://www.bithound.io/github/wmakeev/moysklad/master/dependencies/npm)
[![bitHound DevDependencies](https://img.shields.io/bithound/devDependencies/github/wmakeev/moysklad.svg?maxAge=1800&style=flat-square)](https://www.bithound.io/github/wmakeev/moysklad/master/dependencies/npm)
[![bitHound](https://img.shields.io/bithound/code/github/wmakeev/moysklad.svg?maxAge=1800&style=flat-square)](https://www.bithound.io/github/wmakeev/moysklad)
[![JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](http://standardjs.com/)

> Библиотека для взаимодействия с JSON API сервиса МойСклад для node.js и браузера.

> **ВНИМАНИЕ!** Библиотека не готова для использования. Идет активная разработка и тестирование. Документация не полная и будет дополняться.

## Особенности

Библиотека представляет максимально простой и прозрачный интерфейс к существующим методам [API МойСклад](https://online.moysklad.ru/api/remap/1.1/doc) и не выполняет никаких внутренних преобразований отправляемых и получаемых данных.

При необходимости, можно расширить функционал библиотеки [внешними модулями](#Расширение).

## Установка

Поддерживаются версии node.js 4.x и выше

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

const ms = new Moysklad({ login, password })

ms.GET('entity/customerorder', {
  filter: {
    applicable: true,
    sum: {
      $gt: 1000000,
      $lt: 2000000
    }
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

## Расширение

Библиотеку можно расширять дополнительными возможностями, подключая [внешние модули и расширения](https://github.com/wmakeev/moysklad-tools).

## API

### Moysklad.getTimeString

> Преобразует дату в строку в формате API МойСклад в часовом поясе Москвы (статический метод)

`Moysklad.getTimeString(date: Date, includeMs?: boolean) : String`

**Параметры:**

`date` - дата

`includeMs` - если `true`, то в результирующую дату будут включены миллисекунды

**Пример использования:**

```js
let date = new Date('2017-02-01T07:10:11.123Z')
let timeString = Moysklad.getTimeString(date, true)

assert.equal(timeString, '2017-02-01 10:10:11.123')
```

### Moysklad.parseTimeString

> Преобразует строку с датой в формате API МойСклад в объект даты (с учетом часового пояса исходной даты)

`Moysklad.parseTimeString(date: string) : Date`

**Параметры:**

`date` - дата в формате МойСклад (напр. '2017-04-08 13:33:00.123')

**Пример использования:**

```js
let parsedDate = Moysklad.parseTimeString('2017-04-08 13:33:00.123')

assert.equal(parsedDate.toISOString(), '2017-04-08T10:33:00.123Z')
```

### moysklad#GET

> GET запрос

- `moysklad.GET(path: String|Array<String>, query?: Object, options?: Object) : Promise`

- `moysklad.GET(args: Object) : Promise`

**Параметры:**

`path` - url ресурс (относительно текущего api)

`query` - url параметры запроса

`options` - опции запроса

**Пример использования:**

```js
let productsCollection = await moysklad.GET('entity/product', { limit: 50 })

let order = await moysklad.GET(['entity', 'customerorder', orderId], { expand: 'positions' })
```

### moysklad#POST

> POST запрос

- `moysklad.POST(path: String|Array<String>, payload?: Object|Array<Object>, query?: Object, options?: Object) : Promise`

- `moysklad.POST(args: Object) : Promise`

**Параметры:**

`path` - url ресурс (относительно текущего api)

`payload` - объект или коллекция объектов (будет преобразовано в строку методом `JSON.stringify`)

`query` - url параметры запроса

`options` - опции запроса

**Пример использования:**

```js
let newProduct = await moysklad.POST('entity/product', { name: 'Новый товар' })
```

### moysklad#PUT

> PUT запрос

- `moysklad.PUT(path: String|Array<String>, payload?: Object, query?: Object, options?: Object) : Promise`

- `moysklad.PUT(args: Object) : Promise`

**Параметры:**

`path` - url ресурс (относительно текущего api)

`payload` - обнвляемый объект (будет преобразован в строку методом `JSON.stringify`)

`query` - url параметры запроса

`options` - опции запроса

**Пример использования:**

```js
let updatedProduct = await moysklad.PUT(['entity/product', id], product)
```

### moysklad#DELETE

> DELETE запрос

- `moysklad.DELETE(path: String|Array<String>, options?: Object) : Promise<Response>`

- `moysklad.DELETE(args: Object) : Promise<Response>`

**Параметры:**

`path` - url ресурс (относительно текущего api)

`options` - опции запроса

Метод `DELETE` возвращает объект [Response](https://developer.mozilla.org/en-US/docs/Web/API/Response) текущего запроса.

**Пример использования:**

```js
await moysklad.DELETE(['entity/product', product.id])
```

### moysklad#buildUrl

> Формирует url запроса

- `moysklad.buildUrl(url: String, query?: Object) : String`

- `moysklad.buildUrl(path: String|Array<String>, query?: Object) : String`

- `moysklad.buildUrl(args: Object) : String`

**Параметры:**

`url` - полный url (должен соответствовать настройкам)

`path` - путь относительно текущего api

`query` - url параметры запроса

**Пример использования:**

```js
let url = moysklad.buildUrl('https://online.moysklad.ru/api/remap/1.1/entity/customerorder?expand=positions', { limit: 100 })

assert.equal(url, 'https://online.moysklad.ru/api/remap/1.1/entity/customerorder?expand=positions&limit=100')
```

```js
let url = moysklad.buildUrl('entity/customerorder', { expand: 'positions' })

assert.equal(url, 'https://online.moysklad.ru/api/remap/1.1/entity/customerorder?expand=positions')
```

```js
let url = moysklad.buildUrl(['entity', 'customerorder'], { expand: 'positions' })

assert.equal(url, 'https://online.moysklad.ru/api/remap/1.1/entity/customerorder?expand=positions')
```

### moysklad#parseUrl

> Разбор uri на составные компоненты

- `moysklad.parseUrl(uri: String) : Object`

**Параметры:**

`uri` - uri ресурс

**Пример использования:**

```js
let parsedUri = moysklad.parseUrl('https://online.moysklad.ru/api/remap/1.1/entity/customerorder?expand=positions')

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

### moysklad#fetchUrl

> Выполнить запрос по указанному uri

- `moysklad.fetchUrl(url: String, options?: Object) : Promise`

**Параметры:**

`url` - url ресурса

`options` - опции запроса

#### Свойства `options`

Все опции (за исключением описанных ниже) переданные в объекте `options` передаются напрямую в опции метода `fetch` ([Fetch API](http://github.github.io/fetch/)) при осуществлении запроса.

Свойства специфичные для библиотеки (не передаются в `fetch`):

Свойство | Тип | Описание
---------|-----|---------
`rawResponse` | `boolean` | Если `true`, то метод вернет результат в виде объекта [Response](https://developer.mozilla.org/en-US/docs/Web/API/Response)
`muteErrors` | `boolean` | Если `true`, то все ошибки будут проигнорированы (метод не будет генерировать ошибку если код ответа сервера не в диапазоне 200-299 и/или тело ответа содержит описание ошибки МойСклад.
`millisecond` | `boolean` | Если `true`, то включает в запрос заголовок `X-Lognex-Format-Millisecond` со значением `true` (все даты объекта будут возвращены с учетом миллисекунд).

Пример формирования заполненного шаблона печатной формы и получение ссылки для загрузки:

```js
const ms = Moysklad({ fetch: require('node-fetch') })

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

let { headers, status } = await ms
  .POST('entity/demand/773e16c5-ef53-11e6-7a69-9711001669c5/export/', body, null, {
    rawResponse: true, // вернуть результат запроса без предварительного разбора
    muteErrors: true   // не выводить ошибку, если код ответа сервера не в диапазоне 200-299
  })

assert.equal(status, 307)

let location = headers.get('location')
assert.true(/https:\/\/120708.selcdn.ru\/prod-files/.test(location))
```

**Пример использования:**

```js
let order = await moysklad.fetchUrl('https://online.moysklad.ru/api/remap/1.1/entity/customerorder/eb7bcc22-ae8d-11e3-9e32-002590a28eca')
```

### События

> Описание

#### `request`

``` { uri, options } ```

#### `response`

``` { uri, options, response } ```

#### `response:body`

``` { uri, options, response, body } ```

#### `error`
