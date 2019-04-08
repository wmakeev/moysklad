'use strict'

const buildFilter = require('./buildFilter')
const isPlainObject = require('./isPlainObject')

const addQueryPart = (res, key) => val => {
  if (val === null) {
    res.push([key, ''])
  } else if (val === undefined) {
    return undefined
  } else if (['string', 'number', 'boolean'].indexOf(typeof val) === -1) {
    throw new TypeError(
      'url query key value must to be string, number, boolean, null or undefined')
  } else {
    res.push([key, encodeURIComponent(val)])
  }
}

module.exports = function buildQuery (query) {
  return Object.keys(query)
    .reduce((res, key) => {
      const addPart = addQueryPart(res, key)

      switch (true) {
        case key === 'filter':
          if (isPlainObject(query.filter)) addPart(buildFilter(query.filter))
          else if (typeof query.filter === 'string') addPart(query.filter)
          else throw new TypeError('query.filter must to be string or object')
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
