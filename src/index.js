/*
 * moysklad
 * Клиент для JSON API МойСклад
 *
 * Copyright (c) 2017, Vitaliy V. Makeev
 * Licensed under MIT.
 */

'use strict'

const stampit = require('stampit')
const have = require('./have')

// methods
const getTimeString = require('./tools/getTimeString')
const getAuthHeader = require('./methods/getAuthHeader')
const buildUri = require('./methods/buildUri')
const parseUri = require('./methods/parseUri')
const fetchUri = require('./methods/fetchUri')
const GET = require('./methods/GET')
const POST = require('./methods/POST')
const PUT = require('./methods/PUT')
const DELETE = require('./methods/DELETE')

module.exports = stampit({
  // TODO bind methods to this
  methods: {
    getAuthHeader,
    buildUri,
    parseUri,
    fetchUri,
    GET,
    POST,
    PUT,
    DELETE
  },
  statics: {
    getTimeString
  }
})
  .init(function (options) {
    let _options

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

    if (options.fetch) {
      this.fetch = options.fetch
    } else if (typeof fetch !== 'undefined') {
      this.fetch = fetch
    } else {
      throw new Error('fetch not specified')
    }

    if (options.emitter) {
      this.emitter = options.emitter
    }

    _options = Object.assign({
      endpoint: 'https://online.moysklad.ru/api',
      api: 'remap',
      apiVersion: '1.1'
    }, options)

    this.getOptions = function () {
      return _options
    }
  })

