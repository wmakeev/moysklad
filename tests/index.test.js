'use strict'

/* global window */

const test = require('tape')
const { fetch } = require('undici')

const Moysklad = require('..')

test('Moysklad constructor', t => {
  t.ok(Moysklad)
  t.end()
})

test('Moysklad static methods', t => {
  t.equals(typeof Moysklad.getTimeString, 'function')
  t.equals(typeof Moysklad.parseTimeString, 'function')
  t.equals(typeof Moysklad.buildFilter, 'function')
  t.equals(typeof Moysklad.buildQuery, 'function')
  t.equals(typeof Moysklad.MoyskladApiError, 'function')
  t.equals(typeof Moysklad.MoyskladCollectionError, 'function')
  t.equals(typeof Moysklad.MoyskladError, 'function')
  t.equals(typeof Moysklad.MoyskladRequestError, 'function')
  t.equals(typeof Moysklad.MoyskladUnexpectedRedirectError, 'function')
  t.end()
})

test('Moysklad instance methods', t => {
  const ms = Moysklad({ fetch })
  t.ok(ms)
  t.equals(typeof ms.getOptions, 'function')

  t.equals(typeof ms.getVersion, 'function')
  t.ok(typeof ms.getVersion() === 'string')

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
  t.equals(msOptions.apiVersion, '1.2')

  t.end()
})

test('Create Moysklad instance with default api versions', t => {
  const ms = Moysklad({
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

  const globalFetch = global.fetch
  delete global.fetch

  const ms = Moysklad(options)

  try {
    await ms.GET('entity/counterparty', { limit: 1 })
  } catch (err) {
    t.ok(
      err.message.indexOf('Нельзя выполнить http запрос') === 0,
      'should throw error'
    )
  }

  if (globalFetch) global.fetch = globalFetch
})

test('Request with global.fetch', async t => {
  t.plan(1)

  global.fetch = async () => {
    throw new Error('FETCH_OK')
  }

  const options = {
    login: 'login',
    password: 'password'
  }

  const ms = Moysklad(options)

  try {
    await ms.GET('entity/counterparty', { limit: 1 })
  } catch (err) {
    t.equal(err.message, 'FETCH_OK')
  } finally {
    delete global.fetch
  }
})

test('Request with window.fetch', async t => {
  t.plan(1)

  global.window = {}

  window.fetch = async () => {
    throw new Error('FETCH_OK')
  }

  const options = {
    login: 'login',
    password: 'password'
  }

  const ms = Moysklad(options)

  try {
    await ms.GET('entity/counterparty', { limit: 1 })
  } catch (err) {
    t.equal(err.message, 'FETCH_OK')
  } finally {
    delete global.window
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
        meta: {
          type: 'attributemetadata',
          href: ms.buildUrl(
            // Вид товара
            'entity/product/metadata/attributes/0008b3f4-1897-11e3-d76c-7054d21a8d1e'
          )
        },
        value: {
          name: 'Рюкзак'
        }
      },
      {
        meta: {
          type: 'attributemetadata',
          href: ms.buildUrl(
            // Пол
            'entity/product/metadata/attributes/14538d43-ea5b-11e9-0a80-0505000d881a'
          )
        },
        value: {
          name: 'Женский'
        }
      },
      {
        meta: {
          type: 'attributemetadata',
          href: ms.buildUrl(
            // Возраст
            'entity/product/metadata/attributes/c18ca61c-eac1-11e9-0a80-042800177f42'
          )
        },
        value: {
          name: 'Взрослый'
        }
      },
      {
        meta: {
          type: 'attributemetadata',
          href: ms.buildUrl(
            // Бренд
            'entity/product/metadata/attributes/f4c073c5-1bcc-4d91-8b41-ed825495b677'
          )
        },
        value: {
          name: 'No Brand'
        }
      },
      {
        meta: {
          type: 'attributemetadata',
          href: ms.buildUrl(
            // Сезон
            'entity/product/metadata/attributes/71f17086-1a7f-47f1-b447-59b71351bfad'
          )
        },
        value: {
          name: '02 Осень/Зима'
        }
      },
      {
        meta: {
          type: 'attributemetadata',
          href: ms.buildUrl(
            // Вид номенклатуры
            'entity/product/metadata/attributes/b4bee095-4278-4147-95e0-0328c9207be0'
          )
        },
        value: {
          name: 'Товары в обороте'
        }
      },
      {
        meta: {
          type: 'attributemetadata',
          href: ms.buildUrl(
            // Создано
            'entity/product/metadata/attributes/4700f6bd-fa82-4a91-9e8c-822616e71b0a'
          )
        },
        value: Moysklad.getTimeString(new Date())
      }
    ]
  }

  let newProduct = await ms.POST('entity/product', product)

  newProduct = await ms.PUT(
    `entity/product/${newProduct.id}`,
    JSON.stringify({
      description: 'with PUT'
    })
  )

  const [newProduct2] = await ms.POST(
    'entity/product',
    JSON.stringify([
      {
        meta: newProduct.meta,
        description: 'with POST'
      }
    ])
  )

  newProduct = newProduct2

  t.ok(newProduct, 'POST should create new entity')
  t.equals(newProduct.name, product.name, 'new entity name should equals')
  t.equals(newProduct.code, code, 'new entity name should have some property')
  t.equals(
    newProduct.description,
    'with POST',
    'new entity name should have description property'
  )

  code = 'test-' + Date.now()
  newProduct = await ms.PUT(`entity/product/${newProduct.id}`, { code })

  t.ok(newProduct, 'PUT should update entity')
  t.equals(newProduct.code, code, 'updated entity field should be equal')

  await ms.DELETE(['entity/product', newProduct.id])

  try {
    await ms.GET(`entity/product/${newProduct.id}`)
    t.fail('ms.GET should fail')
  } catch (err) {
    t.ok(err.message.includes('не найден'))
  }
})
