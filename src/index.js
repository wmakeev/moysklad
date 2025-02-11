/*
 * moysklad
 * Клиент для JSON API МойСклад
 *
 * https://github.com/wmakeev/moysklad
 */

'use strict'

const stampit = require('stampit')

const have = require('./have')
const { version } = require('./version')
const getApiDefaultVersion = require('./getApiDefaultVersion')
const shouldRetryError = require('./shouldRetryError')

// methods
const getTimeString = require('./tools/getTimeString')
const parseTimeString = require('./tools/parseTimeString')
const buildFilter = require('./tools/buildFilter')
const buildQuery = require('./tools/buildQuery')
const getEnvVar = require('./getEnvVar.js')
const getAuthHeader = require('./methods/getAuthHeader')
const buildUrl = require('./methods/buildUrl')
const parseUrl = require('./methods/parseUrl')
const fetchUrl = require('./methods/fetchUrl')
const GET = require('./methods/GET')
const POST = require('./methods/POST')
const PUT = require('./methods/PUT')
const DELETE = require('./methods/DELETE')

// errors
const {
  MoyskladApiError,
  MoyskladError,
  MoyskladRequestError,
  MoyskladCollectionError,
  MoyskladUnexpectedRedirectError
} = require('./errors')

const getVersion = () => version

// TODO Remove old methods
module.exports = stampit({
  methods: {
    getAuthHeader,

    buildUrl,

    /* c8 ignore next 3 */
    buildUri(...args) {
      console.log('Warning: метод buildUri переименован в buildUrl')
      return this.buildUrl(...args)
    },

    parseUrl,

    /* c8 ignore next 3 */
    parseUri(...args) {
      console.log('Warning: метод parseUri переименован в parseUrl')
      return this.parseUrl(...args)
    },

    fetchUrl,

    /* c8 ignore next 3 */
    fetchUri(...args) {
      console.log('Warning: метод fetchUri переименован в fetchUrl')
      return this.fetchUrl(...args)
    },

    GET,

    POST,

    PUT,

    DELETE
  },

  statics: {
    getVersion,
    getTimeString,
    parseTimeString,
    parseUrl,
    buildFilter,
    buildQuery,
    shouldRetryError,
    MoyskladError,
    MoyskladRequestError,
    MoyskladUnexpectedRedirectError,
    MoyskladApiError,
    MoyskladCollectionError
  }
}).init(function (options) {
  have(options, {
    endpoint: 'opt str',
    api: 'opt str',
    apiVersion: 'opt str'

    // TODO fix have object arguments parsing
    // login: 'opt str',
    // password: 'opt str',
    // fetch: 'opt function'
    // queue: 'opt bool',
    // emitter: 'opt obj'
  })

  this.retry = options.retry == null ? thunk => thunk() : options.retry

  if (options.fetch) {
    this.fetch = options.fetch
  } else if (typeof window !== 'undefined' && window.fetch) {
    this.fetch = window.fetch.bind(window)
  } else if (typeof fetch !== 'undefined') {
    /* eslint no-undef:0 */
    this.fetch = fetch
  } else {
    this.fetch = function () {
      throw new MoyskladError(
        'Нельзя выполнить http запрос, т.к. при инициализации' +
          ' экземпляра библиотеки не указан Fetch API модуль' +
          ' (cм. подробнее https://github.com/wmakeev/moysklad#Установка).'
      )
    }
  }

  if (options.emitter) {
    this.emitter = options.emitter
  }

  const MOYSKLAD_HOST = getEnvVar('MOYSKLAD_HOST', 'api.moysklad.ru')
  const MOYSKLAD_API = getEnvVar('MOYSKLAD_API', 'remap')
  const MOYSKLAD_USER_AGENT = getEnvVar(
    'MOYSKLAD_USER_AGENT',
    `moysklad/${version} (+https://github.com/wmakeev/moysklad)`
  )

  const _options = Object.assign(
    {
      endpoint: `https://${MOYSKLAD_HOST}/api`,
      api: MOYSKLAD_API,
      userAgent: MOYSKLAD_USER_AGENT
    },
    options
  )

  if (!_options.apiVersion) {
    const apiVersion = getApiDefaultVersion(_options.api)

    if (apiVersion) {
      _options.apiVersion = apiVersion
    } else {
      throw new MoyskladError(`Не указана версия ${_options.api} API`)
    }
  }

  this.getOptions = function () {
    return _options
  }

  this.getVersion = function () {
    return version
  }
})
