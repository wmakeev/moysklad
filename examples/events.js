// @ts-check

const { fetch } = require('undici')
const { EventEmitter } = require('events')

/** @type {import('..')} */
const Moysklad = require('..')

/** @type {Moysklad.MoyskladEmitter} */
const emitter = new EventEmitter()
const ms = Moysklad({ fetch, emitter })

const startTime = Date.now()
const elapsed = () => Date.now() - startTime

emitter
  .on('request', ({ requestId, url, options }) => {
    console.log(`(${requestId}) ${options.method} ${url}`)
  })
  .on(
    'response',
    ({
      requestId,
      url,
      options: { method },
      response: { statusText, status }
    }) => {
      console.log(
        `(${requestId}) ${method} ${statusText} ${status} ${url} (+${elapsed()}ms)`
      )
    }
  )
  .on(
    'response:body',
    ({ requestId, url, options: { method }, response, body }) => {
      console.log(`(${requestId}) ${method} BODY ${url} (+${elapsed()}ms)`)
    }
  )
  .on('error', (err, { requestId }) => {
    console.log(`(${requestId})`, 'Error event: ', err.message)
  })

ms.GET('entity/customerorder', { limit: 1 }).then(res => {
  console.log('Order name: ' + res.rows[0].name)
})

/*
(1) GET https://api.moysklad.ru/api/remap/1.2/entity/customerorder?limit=1
(1) GET OK 200 https://api.moysklad.ru/api/remap/1.2/entity/customerorder?limit=1 (+601ms)
(1) GET BODY https://api.moysklad.ru/api/remap/1.2/entity/customerorder?limit=1 (+611ms)
Order name: NV-ord-082432
*/
