'use strict'

const have = require('../have')

module.exports = function POST (...args) {
  // TODO Test payload: 'Object or Object arr'
  let { path, payload, query, options = {} } = have.strict(args, [
    {
      path: 'str or str arr',
      payload: 'Object or Object arr',
      query: 'opt Object',
      options: 'opt Object'
    },
    have.argumentsObject
  ])

  let uri = this.buildUri(path, query)
  let fetchOptions = {
    method: 'POST',
    body: JSON.stringify(payload)
  }

  return this.fetchUri(uri, Object.assign({}, options, fetchOptions))
}
