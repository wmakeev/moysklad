'use strict'

const have = require('../have')
const getAttr = require('./getAttr')

module.exports = function getAttrVal () {
  let { entity, attrId } = have.strict(arguments, [
    { entity: 'Obj', attrId: 'uuid' },
    { entity: 'Obj', meta: 'Obj' },
    have.argumentsObject
  ])

  let attr = getAttr({ entity, attrId })

  if (!attr) { return void 0 }

  return attr.value
}
