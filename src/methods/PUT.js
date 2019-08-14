'use strict'

const have = require('../have')

module.exports = function PUT (...args) {
  const { path, payload, query, options = {} } = have.strict(args, [
    {
      path: 'str or str arr',
      payload: 'opt Object',
      query: 'opt Object',
      options: 'opt Object'
    },
    have.argumentsObject
  ])

  const uri = this.buildUrl(path, query)
  const fetchOptions = { method: 'PUT' }
  if (payload) fetchOptions.body = JSON.stringify(payload)

  return this.fetchUrl(uri, { ...options, ...fetchOptions })
}
