'use strict'

const test = require('tape')
const base64encode = require('@wmakeev/base64encode')

const Moysklad = require('..')

const BEARER_AUTH = 'Bearer token'
const BASIC_AUTH = 'Basic ' + base64encode('login:password')

const MOYSKLAD_LOGIN = process.env.MOYSKLAD_LOGIN
const MOYSKLAD_PASSWORD = process.env.MOYSKLAD_PASSWORD
const MOYSKLAD_HOST = process.env.MOYSKLAD_HOST
const MOYSKLAD_API = process.env.MOYSKLAD_API

const clearEnv = () => {
  delete process.env.MOYSKLAD_LOGIN
  delete process.env.MOYSKLAD_PASSWORD
  delete process.env.MOYSKLAD_TOKEN
  delete process.env.MOYSKLAD_HOST
  delete process.env.MOYSKLAD_API
  delete global.MOYSKLAD_LOGIN
  delete global.MOYSKLAD_PASSWORD
  delete global.MOYSKLAD_TOKEN
  delete global.window
}

const restoreEnv = () => {
  process.env.MOYSKLAD_LOGIN = MOYSKLAD_LOGIN
  process.env.MOYSKLAD_PASSWORD = MOYSKLAD_PASSWORD
  process.env.MOYSKLAD_HOST = MOYSKLAD_HOST || ''
  process.env.MOYSKLAD_API = MOYSKLAD_API || ''
  delete process.env.MOYSKLAD_TOKEN
  delete global.MOYSKLAD_LOGIN
  delete global.MOYSKLAD_PASSWORD
  delete global.MOYSKLAD_TOKEN
  delete global.MOYSKLAD_HOST
  delete global.MOYSKLAD_API
  delete global.window
}

test('Moysklad#getAuthHeader (no credentials)', t => {
  clearEnv()
  try {
    const msEmpty = Moysklad({ password: 'foo' })
    t.equal(
      msEmpty.getAuthHeader(),
      undefined,
      'should return undefined Basic auth without credentials'
    )
  } finally {
    restoreEnv()
  }

  t.end()
})

test('Moysklad#getAuthHeader (options)', t => {
  const msBasic = Moysklad({ login: 'login', password: 'password' })
  t.equal(
    msBasic.getAuthHeader(),
    BASIC_AUTH,
    'should return Basic auth with login option'
  )

  t.throws(
    () => {
      const msWoPass = Moysklad({ login: 'login' })
      msWoPass.getAuthHeader()
    },
    /пароль/,
    'should throw Error on empty password'
  )

  const msToken = Moysklad({
    token: 'token',
    login: 'login',
    password: 'password'
  })
  t.equal(
    msToken.getAuthHeader(),
    BEARER_AUTH,
    'should return Bearer auth with token option'
  )

  t.end()
})

test('Moysklad#getAuthHeader (env)', t => {
  clearEnv()
  try {
    process.env.MOYSKLAD_LOGIN = 'login'
    process.env.MOYSKLAD_PASSWORD = 'password'

    const msBasic = Moysklad()
    t.equal(
      msBasic.getAuthHeader(),
      BASIC_AUTH,
      'should return Basic auth with env options'
    )

    delete process.env.MOYSKLAD_PASSWORD
    t.throws(
      () => {
        const msWoPass = Moysklad()
        msWoPass.getAuthHeader()
      },
      /пароль/,
      'should throw Error on empty MOYSKLAD_PASSWORD env'
    )

    process.env.MOYSKLAD_TOKEN = 'token'
    const msToken = Moysklad()
    t.equal(
      msToken.getAuthHeader(),
      BEARER_AUTH,
      'should return Bearer auth with MOYSKLAD_TOKEN env'
    )
  } finally {
    restoreEnv()
  }

  t.end()
})

test('Moysklad#getAuthHeader (global)', t => {
  clearEnv()
  try {
    global.MOYSKLAD_LOGIN = 'login'
    global.MOYSKLAD_PASSWORD = 'password'

    const msBasic = Moysklad()
    t.equal(
      msBasic.getAuthHeader(),
      BASIC_AUTH,
      'should return Basic auth with global options'
    )

    delete global.MOYSKLAD_PASSWORD
    t.throws(
      () => {
        const msWoPass = Moysklad()
        msWoPass.getAuthHeader()
      },
      /пароль/,
      'should throw Error on empty MOYSKLAD_PASSWORD global'
    )

    delete global.MOYSKLAD_LOGIN
    global.MOYSKLAD_TOKEN = 'token'
    const msToken = Moysklad()
    t.equal(
      msToken.getAuthHeader(),
      BEARER_AUTH,
      'should return Bearer auth with MOYSKLAD_TOKEN global'
    )
  } finally {
    restoreEnv()
  }

  t.end()
})

test('Moysklad#getAuthHeader (window)', t => {
  clearEnv()
  global.window = {}

  try {
    global.window.MOYSKLAD_LOGIN = 'login'
    global.window.MOYSKLAD_PASSWORD = 'password'

    const msBasic = Moysklad()
    t.equal(
      msBasic.getAuthHeader(),
      BASIC_AUTH,
      'should return Basic auth with global options'
    )

    delete global.window.MOYSKLAD_PASSWORD
    t.throws(
      () => {
        const msWoPass = Moysklad()
        msWoPass.getAuthHeader()
      },
      /пароль/,
      'should throw Error on empty MOYSKLAD_PASSWORD global'
    )

    delete global.window.MOYSKLAD_LOGIN
    global.window.MOYSKLAD_TOKEN = 'token'
    const msToken = Moysklad()
    t.equal(
      msToken.getAuthHeader(),
      BEARER_AUTH,
      'should return Bearer auth with MOYSKLAD_TOKEN global'
    )
  } finally {
    restoreEnv()
  }

  t.end()
})

test('Moysklad env', t => {
  clearEnv()

  try {
    global.MOYSKLAD_HOST = 'foo.bar.ru'
    process.env.MOYSKLAD_API = 'example'
    global.MOYSKLAD_EXAMPLE_API_VERSION = '9.9'

    const ms = Moysklad()

    const url = ms.buildUrl('entity/some')

    t.equals(
      url,
      'https://foo.bar.ru/api/example/9.9/entity/some',
      'should use MOYSKLAD_HOST and MOYSKLAD_API env'
    )
  } finally {
    restoreEnv()
  }

  t.end()
})
