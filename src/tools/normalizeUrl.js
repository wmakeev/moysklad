'use strict'

const URI_EXTRA_SLASH_REGEX = /([^:]\/)\/+/g
const TRIM_SLASH = /^\/+|\/+$/g

module.exports = function normalizeUrl(url) {
  return url.replace(TRIM_SLASH, '').replace(URI_EXTRA_SLASH_REGEX, '$1')
}
