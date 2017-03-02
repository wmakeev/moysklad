'use strict';

var have = require('../have');

module.exports = function getPropertyInfo() {
  var _have = have(arguments, {
    model: 'model', typeName: 'str', propName: 'str'
  }),
      model = _have.model,
      typeName = _have.typeName,
      propName = _have.propName;

  var types = model.types;

  return function findProperty(_typeName) {
    if (_typeName === 'Object' || _typeName === 'Enum') {
      return null;
    }
    var type = types[_typeName];
    if (!type) {
      throw new Error('Type "' + _typeName + '" not found');
    }
    if (type.properties && type.properties[propName]) {
      return type.properties[propName];
    } else if (type.baseType) {
      return findProperty(type.baseType.indexOf('.') !== -1 ? type.baseType.split('.')[1] : type.baseType);
    } else {
      return null;
    }
  }(typeName);
};
//# sourceMappingURL=getPropertyInfo.js.map