'use strict'

const stampit = require('stampit')
const have = require('../have')
const createMetaStamp = require('./createMeta')

// client.createAttr(СТАТУС, В_РАБОТЕ)
// client.createAttr(ОБЩИЙ_ЗАКАЗ, 'NA-ord-13023')
// client.createAttr({ id: СТАТУС, name: 'В работе' })

function createAttr (...args) {
  let parsedArgs = have.strict(args, [
    { id: 'uuid', entityId: 'uuid/uuid' },
    { id: 'uuid', value: 'str or num or date' },
    { id: 'uuid', name: 'str' },
    have.argumentsObject
  ])

  let attr = { id: parsedArgs.id }

  if (parsedArgs.entityId) {
    attr.value = {
      meta: this.createMeta('customentity', ['entity/customentity', parsedArgs.entityId])
    }
  } else if (parsedArgs.hasOwnProperty('value')) {
    attr.value = parsedArgs.value
  } else {
    attr.value = {
      meta: {
        name: parsedArgs.name
      }
    }
  }

  return attr
}

module.exports = stampit.init(function () {
  this.createAttr = createAttr.bind(this)
}).compose(createMetaStamp)
