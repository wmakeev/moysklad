'use strict'

const have = require('../have')
const buildQuery = require('../tools/buildQuery')
const normalizeUrl = require('../tools/normalizeUrl')

module.exports = function buildUrl (...args) {
  let { url, path, query } = have.strict(args, [
    { url: 'url', query: 'opt Object' },
    { path: 'str or str arr', query: 'opt Object' },
    have.argumentsObject
  ])

  if (url) {
    let parsedUrl = this.parseUrl(url)
    path = parsedUrl.path
    query = {
      ...parsedUrl.query,
      ...query
    }
  }

  let { endpoint, api, apiVersion } = this.getOptions()

  let resultUrl = normalizeUrl([endpoint, api, apiVersion].concat(path).join('/'))

  if (query) {
    let queryString = buildQuery(query)
    resultUrl = resultUrl + (queryString ? `?${queryString}` : '')
  }

  return resultUrl
}
