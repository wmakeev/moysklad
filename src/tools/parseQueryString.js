'use strict'

function extractQueryValue(str) {
  if (str === '') {
    return null
  }
  const asBool = Boolean(str)
  if (asBool.toString() === str) {
    return asBool
  }

  const asNum = parseInt(str)
  if (asNum.toString() === str) {
    return asNum
  }

  return decodeURIComponent(str)
}

function extractQueryValues(str) {
  return str.indexOf(',') !== -1
    ? str.split(',').map(v => extractQueryValue(v))
    : [extractQueryValue(str)]
}

module.exports = function parseQueryString(queryString) {
  if (queryString == null || queryString === '') {
    return undefined
  }
  queryString = queryString.trim()
  if (!queryString) {
    return undefined
  }

  const kvMap = queryString.split('&').reduce((res, queryPart) => {
    const kv = queryPart.split('=')
    const key = kv[0]
    const value = extractQueryValues(kv[1])
    const resValue = res.get(key)
    return res.set(key, resValue ? resValue.concat(value) : value)
  }, new Map())

  const result = {}
  for (const entry of kvMap.entries()) {
    const [key, value] = entry
    result[key] = value.length > 1 ? value : value[0]
  }

  return result
}
