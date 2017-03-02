'use strict'

const have = require('../have')

module.exports = async function loadRows () {
  let { client, collection, query = {} } = have(arguments, [
    { client: 'Object', collection: 'Moysklad.Collection', query: 'opt obj' },
    have.argumentsObject
  ])

  // TODO Коллекция может быть не загружена!
  if (!collection.meta.nextHref) {
    return collection.rows
  }

  let pages = [collection]

  let { size, limit, offset } = collection.meta
  let href = client.parseUri(collection.meta.href)

  offset += limit

  if (query.limit != null) {
    if (query.limit <= 0) throw new Error('query.limit should be greater then 0')
    limit = query.limit
  }

  while (size > offset) {
    pages.push(client.GET(href.path,
      Object.assign({}, href.query || {}, query, { offset })))
    offset += limit
  }

  let rows = (await Promise.all(pages)).reduce((res, pos) => res.concat(pos.rows), [])

  return rows
}
