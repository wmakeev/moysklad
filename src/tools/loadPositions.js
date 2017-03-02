'use strict'

const have = require('../have')
const loadRows = require('./loadRows')

module.exports = async function loadPositions () {
  let { client, type, id, query = {} } = have.strict(arguments, [
    { client: 'obj', type: 'str', id: 'str', query: 'opt obj' },
    have.argumentsObject
  ])

  let collection = await client.GET(['entity', type, id, 'positions'], query)

  return await loadRows(client, collection, query)
}
