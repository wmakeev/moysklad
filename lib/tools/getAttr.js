'use strict';

var have = require('../have');

module.exports = function getAttr() {
  var _have$strict = have.strict(arguments, [{ entity: 'Obj', attrId: 'uuid' }, { entity: 'Obj', meta: 'Obj' }, have.argumentsObject]),
      entity = _have$strict.entity,
      attrId = _have$strict.attrId;

  if (!entity.attributes) {
    throw new Error('Entity has no attributes'); // TODO Нужна ли ошибка?
  }

  return entity.attributes.find(function (a) {
    return a.id === attrId;
  });
};
//# sourceMappingURL=getAttr.js.map