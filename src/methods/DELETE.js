'use strict'

const have = require('../have')

module.exports = function DELETE (...args) {
  let { path, options = {} } = have.strict(args, [
    { path: 'str or str arr', options: 'opt Object' },
    have.argumentsObject
  ])

  let uri = this.buildUri(path)

  return this.fetchUri(uri, Object.assign({}, options, { method: 'DELETE' }))
}
