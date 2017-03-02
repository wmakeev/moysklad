'use srict'

const have = require('../have')
const normalizeUrl = require('../tools/normalizeUrl')
const parseQueryString = require('../tools/parseQueryString')

const PATH_QUERY_REGEX = /([^?]+)(?:\?(.+))?$/

module.exports = function parseUri (uri) {
  have.strict(arguments, { uri: 'str' })

  let { endpoint, api, apiVersion } = this.getOptions()

  let baseUri = normalizeUrl([endpoint, api, apiVersion].join('/'))
  if (uri.indexOf(baseUri) !== 0) {
    throw new Error('Uri does not match client settings (endpoint, api, apiVersion)')
  }

  let tail = uri.substring(baseUri.length + 1)

  let [, pathStr, queryStr] = PATH_QUERY_REGEX.exec(tail)

  if (!pathStr) {
    throw new Error('Empty uri path')
  }

  let path = normalizeUrl(pathStr).split(/\//g)
  let query = parseQueryString(queryStr)

  // TODO Parse query.filter

  return { endpoint, api, apiVersion, path, query }
}
