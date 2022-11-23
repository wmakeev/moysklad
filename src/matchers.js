'use strict'

const UUID_REGEX =
  /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/

const urlMatcher = url =>
  typeof url === 'string' && url.substring(0, 8) === 'https://'

const uuidMatcher = uuid => typeof uuid === 'string' && UUID_REGEX.test(uuid)

// TODO Убедиться что указан необходимый минимум полей для сущностей
module.exports = {
  'entity': ent =>
    !!(ent && ent.id && uuidMatcher(ent.id) && ent.meta && ent.meta.type),

  'uuid': uuidMatcher,

  'url': urlMatcher,

  // 'uuid/uuid': id => {
  //   if (typeof id !== 'string') { return false }
  //   let [dicId, entId] = id.split('/')
  //   return UUID_REGEX.test(dicId) && UUID_REGEX.test(entId)
  // },

  'Moysklad.Collection': col =>
    !!(
      col &&
      col.meta &&
      col.meta.type &&
      urlMatcher(col.meta.href) &&
      typeof col.meta.size === 'number'
    )
}

// TODO Проверка типов "Moysklad." на основании модели
