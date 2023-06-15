'use srict'

const { MoyskladError } = require('../errors')
const have = require('../have')
const normalizeUrl = require('../tools/normalizeUrl')
const parseQueryString = require('../tools/parseQueryString')

// https://regex101.com/r/yQgvn4/4
const URL_REGEX = /^(https:\/\/.+\/api)\/(.+)\/(\d+\.\d+)\/([^?]+)(?:\?(.+))?$/

module.exports = function parseUrl(...args) {
  const { url, path } = have.strict(args, [
    { url: 'url' },
    { path: 'str or str arr' }
  ])

  const isCalledOnInstance = !!(this && this.getOptions)

  if (!url && !isCalledOnInstance) {
    throw new MoyskladError(
      'Для вызова статического метода parseUrl, необходимо передать url'
    )
  }

  let { endpoint, api, apiVersion } = isCalledOnInstance
    ? this.getOptions()
    : {}

  let pathStr = ''
  let queryStr = ''

  if (path instanceof Array) {
    pathStr = path.join('/')
  } else if (typeof path === 'string') {
    pathStr = path
  } else if (url) {
    const [, endpoint_, api_, version_, path_, query_] =
      URL_REGEX.exec(url) || []
    endpoint = endpoint_
    api = api_
    pathStr = path_
    apiVersion = version_
    queryStr = query_
  }

  if (!endpoint || !api || !apiVersion || !pathStr) {
    throw new MoyskladError(
      `parseUrl: Url не соответствует API МойСклад - ${url || path}`
    )
  }

  return {
    endpoint,
    api,
    apiVersion,
    path: normalizeUrl(pathStr).split(/\//g),
    query: parseQueryString(queryStr) || {}
  }
}
