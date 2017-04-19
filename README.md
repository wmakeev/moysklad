moysklad
========

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

ms.GET('entity/counterparty', {
  limit: 10,
  filter: {
    name: 'ООО "Ромашка"'
  }
}).then(({ meta, rows }) => {
  console.log('Всего контрагентов -', meta.size)
  console.log(`Первые ${meta.limit}:`)
  rows.forEach((row, index) => {
    console.log(`${index}. ${row.name}`)
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

- `moysklad.POST(path: String|Array<String>, payload: Object|Array<Object>, query?: Object, options?: Object) : Promise`

- `moysklad.POST(args: Object) : Promise`

**Параметры:**

`path` - url ресурс (относительно текущего api)

`payload` - создаваемый обект или коллекция (массив)

`query` - url параметры запроса

`options` - опции запроса

**Пример использования:**

```js
let newProduct = await moysklad.POST('entity/product', { name: 'Новый товар' })
```

### moysklad#PUT

> PUT запрос

- `moysklad.PUT(path: String|Array<String>, payload: Object, query?: Object, options?: Object) : Promise`

- `moysklad.PUT(args: Object) : Promise`

**Параметры:**

`path` - url ресурс (относительно текущего api)

`payload` - обнвляемый обект

`query` - url параметры запроса

`options` - опции запроса

**Пример использования:**

```js
let updatedProduct = await moysklad.PUT(['entity/product', id], product)
```

### moysklad#DELETE

> DELETE запрос

- `moysklad.DELETE(path: String|Array<String>, options?: Object) : Promise`

- `moysklad.DELETE(args: Object) : Promise`

**Параметры:**

`path` - url ресурс (относительно текущего api)

`options` - опции запроса

**Пример использования:**

```js
await moysklad.DELETE(['entity/product', product.id])
```

### moysklad#buildUri

> Формирует url запроса

- `moysklad.buildUri(path: String|Array<String>, query?: Object) : String`

- `moysklad.buildUri(args: Object) : String`

**Параметры:**

`path` - url ресурс (относительно текущего api)

`query` - url параметры запроса

**Пример использования:**

```js
let url = moysklad.buildUri('entity/customerorder', { expand: 'positions' })

assert.equal(url, 'https://online.moysklad.ru/api/remap/1.1/entity/customerorder?expand=positions')
```

### moysklad#parseUri

> Разбор uri на составные компоненты

- `moysklad.parseUri(uri: String) : Object`

**Параметры:**

`uri` - uri ресурс

**Пример использования:**

```js
let parsedUri = moysklad.parseUri('https://online.moysklad.ru/api/remap/1.1/entity/customerorder?expand=positions')

assert.deepEqual(parsedUri, {
  path: ['entity', 'customerorder'],
  query: {
    expand: 'positions'
  }
})
```

### moysklad#fetchUri

> Выполнить запрос по указанному uri

- `moysklad.fetchUri(uri: String, options?: Object) : Promise`

**Параметры:**

`uri` - uri ресурс

`options` - опции запроса

**Пример использования:**

```js
let order = await moysklad.fetchUri('https://online.moysklad.ru/api/remap/1.1/entity/customerorder/eb7bcc22-ae8d-11e3-9e32-002590a28eca')
```

### События

> Описание

#### `request:start`

``` { uri, options } ```

#### `response:head`

``` { uri, options, response } ```

#### `response:body`

``` { uri, options, response, body } ```

#### `error`
