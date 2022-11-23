'use strict'

const getEnvVar = require('./getEnvVar')

const DEFAULT_VERSIONS = {
  'remap': '1.2',
  'phone': '1.0',
  'posap': '1.0',
  'moysklad/loyalty': '1.0'
}

const ENV_KEY = {
  'remap': 'REMAP',
  'phone': 'PHONE',
  'posap': 'POSAP',
  'moysklad/loyalty': 'LOYALTY'
}

function getApiDefaultVersion(api) {
  const apiVersion = DEFAULT_VERSIONS[api]
  const envKey = ENV_KEY[api] || api.replace(/\W/g, '_').toUpperCase()
  const envName = `MOYSKLAD_${envKey}_API_VERSION`

  return getEnvVar(envName) || apiVersion
}

module.exports = getApiDefaultVersion
