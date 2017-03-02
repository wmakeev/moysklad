'use strict'

const stampit = require('stampit')
const have = require('../have')

function createMeta (...args) {
  let { type, path } = have.strict(args, [
    { type: 'str', path: 'str or str arr' },
    have.argumentsObject
  ])

  return {
    href: this.buildUri(path),
    type,
    mediaType: 'application/json'
  }
}

module.exports = stampit.init(function () {
  this.createMeta = createMeta.bind(this)
})
