'use strict';

const UUID_REGEX = /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/;

// TODO Убедиться что указан необходимый минимум полей для сущностей
module.exports = {
  'entity': ent => ent && ent.id && UUID_REGEX.test(ent.id) && ent.meta && ent.meta.type,
  'uuid': _uuid => typeof _uuid === 'string' && UUID_REGEX.test(_uuid),
  // 'uuid/uuid': id => {
  //   if (typeof id !== 'string') { return false }
  //   let [dicId, entId] = id.split('/')
  //   return UUID_REGEX.test(dicId) && UUID_REGEX.test(entId)
  // },
  'Moysklad.Collection': col => col && col.meta && col.meta.href && col.meta.size
};

// TODO Проверка типов "Moysklad." на основании модели
//# sourceMappingURL=matchers.js.map