'use strict'

const { MoyskladError } = require('../errors')
const getTimeString = require('./getTimeString')
const isPlainObject = require('./isPlainObject')
const isSimpleValue = require('./isSimpleValue')

const createValueSelector = selector => (path, value) => {
  if (!isSimpleValue(value)) {
    throw new MoyskladError(
      'значение должно быть строкой, числом, датой или null'
    )
  }
  return [[path, selector, value]]
}

const createCollectionSelector = selector => {
  const sel = createValueSelector(selector)

  return (path, value) => {
    if (!(value instanceof Array)) {
      throw new MoyskladError(
        `значение селектора ${path.join('.')} должно быть массивом`
      )
    }

    return value.reduce((res, v) => res.concat(sel(path, v)), [])
  }
}

// Comparison selectors
const selectors = {
  eq: { operator: '=' },
  gt: { operator: '>' },
  gte: { operator: '>=' },
  lt: { operator: '<' },
  lte: { operator: '<=' },
  ne: { operator: '!=' },
  contains: { operator: '~' },
  st: { operator: '~=' },
  et: { operator: '=~' },
  in: { operator: '=', collection: true },
  nin: { operator: '!=', collection: true }
}

Object.keys(selectors).forEach(key => {
  selectors[key].name = `$${key}`
})

selectors.eq.not = selectors.ne
selectors.gt.not = selectors.lte
selectors.gte.not = selectors.lt
selectors.lt.not = selectors.gte
selectors.lte.not = selectors.gt
selectors.ne.not = selectors.eq
selectors.in.not = selectors.nin
selectors.nin.not = selectors.in

const comparisonSelectors = Object.keys(selectors).reduce((res, key) => {
  const op = selectors[key]
  res['$' + key] = (
    op.collection ? createCollectionSelector : createValueSelector
  )(op)
  return res
}, {})

// Logical selectors
const invertFilterPart = fp => {
  if (!fp[1].not) {
    throw new MoyskladError(
      `${fp[1].name} не поддерживает селектор отрицания $not`
    )
  }
  return [fp[0], fp[1].not, fp[2]]
}

function getFilterParts(path, value) {
  const pathLen = path.length
  const curKey = pathLen ? path[pathLen - 1] : null

  switch (true) {
    // Mongo logical selectors
    case curKey === '$all':
      if (!(value instanceof Array)) {
        throw new MoyskladError('$all: значение селектора должно быть массивом')
      }
      return value.reduce(
        (res, val) => res.concat(getFilterParts(path.slice(0, -1), val)),
        []
      )

    case curKey === '$not':
      if (!isPlainObject(value)) {
        throw new MoyskladError('$not: значение селектора должно быть объектом')
      }
      // .concat([[headPath, selectors.eq, null]])
      return getFilterParts(path.slice(0, -1), value).map(invertFilterPart)

    case curKey === '$exists':
      if (typeof value !== 'boolean') {
        throw new MoyskladError(
          '$exists: значение селектора должно быть логическим значением'
        )
      }
      return [[path.slice(0, -1), value ? selectors.ne : selectors.eq, null]]

    // Mongo comparison selectors
    case !!comparisonSelectors[curKey]:
      try {
        return comparisonSelectors[curKey](path.slice(0, -1), value)
      } catch (error) {
        throw new MoyskladError(`${curKey}: ${error.message}`)
      }

    // Unknown mongo selector
    case curKey && curKey.substr(0, 1) === '$' && path.length > 1:
      throw new MoyskladError(`Неизвестный селектор "${curKey}"`)

    // Array
    case value instanceof Array:
      return value.reduce(
        (res, val) => res.concat(getFilterParts(path, val)),
        []
      )

    // Object
    case !isSimpleValue(value):
      return Object.keys(value).reduce(
        (res, key) => res.concat(getFilterParts(path.concat(key), value[key])),
        []
      )

    // some other value
    default:
      return [[path, selectors.eq, value]]
  }
}

module.exports = function buildFilter(filter) {
  if (!isPlainObject(filter)) {
    throw new MoyskladError('Поле filter должно быть объектом')
  }

  let filterParts = getFilterParts([], filter)

  // преобразование ключа в строку
  filterParts = filterParts.map(part => [part[0].join('.'), part[1], part[2]])

  return (
    filterParts
      // конвертация операторов и значений в строку
      .map(part => {
        const key = part[0]
        const operator = part[1].operator
        const value = part[2]
        switch (true) {
          case value === undefined:
            return null

          case value === null:
            return [key, operator, '']

          case value instanceof Date:
            return [key, operator, getTimeString(value, true)]

          case typeof value === 'string': {
            return [
              key,
              operator,
              value.includes(';') ? value.replaceAll(';', '\\;') : value
            ]
          }

          case typeof value === 'number':
          case typeof value === 'boolean':
            return [key, operator, value]

          default:
            throw new MoyskladError(
              `Некорректное значение поля "${key}" в фильтре`
            )
        }
      })
      .filter(it => it != null)
      .map(part => `${part[0]}${part[1]}${part[2]}`)
      // TODO Можно удалить эту сортировку (лишняя не нужная работа)
      // только нужно адаптировать тесты
      .sort((p1, p2) => {
        if (p1 > p2) {
          return 1
        }
        if (p1 < p2) {
          return -1
        }
        return 0
      })
      .join(';')
  )
}
