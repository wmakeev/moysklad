/*
 * moysklad
 * Клиент для JSON API МойСклад
 *
 * Copyright (c) 2017, Vitaliy V. Makeev
 * Licensed under MIT.
 */

'use strict';

const stampit = require('stampit');
const have = require('./have');

// methods
const getTimeString = require('./tools/getTimeString');
const parseTimeString = require('./tools/parseTimeString');
const getAuthHeader = require('./methods/getAuthHeader');
const buildUrl = require('./methods/buildUrl');
const parseUrl = require('./methods/parseUrl');
const fetchUrl = require('./methods/fetchUrl');
const GET = require('./methods/GET');
const POST = require('./methods/POST');
const PUT = require('./methods/PUT');
const DELETE = require('./methods/DELETE');

// TODO Remove old methods
module.exports = stampit({
  methods: {
    getAuthHeader: getAuthHeader,
    buildUrl: buildUrl,
    buildUri: function buildUri() {
      console.log('Warning: метод buildUri переименован в buildUrl.');
      return this.buildUrl.apply(this, arguments);
    },

    parseUrl: parseUrl,
    parseUri: function parseUri() {
      console.log('Warning: метод parseUri переименован в parseUrl.');
      return this.parseUrl.apply(this, arguments);
    },

    fetchUrl: fetchUrl,
    fetchUri: function fetchUri() {
      console.log('Warning: метод fetchUri переименован в fetchUrl.');
      return this.fetchUrl.apply(this, arguments);
    },

    GET: GET,
    POST: POST,
    PUT: PUT,
    DELETE: DELETE
  },
  statics: {
    getTimeString: getTimeString,
    parseTimeString: parseTimeString
  }
}).init(function (options) {
  let _options;

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
  });

  if (options.fetch) {
    this.fetch = options.fetch;
  } else if (typeof window !== 'undefined' && window.fetch) {
    this.fetch = window.fetch.bind(window);
  } else if (typeof fetch !== 'undefined') {
    this.fetch = fetch;
  } else {
    throw new Error('Не указан Fetch API модуль' + ' (cм. подробнее https://github.com/wmakeev/moysklad#Установка).');
  }

  if (options.emitter) {
    this.emitter = options.emitter;
  }

  _options = Object.assign({
    endpoint: 'https://online.moysklad.ru/api',
    api: 'remap',
    apiVersion: '1.1'
  }, options);

  this.getOptions = function () {
    return _options;
  };
});
//# sourceMappingURL=index.js.map