'use strict'

const have = require('../have')

module.exports = function GET (...args) {
  let { path, query, options = {} } = have.strict(args, [
    { path: 'str or str arr', query: 'opt Object', options: 'opt Object' },
    have.argumentsObject
  ])

  let uri = this.buildUri(path, query)

  return this.fetchUri(uri, Object.assign({}, options, { method: 'GET' }))
}
