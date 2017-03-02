'use strict';

var have = require('../have');
var getAttr = require('./getAttr');

module.exports = function getAttrVal() {
  var _have$strict = have.strict(arguments, [{ entity: 'Obj', attrId: 'uuid' }, { entity: 'Obj', meta: 'Obj' }, have.argumentsObject]),
      entity = _have$strict.entity,
      attrId = _have$strict.attrId;

  var attr = getAttr({ entity: entity, attrId: attrId });

  if (!attr) {
    return void 0;
  }

  return attr.value;
};
//# sourceMappingURL=getAttrVal.js.map