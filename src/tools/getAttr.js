'use strict'

const have = require('../have')

module.exports = function getAttr () {
  let { entity, attrId } = have.strict(arguments, [
    { entity: 'Obj', attrId: 'uuid' },
    { entity: 'Obj', meta: 'Obj' },
    have.argumentsObject
  ])

  if (!entity.attributes) {
    throw new Error('Entity has no attributes') // TODO Нужна ли ошибка?
  }

  return entity.attributes.find(a => a.id === attrId)
}
