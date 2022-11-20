/* eslint node/no-extraneous-require:0 */

const { URL } = require('url')
const assert = require('assert')
const Moysklad = require('moysklad')

const ms = Moysklad({ apiVersion: '1.2' })

const getQueryStrParamValue = (url, param) =>
  new URL(url).searchParams.get(param)

// query.order
const orderQueryUrl = ms.buildUrl('entity/customerorder', {
  order: ['name,desc', ['code', 'asc'], ['moment']]
})

assert.equal(
  getQueryStrParamValue(orderQueryUrl, 'order'),
  'name,desc;code,asc;moment'
)
