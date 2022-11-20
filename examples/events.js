/* eslint node/no-extraneous-require:0, no-unused-vars:0 */

const { fetch } = require('undici')
const Moysklad = require('moysklad')
const { EventEmitter } = require('events')

const emitter = new EventEmitter()
const ms = Moysklad({ fetch, emitter })

const startTime = Date.now()
const elapsed = () => Date.now() - startTime

emitter
  .on('request', ({ url, options }) => {
    console.log(`${options.method} ${url}`)
  })
  .on(
    'response',
    ({ url, options: { method }, response: { statusText, status } }) => {
      console.log(`${method} ${statusText} ${status} ${url} (+${elapsed()}ms)`)
    }
  )
  .on('response:body', ({ url, options: { method }, response, body }) => {
    console.log(`${method} BODY ${url} (+${elapsed()}ms)`)
  })
  .on('error', err => {
    console.log('Error event: ', err.message)
  })

ms.GET('entity/customerorder', { limit: 1 }).then(res => {
  console.log('Order name: ' + res.rows[0].name)
})

/*
GET https://online.moysklad.ru/api/remap/1.2/entity/customerorder?limit=1
GET OK 200 https://online.moysklad.ru/api/remap/1.2/entity/customerorder?limit=1 (+575ms)
GET BODY https://online.moysklad.ru/api/remap/1.2/entity/customerorder?limit=1 (+580ms)
Order name: 00600
*/
