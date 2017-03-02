'use strict'

function extractQueryValue (str) {
  if (str === '') { return null }
  let asBool = Boolean(str)
  if (asBool.toString() === str) {
    return asBool
  }

  let asNum = parseInt(str)
  if (asNum.toString() === str) {
    return asNum
  }

  return decodeURIComponent(str)
}

function extractQueryValues (str) {
  return str.indexOf(',') !== -1
    ? str.split(',').map(v => extractQueryValue(v))
    : [extractQueryValue(str)]
}

module.exports = function parseQueryString (queryString) {
  if (queryString == null || queryString === '') { return void 0 }
  queryString = queryString.trim()
  if (!queryString) { return void 0 }

  let kvMap = queryString.split('&').reduce((res, queryPart) => {
    let kv = queryPart.split('=')
    let key = kv[0]
    let value = extractQueryValues(kv[1])
    let resValue = res.get(key)
    return res.set(key, resValue ? resValue.concat(value) : value)
  }, new Map())

  let result = {}
  for (let entry of kvMap.entries()) {
    let [key, value] = entry
    result[key] = value.length > 1 ? value : value[0]
  }

  return result
}
