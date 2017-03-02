'use strict'

const have = require('../have')
const getPropertyInfo = require('./getPropertyInfo')
const loadRows = require('./loadRows')

const CUSTOM_ENT_ID_REGEX = /\/([^/]+)\/([^/?]+)(?:\?.+)?$/

const getFieldName = fieldName => fieldName
  .toUpperCase()
  .replace(/[^0-9a-zA-Zа-яА-Я_$]/g, '_')
  .replace(/_{2,}/g, '_')
  .replace(/_{1,}$/, '') // TODO Объединить последние два replace
  .replace(/^_{1,}/, '')

module.exports = async function aggregateMetadata () {
  let { client, model, options = {} } = have(arguments, {
    client: 'Obj', model: 'model', options: 'opt Obj'
  })

  let { customEntityFilter = () => true } = options

  let Metadata = {
    updated: new Date(),
    formatVersion: '3.0.0'
  }

  // асинхронная загрузка метаданных внешних (доступных из API) сущностей
  let typeMetadataPromises = Object.keys(model.types)
    .filter(typeName => {
      let type = model.types[typeName]
      return type && type.external && getPropertyInfo(model, typeName, 'attributes')
    })
    .map(typeName => {
      Metadata[typeName] = {}
      return typeName
    })
    .map(typeName => client.GET(['entity', typeName, 'metadata']).then(metadata => ({
      typeName, metadata
    })))

  // асинхронная загрузка пользовательских атрибутов и справочников
  let thread1 = typeMetadataPromises.map(p => p.then(async typeMetadata => {
    let { typeName, metadata } = typeMetadata
    // type = Metadata.CustomerOrder
    let type = Metadata[typeName]

    if (metadata.states) {
      // Metadata.CustomerOrder.States = {}
      type.States = {}
      // обработка метаданных сущности
      for (let attrState of metadata.states) {
        // Metadata.CustomerOrder.States.ОФОРМЛЕН = state.id
        type.States[getFieldName(attrState.name)] = attrState.id
      }
    }

    if (metadata.attributes) {
      // Metadata.CustomerOrder.Attributes = {}
      type.Attributes = {}
      // обработка метаданных сущности
      for (let attrMeta of metadata.attributes) {
        // Metadata.CustomerOrder.Attributes.ИСТОЧНИК_ЗАКАЗА = attribute.id
        type.Attributes[getFieldName(attrMeta.name)] = attrMeta.id
        if (attrMeta.customEntityMeta) {
          let customEntities = await client.fetchUri(attrMeta.customEntityMeta.href)
          let entName = getFieldName(customEntities.name)
          // заполнение пользовательского справочника (если не заполнен) и если не пропущен явно
          if (!Metadata.CustomEntity[entName] && customEntityFilter(customEntities.name)) {
            // Metadata.CustomEntity.ИСТОЧНИКИ_ЗАКАЗА = {}
            Metadata.CustomEntity[entName] = {}
            let collection = await client.fetchUri(customEntities.entityMeta.href)
            let rows = await loadRows(client, collection, { limit: 100 })
            rows.reduce((res, row) => {
              let match = CUSTOM_ENT_ID_REGEX.exec(row.meta.href)
              // Metadata.CustomEntity.ИСТОЧНИКИ_ЗАКАЗА.САЙТ = '{id}/{id}'
              res[getFieldName(row.name)] = `${match[1]}/${match[2]}`
              return res
            }, Metadata.CustomEntity[entName])
          }
        }
      }
    }
  }))

  await Promise.all(thread1)

  return Metadata
}
