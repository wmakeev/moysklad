'use strict'

const { MoyskladError } = require('../errors')
const buildFilter = require('./buildFilter')
const isPlainObject = require('./isPlainObject')

const addQueryPart = (res, key) => val => {
  if (val === null) {
    res.push([key, ''])
  } else if (val === undefined) {
    return undefined
  } else if (['string', 'number', 'boolean'].indexOf(typeof val) === -1) {
    throw new MoyskladError(
      'Значение поля строки запроса должно быть строкой, числом, логическим значением, null или undefined'
    )
  } else {
    res.push([key, encodeURIComponent(val)])
  }
}

module.exports = function buildQuery(query) {
  return Object.keys(query)
    .reduce((res, key) => {
      const addPart = addQueryPart(res, key)

      switch (true) {
        case key === 'filter':
          if (isPlainObject(query.filter)) addPart(buildFilter(query.filter))
          else if (typeof query.filter === 'string') addPart(query.filter)
          else {
            throw new MoyskladError(
              'Поле filter запроса должно быть строкой или объектом'
            )
          }
          break

        case key === 'order' && query.order instanceof Array:
          addPart(
            query.order
              .map(o =>
                o instanceof Array
                  ? `${o[0]}${o[1] != null ? ',' + o[1] : ''}`
                  : o
              )
              .join(';')
          )
          break

        case query[key] instanceof Array:
          query[key].forEach(addPart)
          break

        default:
          addPart(query[key])
      }

      return res
    }, [])
    .map(kv => `${kv[0]}=${kv[1]}`)
    .join('&')
}
