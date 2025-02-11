![moysklad](https://wmakeev-public-files.s3-eu-west-1.amazonaws.com/images/logos/logoMS500x350.png)

# moysklad <!-- omit in toc -->

[![npm](https://img.shields.io/npm/v/moysklad.svg?cacheSeconds=1800&style=flat-square)](https://www.npmjs.com/package/moysklad)
[![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/wmakeev/moysklad/main.yml?style=flat-square)](https://github.com/wmakeev/moysklad/actions/workflows/main.yml)
<!-- [![Codecov](https://img.shields.io/codecov/c/github/wmakeev/moysklad?style=flat-square)](https://app.codecov.io/gh/wmakeev/moysklad/tree/master/) -->

Библиотека для взаимодействия с [JSON API сервиса МойСклад](https://dev.moysklad.ru/) для node.js.

> **ВНИМАНИЕ!** Библиотека находится в стадии становления. API может незначительно меняться. Перед обновлением минорной версии смотрите [историю изменений](https://github.com/wmakeev/moysklad/blob/master/CHANGELOG.md).

Библиотека представляет максимально простой и прозрачный интерфейс к существующим методам [API МойСклад](https://api.moysklad.ru/api/remap/1.2/doc), не абстрагирует разработчика от API и не выполняет никаких внутренних преобразований отправляемых и получаемых данных.

Основная задача библиотеки - упростить ряд рутинных задач:

- формирование строки запроса (передача параметров, заголовков и фильтрация)
- обработка ошибок
- методы для преобразования даты в формат МойСклад и обратно в `Date`
- базовые типы TypeScript для подсказок по API библиотеки (но не для API МойСклад)

Важно отметить, что библиотека не поможет вам разобраться с API МойСклад, но лишь упростит работу с ним.

## Содержание <!-- omit in toc -->

- [Установка](#установка)
- [Использование](#использование)
- [Параметры инициализации](#параметры-инициализации)
- [Аутентификация](#аутентификация)
- [Статические методы](#статические-методы)
  - [getTimeString](#gettimestring)
  - [parseTimeString](#parsetimestring)
  - [parseUrl (статический метод)](#parseurl-статический-метод)
  - [buildFilter](#buildfilter)
  - [buildQuery](#buildquery)
  - [getVersion](#getversion)
- [Методы экземпляра](#методы-экземпляра)
  - [GET](#get)
  - [POST](#post)
  - [PUT](#put)
  - [DELETE](#delete)
  - [getOptions](#getoptions)
  - [getVersion - метод экземпляра](#getversion---метод-экземпляра)
  - [buildUrl](#buildurl)
  - [parseUrl](#parseurl)
  - [fetchUrl](#fetchurl)
  - [Основные аргументы](#основные-аргументы)
    - [path](#path)
    - [query](#query)
      - [querystring](#querystring)
      - [filter](#filter)
      - [order](#order)
      - [expand и limit](#expand-и-limit)
    - [options (параметры запроса)](#options-параметры-запроса)
- [Управление потоком запросов](#управление-потоком-запросов)
- [Обработка ошибок](#обработка-ошибок)
  - [Повтор запроса при ошибке](#повтор-запроса-при-ошибке)
  - [Виды ошибок](#виды-ошибок)
    - [MoyskladError](#moyskladerror)
    - [MoyskladRequestError](#moyskladrequesterror)
    - [MoyskladApiError](#moyskladapierror)
    - [MoyskladCollectionError](#moyskladcollectionerror)
    - [MoyskladUnexpectedRedirectError](#moyskladunexpectedredirecterror)
- [События](#события)
- [История изменений](#история-изменений)
- [Планы развития](#планы-развития)
- [TODO](#todo)

## Установка

> Поддерживаются (тестируются) версии Node.js >=16.8

```bash
npm install moysklad
```

Для Node.js до 18 версии, дополнительно нужно установить библиотеку для
[Fetch API](https://developer.mozilla.org/en/docs/Web/API/Fetch_API) и явно указать модуль с соответствующим интерфейсом при создании экземпляра библиотеки

```bash
npm install undici
```

[undici.fetch](https://github.com/nodejs/undici#undicifetchinput-init-promise)

```js
import { fetch } from 'undici'
import Moysklad from 'moysklad'

const moysklad = Moysklad({ fetch })
```

## Использование

```js
import Moysklad from 'moysklad'

// Для инициализации экземпляра библиотеки указывать ключевое слово new не нужно
const ms = Moysklad({ login, password })

ms.GET('entity/customerorder', {
  filter: {
    applicable: true,
    state: {
      name: 'Отгружен'
    },
    sum: { $gt: 1000000, $lt: 2000000 }
  },
  limit: 10,
  order: 'moment,desc',
  expand: 'agent'
}).then(({ meta, rows }) => {
  console.log(
    `Последние ${meta.limit} из ${meta.size} проведенных заказов ` +
      `в статусе "Отгружен" на сумму от 10000 до 20000 руб`
  )

  // Выводим имя заказа, имя контрагента и сумму заказа для всех позиций
  rows.forEach(row => {
    console.log(`${row.name} ${row.agent.name} ${row.sum / 100}`)
  })
})
```

> Совместно с библиотекой рекомендуется использовать [планировщик запросов](#управление-потоком-запросов)

> С другими примерами использования можно ознакомиться в папке [examples](https://github.com/wmakeev/moysklad/tree/master/examples)

## Параметры инициализации

Все параметры опциональные (имеют значения по умолчанию)

| Параметр     | Значение по умолчанию                                                                            | Описание                                                                                                                                                                                                                                                                                                                           |
| ------------ | ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fetch`      | глобальный fetch                                                                                 | Функция с интерфейсом [Fetch API](https://developer.mozilla.org/ru/docs/Web/API/Fetch_API). Если глобальный fetch не найден, то будет выброшена ошибка при попытке осуществить http запрос. Начиная с Node.js 18 [fetch](https://nodejs.org/dist/latest-v18.x/docs/api/globals.html#fetch) является частью стандартной библиотеки. |
| `retry`      | функция вида `(thunk) => thunk()`                                                                | Функция для управления поведением при возникновении ошибок (см. [Повтор запроса при ошибке](#повтор-запроса-при-ошибке)).                                                                                                                                                                                                          |
| `endpoint`   | `"https://api.moysklad.ru/api"`                                                                  | Точка доступа к API (хост точки доступа можно указать через переменную окружения `MOYSKLAD_HOST`, по умолчанию `api.moysklad.ru`)                                                                                                                                                                                                  |
| `api`        | `"remap"`                                                                                        | Раздел API (можно задать через переменную окружения `MOYSKLAD_API`)                                                                                                                                                                                                                                                                |
| `apiVersion` | `"1.2"`                                                                                          | Версия API (можно задать через переменную окружения `MOYSKLAD_{NAME}_API_VERSION`, где `{NAME}` - название API в верхнем регистре, напр. `MOYSKLAD_REMAP_API_VERSION`)                                                                                                                                                             |
| `token`      | `undefined`                                                                                      | Токен доступа к API (см. [Аутентификация](#аутентификация))                                                                                                                                                                                                                                                                        |
| `login`      | `undefined`                                                                                      | Логин для доступа к API (см. [Аутентификация](#аутентификация))                                                                                                                                                                                                                                                                    |
| `password`   | `undefined`                                                                                      | Пароль для доступа к API (см. [Аутентификация](#аутентификация))                                                                                                                                                                                                                                                                   |
| `emitter`    | `undefined`                                                                                      | экземпляр [EventEmitter](https://nodejs.org/api/events.html#events_class_eventemitter) для передачи [событий библиотеки](#события)                                                                                                                                                                                                 |
| `userAgent`  | `moysklad/{ver} (+https://github.com/wmakeev/moysklad)`, где `{ver}` - текущая версия библиотеки | Содержимое заголовка "User-Agent" при выполнении запроса. Удобно использовать для контроля изменений через API на вкладке "Аудит". Можно задать через переменную окружения `MOYSKLAD_USER_AGENT`.                                                                                                                                  |

Явное задание параметра переопределяет значение заданное в соотв. переменной окружения.

**Пример использования:**

```js
import Moysklad from 'moysklad'

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
   3. Глобальная переменная `window.MOYSKLAD_TOKEN`
   4. Глобальные переменные `window.MOYSKLAD_LOGIN` и `window.MOYSKLAD_PASSWORD`
   5. Глобальная переменная `global.MOYSKLAD_TOKEN`
   6. Глобальные переменные `global.MOYSKLAD_LOGIN` и `global.MOYSKLAD_PASSWORD`

## Статические методы

### getTimeString

> Преобразует локальную дату в строку в формате API МойСклад в часовом поясе Москвы

```ts
Moysklad.getTimeString(date: Date, includeMs?: boolean): string
```

**Параметры:**

`date` - дата

`includeMs` - если `true`, то в дату будут включены миллисекунды

**Пример использования:**

```js
const date = new Date('2017-02-01T07:10:11.123Z')
const timeString = Moysklad.getTimeString(date, true)

assert.equal(timeString, '2017-02-01 10:10:11.123')
```

### parseTimeString

> Преобразует строку с датой в формате API МойСклад в объект даты (с учетом локального часового пояса и часового пояса API МойСклад)

```ts
Moysklad.parseTimeString(date: string) : Date
```

**Параметры:**

`date` - дата в формате МойСклад (напр. `2017-04-08 13:33:00.123`)

**Пример использования:**

```js
const parsedDate = Moysklad.parseTimeString('2017-04-08 13:33:00.123')

assert.equal(parsedDate.toISOString(), '2017-04-08T10:33:00.123Z')
```

### parseUrl (статический метод)

> Разбор url на составные компоненты

Аналогичен [parseUrl](#parseurl) методу экземпляра, за тем исключением, что
на вход принимает только строку в формате href МойСклад.

### buildFilter

> Возвращает строку фильтра по объекту `QueryFilter` (см. [filter](#filter))

```js
Moysklad.buildFilter({ name: { $st: 'foo' } })
// 'code=123;name~=foo'
```

### buildQuery

> Формирует строку с параметрами запроса по объекту `Query` (см. [query](#query))

```js
Moysklad.buildQuery({
  filter: { name: 'foo' },
  limit: 100,
  foo: 'bar'
})

// 'filter=name%3Dfoo&limit=100&foo=bar'
```

### getVersion

> Возвращает текущую версию библиотеки. Версия из package.json (поле `version`)

## Методы экземпляра

### GET

> GET запрос

```ts
ms.GET(path: string, query?: object, options?: object): Promise
```

**Параметры:**

`path` - [url ресурса](#path)

`query` - [параметры запроса](#query)

`options` - [опции запроса](#options-параметры-запроса)

**Пример использования:**

```js
const productsCollection = await ms.GET('entity/product', { limit: 50 })

const order = await ms.GET(`entity/customerorder/${orderId}`, {
  expand: 'positions'
})
```

### POST

> POST запрос

```ts
ms.POST(
  path: string,
  payload?: object | Array<object>,
  query?: object,
  options?: object
): Promise
```

**Параметры:**

`path` - [url ресурса](#path)

`payload` - объект или коллекция объектов (будет преобразовано в строку методом `JSON.stringify`)

`query` - [параметры запроса](#query)

`options` - [опции запроса](#options-параметры-запроса)

**Пример использования:**

```js
const newProduct = await ms.POST('entity/product', { name: 'Новый товар' })
```

По умолчанию, при массовом обновлении сущностей, если _хотя бы один_ из элементов в ответе содержит ошибку, то метод выбросит ошибку
[MoyskladCollectionError](#moyskladcollectionerror) .

Если такое поведение не является предпочтительным, то можно обрабатывать ошибки при массовом обновлении/создании объектов вручную (см. `muteCollectionErrors` в [параметрах запроса](#options-параметры-запроса)):

```js
const updated = await ms.POST('entity/supply', supplyList, null, {
  muteCollectionErrors: true
})

const errors = updated
  .filter(item => item.errors)
  .map(item => item.errors[0].error)

if (errors.length) {
  console.log('Есть ошибки:', errors.join(', '))
}

const supplyHrefList = updated
  .filter(item => !item.errors)
  .map(item => item.meta.href)
```

### PUT

> PUT запрос

```ts
ms.PUT(
  path: string | string[],
  payload?: object,
  query?: object,
  options?: object
) : Promise
```

**Параметры:**

`path` - [url ресурса](#path)

`payload` - обновляемый объект (будет преобразован в строку методом `JSON.stringify`)

`query` - [параметры запроса](#query)

`options` - [опции запроса](#options-параметры-запроса)

**Пример использования:**

```js
const updatedProduct = await ms.PUT(`entity/product/${id}`, product)
```

### DELETE

> DELETE запрос

```ts
ms.DELETE(path: string, options?: object): Promise
```

**Параметры:**

`path` - [url ресурса](#path)

`options` - [опции запроса](#options-параметры-запроса)

Метод `DELETE` возвращает `undefined` при успешном запросе.

**Пример использования:**

```js
await ms.DELETE(`entity/product/${product.id}`)
```

### getOptions

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

### getVersion - метод экземпляра

> Аналогичен статическому методу [getVersion](#getversion)

### buildUrl

> Формирует url запроса

```ts
ms.buildUrl(url: string, query?: object): string
```

**Параметры:**

`url` - полный url (должен соответствовать настройкам)

`path` - [url ресурса](#path)

`query` - [параметры запроса](#query)

**Пример использования:**

```js
const url = ms.buildUrl(
  'https://api.moysklad.ru/api/remap/1.2/entity/customerorder?expand=positions',
  { limit: 100 }
)

assert.equal(
  url,
  'https://api.moysklad.ru/api/remap/1.2/entity/customerorder?expand=positions&limit=100'
)
```

```js
const url = ms.buildUrl('entity/customerorder', { expand: 'positions' })

assert.equal(
  url,
  'https://api.moysklad.ru/api/remap/1.2/entity/customerorder?expand=positions'
)
```

Можно безопасно дублировать символы `/`, лишние знаки будут исключены из
результирующего url

```js
const positionUrl = `/positions/${posId}/`

const url = ms.buildUrl(`entity/customerorder/` + positionUrl)

assert.equal(
  url,
  `https://api.moysklad.ru/api/remap/1.2/entity/customerorder/positions/${posId}`
)
```

### parseUrl

> Разбор url на составные компоненты

```ts
ms.parseUrl(url: string): {
  endpoint: string
  api: string
  apiVersion: string
  path: Array<string>
  query: object
}
```

**Параметры:**

`url` - url ресурса

**Пример использования:**

```js
const parsedUri = ms.parseUrl('https://api.moysklad.ru/api/remap/1.2/entity/customerorder?expand=positions')

assert.deepEqual(parsedUri, {
  endpoint: 'https://api.moysklad.ru/api',
  api: 'remap'
  apiVersion: '1.2',
  path: ['entity', 'customerorder'],
  query: {
    expand: 'positions'
  }
})
```

### fetchUrl

> Выполнить запрос по указанному url

```ts
ms.fetchUrl(url: string, options?: object): Promise
```

**Параметры:**

`url` - url ресурса

`options` - [опции запроса](#options-параметры-запроса)

**Пример использования:**

```js
const url = `https://api.moysklad.ru/api/remap/1.2/entity/customerorder/eb7bcc22-ae8d-11e3-9e32-002590a28eca`

const patch = { applicable: false }

const updatedOrder = await ms.fetchUrl(url, {
  method: 'PUT',
  body: JSON.stringify(patch)
})
```

### Основные аргументы

#### path

Строка.

**Примеры:**

Url запроса можно указать полностью

```js
ms.GET(
  `https://api.moysklad.ru/api/remap/1.2/entity/customerorder/${ORDER_ID}/positions/${POSITION_ID}?expand=assortment`
)
```

Но гораздо удобнее указывать путь только после версии API и выносить
параметры запроса в параметры метода. Полный url будет сгенерирован автоматически, согласно [настройкам экземпляра](#параметры-инициализации).

Ниже пример аналогичного запроса:

```js
ms.GET(`entity/customerorder/${ORDER_ID}/positions/${POSITION_ID}`, {
  expand: 'assortment'
})
```

Можно безопасно дублировать символы `/`, лишние знаки будут исключены из
результирующего url

```js
const positionUrl = `/positions/${posId}`

ms.GET(`entity/customerorder/` + positionUrl)
```

#### query

##### querystring

Все поля объекта запроса преобразуются в соответствующую строку запроса url. Некоторые поля могут подвергаться преобразованию (напр. поля [`filter`](#filter) и [`order`](#order)).

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

// https://api.moysklad.ru/api/remap/1.2/entity/demand?str=some%20string&num=1&bool=true&nil=&arr=str&arr=1&arr=true&arr=
ms.GET('entity/demand', query)
```

##### filter

Если поле `filter` объект, то вложенные поля `filter` преобразуются в параметры фильтра в строке запроса в соответствии со следующими правилами:

- `string`, `number`, `boolean` не проходят дополнительных преобразований (`key=value`)
- `null` преобразуется в пустую строку (`key=`)
- `Date` преобразуется в строку методом [`getTimeString`](#gettimestring) (`key=YYYY-MM-DD HH:mm:ss`)
- `object` интерпретируется как набор селекторов или вложенных полей (см. пример ниже)

**Пример фильтра:**

```js
const query = {
  filter: {
    name: '00001',
    code: [1, 2, '03'],
    foo: new Date(2000, 0, 1),
    state: {
      name: 'Оформлен'
    },
    moment: {
      $gt: new Date(2000, 0, 1),
      $lte: new Date(2001, 0, 2, 10, 0, 15, 123)
    },
    bar: {
      baz: 1,
      $exists: true
    }
  }
}
```

соответствует следующему значению поля `filter` в запросе (даты переданы в часовом поясе +5):

```txt
bar!=;bar.baz=1;code=03;code=1;code=2;foo=1999-12-31 22:00:00;moment<=2001-01-02 08:00:15.123;moment>1999-12-31 22:00:00;name=00001;state.name=Оформлен
```

Для построения фильтра можно использовать селекторы в стиле Mongo (как в примере выше).

Подробное описание всех возможных селекторов:

| Селектор                             | Фильтр МойСклад               | Описание                   |
| ------------------------------------ | ----------------------------- | -------------------------- |
| `key: { $eq: value }`                | `key=value`                   | равно                      |
| `key: { $ne: value }`                | `key!=value`                  | не равно                   |
| `key: { $gt: value }`                | `key>value`                   | больше                     |
| `key: { $gte: value }`               | `key>=value`                  | больше или равно           |
| `key: { $lt: value }`                | `key<value`                   | меньше                     |
| `key: { $lte: value }`               | `key<=value`                  | меньше или равно           |
| `key: { $st: value }`                | `key~=value`                  | начинается со строки       |
| `key: { $et: value }`                | `key=~value`                  | заканчивается строкой      |
| `key: { $contains: value }`          | `key~value`                   | содержит строку            |
| `key: { $in: [..] }` или `key: [..]` | `key=value1;key=value2;...`   | входит в                   |
| `key: { $nin: [..] }`                | `key!=value1;key!=value2;...` | не входит в                |
| `key: { $exists: true }`             | `key!=`                       | наличие значения (не null) |
| `key: { $exists: false }`            | `key=`                        | пустое значение (null)     |
| `key: { $all: [{..}, ..] }`          |                               | объединение условий        |
| `key: { $not: {..} }`                |                               | отрицание условия          |

На один ключ можно использовать несколько селекторов.

Подробнее с правилами фильтрации можно ознакомится в документации МойСклад:

- [Фильтрация выборки с помощью параметра filter](https://dev.moysklad.ru/doc/api/remap/1.2/#mojsklad-json-api-obschie-swedeniq-fil-traciq-wyborki-s-pomosch-u-parametra-filter)
- [Оператор фильтрации "подобие"](https://dev.moysklad.ru/doc/api/remap/1.2/#mojsklad-json-api-obschie-swedeniq-operator-fil-tracii-quot-podobie-quot)
- [Фильтрация](https://dev.moysklad.ru/doc/api/remap/1.2/workbook/#workbook-fil-traciq-listanie-poisk-i-sortirowka-fil-traciq)

##### order

Если поле `order` массив, то произойдет преобразование записи из формы массива в строку.

**Примеры:**

- `['name']` → `'name'`
- `[['code','desc']]` → `'code,desc'`
- `['name', ['code','desc']]` → `'name;code,desc'`
- `['name,desc', ['code','asc'], ['moment']]` → `'name,desc;code,asc;moment'`

👉 [examples/query.js](https://github.com/wmakeev/moysklad/blob/master/examples/query.js)

##### expand и limit

Обратите внимание на то, что если указано значение expand, то необходимо явно указать значение для limit меньше или равное 100, иначе expand [будет проигнорирован](https://dev.moysklad.ru/doc/api/remap/1.2/workbook/#workbook-chto-takoe-expand).

#### options (параметры запроса)

Все поля указанные в объекте `options`, за исключением описанных в этом разделе, передаются напрямую в опции fetch ([fetch options](https://developer.mozilla.org/en-US/docs/Web/API/Window/fetch#options)).

Поля описанные ниже обрабатываются только библиотекой moysklad и не передаются в fetch:

| Поле                        | Тип       | Описание                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| --------------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `rawResponse`               | `boolean` | Если `true`, то метод вернет исходный объект [Response](https://developer.mozilla.org/en-US/docs/Web/API/Response). Код и содержимое ответа не проверяется на ошибки. Тело ответа нужно [прочитать самостоятельно](https://github.com/nodejs/undici?tab=readme-ov-file#garbage-collection).                                                                                                                                                                                                                                                                                            |
| `includeResponse`           | `boolean` | Если `true`, то метод вернет массив из двух элементов - результат и объект [Response](https://developer.mozilla.org/en-US/docs/Web/API/Response). Ошибки будут обработаны как при обычном запросе.                                                                                                                                                                                                                                                                                                                                                                                     |
| `rawRedirect`               | `boolean` | Если ответ сервера с кодом в диапазоне 300-399 (редирект), то будет выброшена ошибка [MoyskladUnexpectedRedirectError](#moyskladunexpectedredirecterror), поэтому, явной обработки редиректа необходимо указать опцию `rawRedirect` со значением `true`. В этом случае метод вернет объект [Response](https://developer.mozilla.org/en-US/docs/Web/API/Response), из которого можно получить Location заголовок. Такое поведение сработает, только если явно не указана опция [redirect](https://developer.mozilla.org/en-US/docs/Web/API/RequestInit#redirect) со значением `follow`. |
| `muteApiErrors`             | `boolean` | Если `true` и запрос завершился ошибкой API, то метод вернет объект с описанием ошибки из тела ответа как результат. Такое поведение уместно если вы хотите вручную обработать ошибку. Прочие ошибки, которые не содержат JSON ответа (напр. ошибки соединения), продолжат выбрасываться в штатном режиме. Для игнорирования ошибок только внутри коллекций, используйте опцию `muteCollectionErrors`.                                                                                                                                                                                 |
| `muteCollectionErrors`      | `boolean` | Если `true`, то все ошибки внутри коллекций при массовом обновлении сущностей будут проигнорированы. В этом случае ошибки нужно будет отфильтровать и обработать вручную.                                                                                                                                                                                                                                                                                                                                                                                                              |
| `precision`                 | `boolean` | Если `true`, то в запрос будет включен заголовок `X-Lognex-Precision` со значением `true` (отключение округления цен и себестоимости до копеек).                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ~~`webHookDisable`~~        | `boolean` | (deprecated) Если `true`, то в запрос будет включен заголовок `X-Lognex-WebHook-Disable` со значением `true` (отключить уведомления вебхуков в контексте данного запроса). Не рекомендуется использовать данную опцию, применяйте `webHookDisableByPrefix`.                                                                                                                                                                                                                                                                                                                            |
| `webHookDisableByPrefix`    | `string`  | Префикс url для выборочного отключения вебхуков, будет добавлен в качестве значения заголовка `X-Lognex-WebHook-DisableByPrefix`.                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `downloadExpirationSeconds` | `number`  | Устанавливает значение для заголовка `X-Lognex-Download-Expiration-Seconds` (подробнее см. [Ссылки на файлы](https://dev.moysklad.ru/doc/api/remap/1.2/#mojsklad-json-api-obschie-swedeniq-ssylki-na-fajly))                                                                                                                                                                                                                                                                                                                                                                           |

<details>
  <summary>Примеры</summary>

- Формирование заполненного шаблона печатной формы и получение ссылки для загрузки ([examples/download-print-form.js](https://github.com/wmakeev/moysklad/blob/master/examples/download-print-form.js)):

  ```js
  import path from 'node:path'
  import { writeFile } from 'node:fs/promises'
  import { fetch } from 'undici'
  import Moysklad from 'moysklad'

  const TEMPLATE_ID = '8a686b8a-9e4a-11e5-7a69-97110004af3e'
  const DEMAND_ID = '13abf361-e9c6-45ea-a940-df70289a7f95'

  async function downloadPrintForm() {
    const ms = Moysklad({ fetch })

    const body = {
      template: {
        meta: {
          href: ms.buildUrl(
            `entity/demand/metadata/customtemplate/${TEMPLATE_ID}`
          ),
          type: 'customtemplate',
          mediaType: 'application/json'
        }
      },
      extension: 'pdf'
    }

    /** @type {import('undici').Response} */
    const response = await ms.POST(
      `entity/demand/${DEMAND_ID}/export`,
      body,
      null,
      // вернуть результат запроса с редиректом без предварительного разбора
      { rawRedirect: true }
    )

    const location = response.headers.get('location')

    console.log(location)
    // 'https://print-prod.moysklad.ru/temp/.../00123.pdf'

    const formResponse = await fetch(location)

    const blob = await formResponse.blob()

    const buffer = Buffer.from(await blob.arrayBuffer())

    await writeFile(path.join(process.cwd(), '__temp/form.pdf'), buffer)
  }

  downloadPrintForm()
  ```

- Указание HTTP заголовка

  ```js
  const ms = Moysklad()

  const folder = {
    meta: {
      type: 'productfolder',
      href: ms.buildUrl(`entity/productfolder/${FOLDER_ID}`)
    },
    description: 'Новое описание группы товаров'
  }

  // Указываем кастомный заголовок X-Lognex-WebHook-Disable для PUT запроса
  const updatedFolder = await ms.PUT(
    `entity/productfolder/${FOLDER_ID}`,
    folder,
    null,
    {
      // вместо этого можно использовать webHookDisable: true
      headers: {
        'X-Lognex-WebHook-Disable': true
      }
    }
  )

  assert.equal(updatedFolder.description, folder.description)
  ```

- Автоматический редирект

  Идентификаторы товаров в приложении МойСклад отличаются от идентификаторов в API. Поэтому, при запросе товара по id из приложения, будет выполнен редирект на другой href.

  ```js
  const ms = Moysklad({ fetch })

  // https://api.moysklad.ru/app/#good/edit?id=cb277549-34f4-4029-b9de-7b37e8e25a54
  const PRODUCT_UI_ID = 'cb277549-34f4-4029-b9de-7b37e8e25a54'

  // Error: 308 Permanent Redirect
  await ms.fetchUrl(ms.buildUrl(`entity/product/${PRODUCT_UI_ID}`))

  // Указана опция redirect
  const product = await ms.fetchUrl(
    ms.buildUrl(`entity/product/${PRODUCT_UI_ID}`),
    { redirect: 'follow' }
  )

  assert.ok(product) // OK
  ```

</details>

## Управление потоком запросов

Для управления потоком запросов с целью уложиться в [ограничения](https://dev.moysklad.ru/doc/api/remap/1.2/#mojsklad-json-api-ogranicheniq) API МойСклад можно использовать планировщик запросов [moysklad-fetch-planner](https://www.npmjs.com/package/moysklad-fetch-planner).

Планировщик считывает информацию о текущих лимитах из заголовков ответов API МойСклад и ограничивает скорость выполнения запросов, предотвращая появление ошибок `429 Too Many Requests`.

В случае если ошибки 429 избежать не удалось, запрос будет повторен при восстановлении доступного лимита.

**Пример использования:**

```ts
import Moysklad from 'moysklad'
import { fetch } from 'undici'
import { wrapFetchApi } from 'moysklad-fetch-planner'

const ms = Moysklad({ fetch: wrapFetchApi(fetch) })
```

## Обработка ошибок

### Повтор запроса при ошибке

При инициализации клиента есть возможность задать свою логику обработки ошибочных запросов. В примере ниже код для автоматического повтора запроса при получении ошибки.

<details>
  <summary>Пример</summary>

```js
import Moysklad from 'moysklad'
import { wrapFetch } from 'moysklad-fetch-planner'
import pRetry from 'p-retry'
import { fetch } from 'undici'

/**
 * Пример настройки клиента для API МойСклад.
 *
 * 1. Подключается планировщик запросов `moysklad-fetch-planner` для автоматического
 * контроля за лимитами для предотвращения возникновения ошибки `429 Too Many Request`.
 *
 * 2. Подключается механизм повтора ошибочных запросов для случаев когда ошибка
 * могла быть вызвана временными неполадками в процессе выполнения запроса (для
 * примера используется npm библиотека `p-retry`).
 */
const ms = Moysklad({
  fetch: wrapFetch(fetch),
  retry: (thunk, signal) => {
    return pRetry(thunk, {
      retries: 2,
      shouldRetry: Moysklad.shouldRetryError,
      onFailedAttempt: error => {
        console.log(
          `Attempt ${error.attemptNumber} failed. There are ${error.retriesLeft} retries left.`
        )
      },
      signal
    })
  }
})

try {
  // Запрос с ошибкой в url-запроса повторяться не будет, если API МойСклад
  // вернул об этом сообщение.
  await ms.GET('foo')
  // ↳ Attempt 1 failed. There are 2 retries left.
} catch (err) {
  console.log(err)
  // ↳ MoyskladApiError: Неопознанный путь: https://api.moysklad.ru/api/remap/1.2/foo (https://dev.moysklad.ru/doc/api/remap/1.2/#error_1002)
}

try {
  // Запрос с ошибкой которая имеет HTTP код `503` (в том числе, и другие коды
  // `5xx`) будет повторяться. Т.к. подобная ошибка иногда может быть вызвана
  // временными сбоями на стороне сервера API МойСклад.
  await ms.fetchUrl(
    'https://api.moysklad.ru/api/remap/1.0/entity/customerorder'
  )
  // ↳ Attempt 1 failed. There are 2 retries left.
  // ↳ Attempt 2 failed. There are 1 retries left.
  // ↳ Attempt 3 failed. There are 0 retries left.
} catch (err) {
  console.log(err)
  // ↳ MoyskladRequestError: 503 Service Unavailable
}

try {
  // Запрос с ошибкой которая имеет код `ENOTFOUND` (и ряд других) будет
  // повторяться. Т.к. такая ошибка иногда может быть вызвана сбоями в процессе
  // HTTP соединения.
  await ms.fetchUrl('https://example')
  // ↳ Attempt 1 failed. There are 2 retries left.
  // ↳ Attempt 2 failed. There are 1 retries left.
  // ↳ Attempt 3 failed. There are 0 retries left.
} catch (err) {
  console.log(err)
  // ↳ TypeError: fetch failed
}

// Запросы вызвавшие ошибки с кодами 429 обрабатываются и повторяются внутри
// планировщика. При подключении планировщика обрабатывать в `retry` такие
// ошибки не нужно.
```

</details>

### Виды ошибок

В рамках работы с библиотекой выделены следующие виды ошибок:

| №   | Название ошибки         | Класс ошибки                                                        | Наследует                                     | Описание                                                                                                                                            |
| --- | ----------------------- | ------------------------------------------------------------------- | --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Ошибка библиотеки**   | [MoyskladError](#moyskladerror)                                     | Error                                         | Ошибка библиотеки (например не верно указаны параметры одного из методов).                                                                          |
| 2   | **Ошибка запроса**      | [MoyskladRequestError](#moyskladrequesterror)                       | [MoyskladError](#moyskladerror)               | Ответ получен с кодом ошибки, тело ответа НЕ содержит JSON с описанием ошибки в формате МойСклад.                                                   |
| 3   | **Ошибка API МойСклад** | [MoyskladApiError](#moyskladapierror)                               | [MoyskladRequestError](#moyskladrequesterror) | Ответ получен с кодом ошибки, тело ответа содержит JSON с описанием ошибки в формате МойСклад.                                                      |
| 4   | **Ошибка в коллекции**  | [MoyskladCollectionError](#moyskladcollectionerror)                 | [MoyskladApiError](#moyskladapierror)         | Ошибка в одном из элементов внутри коллекции.                                                                                                       |
| 5   | **Неявный редирект**    | [MoyskladUnexpectedRedirectError](#moyskladunexpectedredirecterror) | [MoyskladRequestError](#moyskladrequesterror) | Ошибка возникает когда запрос вернул перенаправление (код `3xx`) и явно не указана опция запроса `rawRedirect` (опция `redirect` не равна `follow`) |

Библиотека дает возможность указать параметры запроса `muteApiErrors` и `muteCollectionErrors` для игнорирования ошибок API п.3 и п.4 соответственно.

Ошибки глобального fetch модуля или переданного при инициализации экземпляра не перехватываются внутри библиотеки. Т.е. все описанные выше ошибки, связанные с выполнением запроса, формируются уже после анализа полученного ответа.

#### MoyskladError

> Внутренняя ошибка библиотеки не связанная с выполнением запроса к API

Наследует класс `Error`

<details>
  <summary>Примеры</summary>

Код с ошибкой:

```js
await ms.GET('entity/product', {
  filter: 123
})
```

Структура ошибки:

```json
{
  "name": "MoyskladError",
  "message": "Поле filter запроса должно быть строкой или объектом"
}
```

</details>

#### MoyskladRequestError

> Ошибка при выполнении запроса

Наследует класс [MoyskladError](#moyskladerror)

<details>
  <summary>Примеры</summary>

Код с ошибкой:

```js
const ms = Moysklad({ fetch, api: 'foo', apiVersion: '0' })

await ms.GET('foo/bar')
```

Структура ошибки:

```json
{
  "name": "MoyskladRequestError",
  "message": "404 Not Found",
  "url": "https://api.moysklad.ru/api/foo/0/foo/bar",
  "status": 404,
  "statusText": "Not Found"
}
```

</details>

#### MoyskladApiError

> Ошибка API МойСклад

Наследует класс [MoyskladRequestError](#moyskladrequesterror)

Ошибка формируется в случае, если API помимо HTTP кода ошибки, так же вернуло стандартное описание ошибки МойСклад в формате JSON. В обратном случае (ответ не содержит JSON с ошибкой) будет выброшена ошибка [MoyskladRequestError](#moyskladrequesterror)

<details>
  <summary>Примеры</summary>

Код с ошибкой:

```js
await ms.GET('entity/product2')
```

Структура ошибки:

```json
{
  "name": "MoyskladApiError",
  "message": "Неизвестный тип: 'product2' (https://dev.moysklad.ru/doc/api/remap/1.2/#error_1005)",
  "url": "https://api.moysklad.ru/api/remap/1.2/entity/product2",
  "status": 412,
  "statusText": "Precondition Failed",
  "code": 1005,
  "moreInfo": "https://dev.moysklad.ru/doc/api/remap/1.2/#error_1005",
  "errors": [
    {
      "error": "Неизвестный тип: 'product2'",
      "code": 1005,
      "moreInfo": "https://dev.moysklad.ru/doc/api/remap/1.2/#error_1005"
    }
  ]
}
```

Можно игнорировать ошибку API, указав `muteApiErrors:true` в опциях запроса.

```js
const rawError1 = await ms.GET('entity/product2', null, {
  muteApiErrors: true
})

console.log(rawError1.errors[0].error)
// Неизвестный тип: 'product2'
```

</details>

#### MoyskladCollectionError

> Ошибка в коллекции при массовом создании/изменении сущностей

Наследует класс [MoyskladApiError](#moyskladapierror)

Ошибка выбрасывается когда возвращаемая коллекция содержит хотя бы одну ошибку.

Например, когда при массовом обновлении нескольких объектов часть из них не были обновлены, то API вернет массив с результатами в части которых будет указана ошибка.

<details>
  <summary>Примеры</summary>
Код с ошибкой:

```js
await ms.POST('entity/product', [
  { foo: 'bar' },
  {
    meta: {
      type: 'product',
      href: ms.buildUrl(`entity/product/${uuidFromApi}`)
    },
    weight: 42
  },
  { name: 123 }
])
```

Структура ошибки:

```json
{
  "name": "MoyskladCollectionError",
  "message": "Ошибка сохранения объекта: поле 'name' не может быть пустым или отсутствовать (https://dev.moysklad.ru/doc/api/remap/1.2/#error_3000)",
  "url": "https://api.moysklad.ru/api/remap/1.2/entity/product",
  "status": 400,
  "statusText": "Bad Request",
  "code": 3000,
  "moreInfo": "https://dev.moysklad.ru/doc/api/remap/1.2/#error_3000",
  "line": 1,
  "column": 3,
  "errors": [
    {
      "error": "Ошибка сохранения объекта: поле 'name' не может быть пустым или отсутствовать",
      "code": 3000,
      "parameter": "name",
      "moreInfo": "https://dev.moysklad.ru/doc/api/remap/1.2/#error_3000",
      "line": 1,
      "column": 3
    },
    {
      "error": "Ошибка формата: значение поля 'name' не соответствует типу строка",
      "code": 2016,
      "moreInfo": "https://dev.moysklad.ru/doc/api/remap/1.2/#error_2016",
      "line": 1,
      "column": 169
    }
  ],
  "errorsIndexes": [
    [
      0,
      [
        {
          "error": "Ошибка сохранения объекта: поле 'name' не может быть пустым или отсутствовать",
          "code": 3000,
          "parameter": "name",
          "moreInfo": "https://dev.moysklad.ru/doc/api/remap/1.2/#error_3000",
          "line": 1,
          "column": 3
        }
      ]
    ],
    [
      2,
      [
        {
          "error": "Ошибка формата: значение поля 'name' не соответствует типу строка",
          "code": 2016,
          "moreInfo": "https://dev.moysklad.ru/doc/api/remap/1.2/#error_2016",
          "line": 1,
          "column": 169
        }
      ]
    ]
  ]
}
```

Можно игнорировать ошибки в коллекции, указав `muteCollectionErrors:true`
в опциях запроса.

```js
const result2 = await ms.POST(
  'entity/product',
  [
    { foo: 'bar' },
    {
      meta: {
        type: 'product',
        href: ms.buildUrl(`entity/product/${uuidFromApi}`)
      },
      weight: 42
    },
    { name: 123 }
  ],
  null,
  {
    muteCollectionErrors: true
  }
)

const collItemError = result2.find(it => it.errors)

if (collItemError) {
  console.log(collItemError.errors[0].error)
  // Ошибка сохранения объекта: поле 'name' не может быть пустым или отсутствовать
}
```

</details>

#### MoyskladUnexpectedRedirectError

> Ошибка если запрос вернул перенаправление (код `3xx`), когда явно не указана опция запроса `rawRedirect` и опция `redirect` не равна `follow`

Наследует класс [MoyskladRequestError](#moyskladrequesterror)

<details>
  <summary>Примеры</summary>

```js
/** id товара из приложения МойСклад */
const uuidFromApp = 'cb277549-34f4-4029-b9de-7b37e8e25a54'

/** id товара из API (отличается от id из приложения) */
let uuidFromApi

const getProduct = id => ms.GET(`entity/product/${id}`)

try {
  await getProduct(uuidFromApp)
} catch (err) {
  if (err instanceof Moysklad.MoyskladUnexpectedRedirectError) {
    uuidFromApi = ms.parseUrl(err.location).path.pop()
    await getProduct(uuidFromApi)
  } else {
    throw err
  }
}
```

Можно обработать перенаправление без перехвата ошибки:

```js
let product = await ms.GET(`entity/product/${uuidFromApp}`, null, {
  rawRedirect: true
})

if (product instanceof Response) {
  uuidFromApi = ms.parseUrl(product.headers.get('location')).path.pop()

  product = await ms.GET(`entity/product/${uuidFromApi}`)
}

console.log(product.id === uuidFromApp) // false
```

Или использовать автоматическое перенаправление, указав значение `follow` в опции `redirect`:

```js
const product = await ms.GET(`entity/product/${uuidFromApp}`, null, {
  redirect: 'follow'
})

console.log(product.id === uuidFromApp) // false
```

</details>

## События

| Событие         | Передаваемый объект                           | Момент наступления            |
| --------------- | --------------------------------------------- | ----------------------------- |
| `request`       | `{ requestId, url, options }`                 | Отправлен http запрос         |
| `response`      | `{ requestId, url, options, response }`       | Получен ответ на запрос       |
| `response:body` | `{ requestId, url, options, response, body }` | Загружено тело ответа         |
| `error`         | `Error`, `{ requestId }`                      | Ошибка при выполнении запроса |

<details>
  <summary>Примеры</summary>

```js
import { fetch } from 'undici'
import { EventEmitter } from 'events'
import Moysklad from 'moysklad'

/** @type {Moysklad.MoyskladEmitter} */
const emitter = new EventEmitter()

const ms = Moysklad({ fetch, emitter })

emitter
  .on('request', ({ requestId, url, options }) => {
    console.log(`${requestId} ${options.method} ${url}`)
  })
  .on('error', (err, { requestId }) => {
    console.log(requestId, err)
  })

ms.GET('entity/customerorder', { limit: 1 }).then(res => {
  console.log('Order name: ' + res.rows[0].name)
})
```

Более подробный пример смотрите в [examples/events.js](https://github.com/wmakeev/moysklad/blob/master/examples/events.js).

</details>

## История изменений

[CHANGELOG.md](https://github.com/wmakeev/moysklad/blob/master/CHANGELOG.md)

## Планы развития

Планируется немного переработанная версия библиотеки в другом репозитории и npm пакете. Без концептуальных изменений, но с убранным легаси кодом.

- Переписать на TypeScript
- Добавить новый метод для формирования объекта запроса
- Убрать всё легаси (в том числе то, что тянет лишние зависимости - "have2" и "stampit")
- Более развернутая документация с автогенерацией части описаний методов

## TODO

Свалка мыслей по развитию библиотеки - [TODO.md](https://github.com/wmakeev/moysklad/blob/master/TODO.md)
