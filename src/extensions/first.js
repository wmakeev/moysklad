'use strict'

const stampit = require('stampit')
const have = require('../have')

async function first (...args) {
  let { path, query, options = {} } = have.strict(args, [
    { path: 'str or str arr', query: 'opt Object', options: 'opt Object' },
    have.argumentsObject
  ])

  let collection = await this.GET({
    path,
    query: Object.assign({}, query, { limit: 1 }),
    options
  })

  if (collection && collection.rows) {
    return collection.rows[0]
  } else {
    throw new Error('first: response is not collection')
  }
}

module.exports = stampit({
  methods: {
    first
  }
})
