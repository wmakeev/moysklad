'use strict'

const have = require('../have')

module.exports = function GET(...args) {
  const {
    path,
    query,
    options = {}
  } = have.strict(args, [
    { path: 'str or str arr', query: 'opt Object', options: 'opt Object' },
    have.argumentsObject
  ])

  const url = this.buildUrl(path, query)

  return this.fetchUrl(url, { ...options, method: 'GET' })
}
