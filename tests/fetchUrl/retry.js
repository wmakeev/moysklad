'use strict'

const test = require('tape')
const {
  fetch,
  MockAgent,
  getGlobalDispatcher,
  setGlobalDispatcher
} = require('undici')

const Moysklad = require('../../index.js')
const { MoyskladRequestError } = require('../../src/errors.js')

/** @type {(retryCount: number, t: test.Test) => Moysklad.RetryFunction} */
const createRetryFunction = (retryCount, t) => async (thunk, signal) => {
  t.ok(signal)

  let count = retryCount

  while (true) {
    try {
      return await thunk()
    } catch (err) {
      t.ok(err instanceof Error)

      if (count-- === 0) throw err
      if (!Moysklad.shouldRetryError(err)) throw err

      continue
    }
  }
}

test('fetchUrl retry 503', async t => {
  t.plan(5)

  const currentAgent = getGlobalDispatcher()

  const mockAgent = new MockAgent()

  mockAgent.disableNetConnect()

  setGlobalDispatcher(mockAgent)

  try {
    const ms = Moysklad({
      fetch,
      retry: createRetryFunction(1, t)
    })

    const originUrl = new URL(ms.buildUrl('/'))
    const mockPool = mockAgent.get(originUrl.origin)

    mockPool
      .intercept({
        path: '/api/remap/1.2/foo',
        method: 'GET'
      })
      .reply(503)

    mockPool
      .intercept({
        path: '/api/remap/1.2/foo',
        method: 'GET'
      })
      .reply(503)

    // eslint-disable-next-line no-undef
    const controller = new AbortController()

    await ms.GET('foo', null, { signal: controller.signal }).catch(err => {
      t.ok(err instanceof MoyskladRequestError)
      t.equal(err.status, 503)
    })

    mockAgent.assertNoPendingInterceptors()
  } finally {
    setGlobalDispatcher(currentAgent)
  }
})

test('fetchUrl retry 503 + 200', async t => {
  t.plan(3)

  const currentAgent = getGlobalDispatcher()

  const mockAgent = new MockAgent()

  mockAgent.disableNetConnect()

  setGlobalDispatcher(mockAgent)

  try {
    const ms = Moysklad({
      fetch,
      retry: createRetryFunction(2, t)
    })

    const originUrl = new URL(ms.buildUrl('/'))
    const mockPool = mockAgent.get(originUrl.origin)

    mockPool
      .intercept({
        path: '/api/remap/1.2/foo',
        method: 'GET'
      })
      .reply(503)

    mockPool
      .intercept({
        path: '/api/remap/1.2/foo',
        method: 'GET'
      })
      .defaultReplyHeaders({
        'Content-Type': 'application/json'
      })
      .reply(200, { ok: true })

    // eslint-disable-next-line no-undef
    const controller = new AbortController()

    const result = await ms
      .GET('foo', null, { signal: controller.signal })
      .catch(() => {
        t.fail('should not throw')
      })

    t.equal(result.ok, true)

    mockAgent.assertNoPendingInterceptors()
  } finally {
    setGlobalDispatcher(currentAgent)
  }
})

test('fetchUrl retry 404', async t => {
  t.plan(3)

  const ms = Moysklad({
    fetch,
    retry: createRetryFunction(1, t)
  })

  // eslint-disable-next-line no-undef
  const controller = new AbortController()

  await ms.GET('foo', null, { signal: controller.signal }).catch(err => {
    t.equal(err.status, 404)
  })
})

test('fetchUrl retry 404', async t => {
  t.plan(4)

  const ms = Moysklad({
    fetch,
    retry: createRetryFunction(1, t)
  })

  // eslint-disable-next-line no-undef
  const controller = new AbortController()

  await ms
    .fetchUrl('https://example', { signal: controller.signal })
    .catch(err => {
      t.equal(err.cause.code, 'ENOTFOUND')
    })
})
