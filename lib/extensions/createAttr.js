'use strict';

var stampit = require('stampit');
var have = require('../have');
var createMetaStamp = require('./createMeta');

// client.createAttr(СТАТУС, В_РАБОТЕ)
// client.createAttr(ОБЩИЙ_ЗАКАЗ, 'NA-ord-13023')
// client.createAttr({ id: СТАТУС, name: 'В работе' })

function createAttr() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  var parsedArgs = have.strict(args, [{ id: 'uuid', entityId: 'uuid/uuid' }, { id: 'uuid', value: 'str or num or date' }, { id: 'uuid', name: 'str' }, have.argumentsObject]);

  var attr = { id: parsedArgs.id };

  if (parsedArgs.entityId) {
    attr.value = {
      meta: this.createMeta('customentity', ['entity/customentity', parsedArgs.entityId])
    };
  } else if (parsedArgs.hasOwnProperty('value')) {
    attr.value = parsedArgs.value;
  } else {
    attr.value = {
      meta: {
        name: parsedArgs.name
      }
    };
  }

  return attr;
}

module.exports = stampit.init(function () {
  this.createAttr = createAttr.bind(this);
}).compose(createMetaStamp);
//# sourceMappingURL=createAttr.js.map