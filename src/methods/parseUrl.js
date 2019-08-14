'use srict'

const have = require('../have')
const normalizeUrl = require('../tools/normalizeUrl')
const parseQueryString = require('../tools/parseQueryString')

const PATH_QUERY_REGEX = /([^?]+)(?:\?(.+))?$/

module.exports = function parseUrl (...args) {
  const { url, path } = have.strict(arguments, [
    { url: 'url' },
    { path: 'str or str arr' }
  ])

  const { endpoint, api, apiVersion } = this.getOptions()

  if (path instanceof Array) {
    return {
      endpoint,
      api,
      apiVersion,
      path: normalizeUrl(path.join('/')).split(/\//g),
      query: {}
    }
  }

  let pathAndQuery

  if (url) {
    const baseUrl = normalizeUrl([endpoint, api, apiVersion].join('/'))
    if (url.indexOf(baseUrl) !== 0) {
      throw new Error('Url не соответствует указанной в настройках точке доступа ' + baseUrl)
    }
    pathAndQuery = url.substring(baseUrl.length + 1)
  } else {
    pathAndQuery = path
  }

  const [, pathStr, queryStr] = PATH_QUERY_REGEX.exec(pathAndQuery)

  if (!pathStr) throw new Error('Не указан путь запроса')

  // TODO Parse query.filter

  return {
    endpoint,
    api,
    apiVersion,
    path: normalizeUrl(pathStr).split(/\//g),
    query: parseQueryString(queryStr) || {}
  }
}
