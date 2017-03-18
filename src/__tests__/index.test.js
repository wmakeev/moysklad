'use strict'

const test = require('blue-tape')
const Moysklad = require('..')

test('Moysklad constructor', t => {
  t.ok(Moysklad)
  t.end()
})

test('Moysklad static methods', t => {
  t.equals(typeof Moysklad.getTimeString, 'function')
  t.end()
})

test('Moysklad instance methods', t => {
  let ms = Moysklad()
  t.ok(ms)
  t.equals(typeof ms.getOptions, 'function')
  t.equals(typeof ms.getAuthHeader, 'function')
  t.equals(typeof ms.fetchUri, 'function')
  t.equals(typeof ms.buildUri, 'function')
  t.equals(typeof ms.parseUri, 'function')
  t.equals(typeof ms.GET, 'function')
  t.equals(typeof ms.POST, 'function')
  t.equals(typeof ms.PUT, 'function')
  t.equals(typeof ms.DELETE, 'function')
  t.end()
})

test('Create Moysklad instance with options', t => {
  let options = {
    login: 'login',
    password: 'password'
  }

  let ms = Moysklad(options)
  t.ok(ms)

  let msOptions = ms.getOptions()
  t.true(msOptions !== options)
  t.equals(msOptions.login, 'login')
  t.equals(msOptions.password, 'password')

  t.end()
})

test('Moysklad#buildUri method', t => {
  let ms = Moysklad()

  t.equals(ms.buildUri(['/path/', 'To//My', 'Res/']),
    'https://online.moysklad.ru/api/remap/1.1/path/to/my/res')

  t.equals(ms.buildUri(['path', 'to', 'res'], {
    a: 1,
    b: 'tow',
    c: true,
    d: [1, '2']
  }), 'https://online.moysklad.ru/api/remap/1.1/path/to/res?a=1&b=tow&c=true&d=1&d=2')

  t.equals(ms.buildUri(['path', 'to', 'res'], {
    a: 1,
    filter: { name: 'foo', value: { $eq: 'bar' } }
  }), 'https://online.moysklad.ru/api/remap/1.1/path/to/res?a=1&filter=name%3Dfoo%3Bvalue%3Dbar')

  t.end()
})

test('Moysklad#parseUri method', t => {
  let ms = Moysklad()
  let { endpoint, api, apiVersion } = ms.getOptions()

  let common = { endpoint, api, apiVersion }

  t.deepEqual(ms.parseUri('https://online.moysklad.ru/api/remap/1.1/path/to/my/res'),
    Object.assign({}, common, {
      path: ['path', 'to', 'my', 'res'],
      query: undefined
    }))

  t.deepEqual(ms.parseUri('https://online.moysklad.ru/api/remap/1.1/path/to/my/res?a=1&b=2&' +
    'a=one&c=&foo.bar=baz&filter=name%3Dfoo%3Bvalue%3Dbar'),
    Object.assign({}, common, {
      path: ['path', 'to', 'my', 'res'],
      query: {
        a: [1, 'one'],
        b: 2,
        c: null,
        'foo.bar': 'baz',
        filter: 'name=foo;value=bar'
        // TODO Filter parsing
        // filter: {
        //   name: 'foo',
        //   value: 'bar'
        // }
      }
    }))

  t.end()
})

test('Moysklad#GET method', async t => {
  let ms = Moysklad()

  let counterparties = await ms.GET('entity/counterparty', { limit: 1 })
  t.equals(typeof counterparties, 'object', 'should return object')
  t.ok(counterparties.rows instanceof Array, 'should return counterparties collection')

  let [employee, group] = await Promise.all([
    ms.fetchUri(counterparties.context.employee.meta.href),
    ms.fetchUri(counterparties.rows[0].group.meta.href)
  ])

  t.equals(typeof employee, 'object',
    'Moysklad#fetchUri method should fetch employee object by href')

  t.equals(typeof group, 'object',
    'Moysklad#fetchUri method should fetch group object by href')
})

test('Moysklad#POST/PUT/DELETE', async t => {
  let ms = Moysklad()

  let code = 'test-' + Date.now()
  let product = {
    name: 'TEST-' + Date.now(),
    code,
    attributes: [
      {
        id: '0008b3f4-1897-11e3-d76c-7054d21a8d1e',
        name: 'Вид товара',
        value: {
          name: 'Рюкзак'
        }
      },
      {
        id: 'f4c073c5-1bcc-4d91-8b41-ed825495b677',
        name: 'Бренд',
        value: {
          name: 'No Brand'
        }
      },
      {
        id: '71f17086-1a7f-47f1-b447-59b71351bfad',
        name: 'Сезон',
        value: {
          name: '02 Осень/Зима'
        }
      },
      {
        id: 'b4bee095-4278-4147-95e0-0328c9207be0',
        name: 'Вид номенклатуры',
        value: {
          name: 'Товары в обороте'
        }
      }
    ]
  }

  let newProduct = await ms.POST('entity/product', product)

  t.ok(newProduct, 'POST should create new entity')
  t.equals(newProduct.name, product.name, 'new entity name should equals')
  t.equals(newProduct.code, code, 'new entity name should have some property')

  code = 'test-' + Date.now()
  newProduct = await ms.PUT(['entity/product', newProduct.id], { code })

  t.ok(newProduct, 'PUT should update entity')
  t.equals(newProduct.code, code, 'updated entity field should be equal')

  await ms.DELETE(['entity/product', newProduct.id])

  await t.shouldFail((() => ms.GET(['entity/product', newProduct.id]))(), /не найден/i)
})

