'use strict'

const test = require('blue-tape')
const fetch = require('node-fetch')

const Moysklad = require('../..')

test('Moysklad constructor', t => {
  t.ok(Moysklad)
  t.end()
})

test('Moysklad static methods', t => {
  t.equals(typeof Moysklad.getTimeString, 'function')
  t.equals(typeof Moysklad.parseTimeString, 'function')
  t.end()
})

test('Moysklad instance methods', t => {
  const ms = Moysklad({ fetch })
  t.ok(ms)
  t.equals(typeof ms.getOptions, 'function')
  t.equals(typeof ms.getAuthHeader, 'function')
  t.equals(typeof ms.fetchUrl, 'function')
  t.equals(typeof ms.buildUrl, 'function')
  t.equals(typeof ms.parseUrl, 'function')
  t.equals(typeof ms.GET, 'function')
  t.equals(typeof ms.POST, 'function')
  t.equals(typeof ms.PUT, 'function')
  t.equals(typeof ms.DELETE, 'function')
  t.end()
})

test('Create Moysklad instance with options', t => {
  const options = {
    fetch,
    login: 'login',
    password: 'password'
  }

  const ms = Moysklad(options)
  t.ok(ms)

  const msOptions = ms.getOptions()
  t.true(msOptions !== options)
  t.equals(msOptions.login, 'login')
  t.equals(msOptions.password, 'password')
  t.equals(msOptions.api, 'remap')
  t.equals(msOptions.apiVersion, '1.1')

  t.end()
})

test.only('Create Moysklad instance with default api versions', t => {
  let ms = Moysklad({
    fetch,
    token: 'token',
    api: 'phone'
  })
  t.ok(ms)

  const msOptions = ms.getOptions()
  t.equals(msOptions.token, 'token')
  t.equals(msOptions.api, 'phone')
  t.equals(msOptions.apiVersion, '1.0')

  t.throws(() => {
    Moysklad({
      fetch,
      token: 'token',
      api: 'foo'
    })
  }, /Не указана версия foo API/)

  t.doesNotThrow(() => {
    Moysklad({
      fetch,
      token: 'token',
      api: 'bar',
      apiVersion: '0.0'
    })
  })

  let barOpt

  t.doesNotThrow(() => {
    global.MOYSKLAD_BAR_API_VERSION = '3.0'
    const ms = Moysklad({
      fetch,
      token: 'token',
      api: 'bar',
      apiVersion: '0.0'
    })
    barOpt = ms.getOptions()
    delete global.MOYSKLAD_BAR_API_VERSION
  })
  t.equal(barOpt.apiVersion, '0.0')

  t.doesNotThrow(() => {
    global.MOYSKLAD_BAR_BAZ__API_VERSION = '3.0'
    const ms = Moysklad({
      fetch,
      token: 'token',
      api: 'bar/baz*'
    })
    barOpt = ms.getOptions()
    delete global.MOYSKLAD_BAR_BAZ__API_VERSION
  })
  t.equal(barOpt.apiVersion, '3.0')

  t.end()
})

test('Request without fetch', async t => {
  t.plan(1)

  const options = {
    login: 'login',
    password: 'password'
  }

  const ms = Moysklad(options)

  try {
    await ms.GET('entity/counterparty', { limit: 1 })
  } catch (err) {
    t.ok(
      err.message.indexOf('Нельзя выполнить http запрос') === 0,
      'should throw error'
    )
  }
})

test('Moysklad#GET method', async t => {
  const ms = Moysklad({ fetch })

  const counterparties = await ms.GET('entity/counterparty', { limit: 1 })
  t.equals(typeof counterparties, 'object', 'should return object')
  t.ok(
    counterparties.rows instanceof Array,
    'should return counterparties collection'
  )

  const [employee, group] = await Promise.all([
    ms.fetchUrl(counterparties.context.employee.meta.href),
    ms.fetchUrl(counterparties.rows[0].group.meta.href)
  ])

  t.equals(
    typeof employee,
    'object',
    'Moysklad#fetchUrl method should fetch employee object by href'
  )

  t.equals(
    typeof group,
    'object',
    'Moysklad#fetchUrl method should fetch group object by href'
  )
})

test('Moysklad#POST/PUT/DELETE', async t => {
  const ms = Moysklad({ fetch })

  let code = 'test-' + Date.now()
  const product = {
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
        id: '14538d43-ea5b-11e9-0a80-0505000d881a',
        name: 'Пол',
        value: {
          name: 'Женский'
        }
      },
      {
        id: 'c18ca61c-eac1-11e9-0a80-042800177f42',
        name: 'Возраст',
        value: {
          name: 'Взрослый'
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

  await t.shouldFail(
    (() => ms.GET(['entity/product', newProduct.id]))(),
    /не найден/i
  )
})
