'use strict'

const have = require('../have')

module.exports = function GET (...args) {
  let { path, query, options = {} } = have.strict(args, [
    { path: 'str or str arr', query: 'opt Object', options: 'opt Object' },
    have.argumentsObject
  ])

  let uri = this.buildUrl(path, query)

  return this.fetchUrl(uri, { ...options, method: 'GET' })
}
