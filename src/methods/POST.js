'use strict'

const have = require('../have')

module.exports = function POST (...args) {
  // TODO Test payload: 'Object or Object arr'
  let { path, payload, query, options = {} } = have.strict(args, [
    {
      path: 'str or str arr',
      payload: 'opt Object or Object arr',
      query: 'opt Object',
      options: 'opt Object'
    },
    have.argumentsObject
  ])

  let uri = this.buildUrl(path, query)
  let fetchOptions = { method: 'POST' }
  if (payload) fetchOptions.body = JSON.stringify(payload)

  return this.fetchUrl(uri, { ...options, ...fetchOptions })
}
