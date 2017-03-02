'use strict'

const have = require('../have')
const buildQuery = require('../tools/buildQuery')
const normalizeUrl = require('../tools/normalizeUrl')

module.exports = function buildUri (...args) {
  let { path, query } = have.strict(args, [
    { path: 'str or str arr', query: 'opt Object' },
    have.argumentsObject
  ])
  let { endpoint, api, apiVersion } = this.getOptions()

  let uri = [endpoint, api, apiVersion].concat(path).join('/')

  uri = normalizeUrl(uri)

  if (query) {
    uri = `${uri}?${buildQuery(query)}`
  }

  return uri
}
