/*
 * moysklad
 * Клиент для JSON API МойСклад
 *
 * Copyright (c) 2017, Vitaliy V. Makeev
 * Licensed under MIT.
 */

'use strict';

var stampit = require('stampit');
var have = require('./have');

// methods
var getTimeString = require('./tools/getTimeString');
var getAuthHeader = require('./methods/getAuthHeader');
var buildUri = require('./methods/buildUri');
var parseUri = require('./methods/parseUri');
var fetchUri = require('./methods/fetchUri');
var GET = require('./methods/GET');
var POST = require('./methods/POST');
var PUT = require('./methods/PUT');
var DELETE = require('./methods/DELETE');

module.exports = stampit({
  // TODO bind methods to this
  methods: {
    getAuthHeader: getAuthHeader,
    buildUri: buildUri,
    parseUri: parseUri,
    fetchUri: fetchUri,
    GET: GET,
    POST: POST,
    PUT: PUT,
    DELETE: DELETE
  },
  statics: {
    getTimeString: getTimeString
  }
}).init(function (options) {
  var _options = void 0;

  have(options, {
    endpoint: 'opt str',
    api: 'opt str',
    apiVersion: 'opt str',
    login: 'opt str',
    password: 'opt str',
    fetch: 'opt function'
    // queue: 'opt bool',
    // eventEmitter: 'opt obj',
  });

  if (options.fetch) {
    this.fetch = options.fetch;
  } else if (typeof fetch !== 'undefined') {
    this.fetch = fetch;
  } else {
    throw new Error('fetch not specified');
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