'use strict'

const have = require('../have')
const buildQuery = require('../tools/buildQuery')
const normalizeUrl = require('../tools/normalizeUrl')

let pathArrayDeprecationNoticeShown = false

module.exports = function buildUrl(...args) {
  // eslint-disable-next-line prefer-const
  let { url, path, query } = have.strict(args, [
    { url: 'url', query: 'opt Object' },
    { path: 'str or str arr', query: 'opt Object' },
    have.argumentsObject
  ])

  if (url) {
    const parsedUrl = this.parseUrl(url)
    path = parsedUrl.path.join('/')
    query = {
      ...parsedUrl.query,
      ...query
    }
  }

  if (Array.isArray(path)) {
    if (!pathArrayDeprecationNoticeShown) {
      console.log(
        '[DEPRECATED] moysklad#buildUrl: для передачи параметра path' +
          ' используйте строку вместо массива'
      )
      pathArrayDeprecationNoticeShown = true
    }

    path = path.join('/')
  }

  const { endpoint, api, apiVersion } = this.getOptions()

  let resultUrl = normalizeUrl(
    [endpoint, api, apiVersion].concat(path).join('/')
  )

  if (query) {
    const queryString = buildQuery(query)
    resultUrl = resultUrl + (queryString ? `?${queryString}` : '')
  }

  return resultUrl
}
