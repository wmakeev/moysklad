'use strict'

const have = require('../have')

module.exports = function PUT (...args) {
  let { path, payload, query, options = {} } = have.strict(args, [
    {
      path: 'str or str arr',
      payload: 'Object',
      query: 'opt Object',
      options: 'opt Object'
    },
    have.argumentsObject
  ])

  let uri = this.buildUri(path, query)
  let fetchOptions = { method: 'PUT' }
  if (payload) fetchOptions.body = JSON.stringify(payload)

  return this.fetchUri(uri, Object.assign({}, options, fetchOptions))
}
