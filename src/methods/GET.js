'use strict'

const have = require('../have')

module.exports = function GET (...args) {
  const { path, query, options = {} } = have.strict(args, [
    { path: 'str or str arr', query: 'opt Object', options: 'opt Object' },
    have.argumentsObject
  ])

  const uri = this.buildUrl(path, query)

  return this.fetchUrl(uri, { ...options, method: 'GET' })
}
