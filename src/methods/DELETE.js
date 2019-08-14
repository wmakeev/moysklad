'use strict'

const have = require('../have')

module.exports = function DELETE (...args) {
  const { path, options = {} } = have.strict(args, [
    { path: 'str or str arr', options: 'opt Object' },
    have.argumentsObject
  ])

  const uri = this.buildUrl(path)

  return this.fetchUrl(uri, { ...options, method: 'DELETE', rawResponse: true })
}
