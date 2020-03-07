'use strict'

function getEnvVar (key) {
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key]
  } else if (typeof window !== 'undefined' && window[key] != null) {
    return window[key]
  } else if (typeof global !== 'undefined' && global[key] != null) {
    return global[key]
  } else {
    return null
  }
}

module.exports = getEnvVar
