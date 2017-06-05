(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.MoyskladCore = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

module.exports = {
  '400': 'Ошибка в структуре JSON передаваемого запроса',
  '401': 'Имя и/или пароль пользователя указаны неверно или заблокированы пользователь или аккаунт',
  '403': 'У вас нет прав на просмотр данного объекта',
  '404': 'Запрошенный ресурс не существует',
  '405': 'http-метод указан неверно для запрошенного ресурса',
  '409': 'Указанный объект используется и не может быть удалён',
  '410': 'Версия API больше не поддерживается',
  '412': 'Не указан обязательный параметр строки запроса или поле структуры JSON',
  '413': 'Размер запроса или количество элементов запроса превышает лимит',
  '429': 'Превышен лимит количества запросов',
  '500': 'При обработке запроса возникла непредвиденная ошибка',
  '502': 'Сервис временно недоступен',
  '503': 'Сервис временно отключен',
  '504': 'Превышен таймаут обращения к сервису, повторите попытку позднее'
};

},{}],2:[function(require,module,exports){
'use strict';

function createError(responseError, errors) {
  let error = new Error(responseError.error);
  if (responseError.code) {
    error.code = responseError.code;
  }
  if (responseError.moreInfo) {
    error.moreInfo = responseError.moreInfo;
  }
  if (errors) {
    error.errors = errors;
  }
  return error;
}

module.exports = function getResponseError(resp) {
  if (resp.errors) {
    return createError(resp.errors[0], resp.errors);
  } else if (resp.error) {
    return createError(resp);
  } else {
    return null;
  }
};

},{}],3:[function(require,module,exports){
'use strict';

const have = require('have2');
const matchers = require('./matchers');

module.exports = have.with(matchers);

},{"./matchers":5,"have2":23}],4:[function(require,module,exports){
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

},{"./have":3,"./methods/DELETE":6,"./methods/GET":7,"./methods/POST":8,"./methods/PUT":9,"./methods/buildUrl":10,"./methods/fetchUrl":11,"./methods/getAuthHeader":12,"./methods/parseUrl":13,"./tools/getTimeString":16,"./tools/parseTimeString":21,"stampit":24}],5:[function(require,module,exports){
'use strict';

const UUID_REGEX = /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/;

const urlMatcher = url => typeof url === 'string' && url.substring(0, 8) === 'https://';
const uuidMatcher = uuid => typeof uuid === 'string' && UUID_REGEX.test(uuid);

// TODO Убедиться что указан необходимый минимум полей для сущностей
module.exports = {
  'entity': ent => !!(ent && ent.id && uuidMatcher(ent.id) && ent.meta && ent.meta.type),
  'uuid': uuidMatcher,
  'url': urlMatcher,
  // 'uuid/uuid': id => {
  //   if (typeof id !== 'string') { return false }
  //   let [dicId, entId] = id.split('/')
  //   return UUID_REGEX.test(dicId) && UUID_REGEX.test(entId)
  // },
  'Moysklad.Collection': col => !!(col && col.meta && col.meta.type && urlMatcher(col.meta.href) && typeof col.meta.size === 'number')
};

// TODO Проверка типов "Moysklad." на основании модели

},{}],6:[function(require,module,exports){
'use strict';

const have = require('../have');

module.exports = function DELETE() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  var _have$strict = have.strict(args, [{ path: 'str or str arr', options: 'opt Object' }, have.argumentsObject]);

  let path = _have$strict.path;
  var _have$strict$options = _have$strict.options;
  let options = _have$strict$options === undefined ? {} : _have$strict$options;


  let uri = this.buildUrl(path);

  return this.fetchUrl(uri, Object.assign({}, options, { method: 'DELETE' }));
};

},{"../have":3}],7:[function(require,module,exports){
'use strict';

const have = require('../have');

module.exports = function GET() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  var _have$strict = have.strict(args, [{ path: 'str or str arr', query: 'opt Object', options: 'opt Object' }, have.argumentsObject]);

  let path = _have$strict.path,
      query = _have$strict.query;
  var _have$strict$options = _have$strict.options;
  let options = _have$strict$options === undefined ? {} : _have$strict$options;


  let uri = this.buildUrl(path, query);

  return this.fetchUrl(uri, Object.assign({}, options, { method: 'GET' }));
};

},{"../have":3}],8:[function(require,module,exports){
'use strict';

const have = require('../have');

module.exports = function POST() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  // TODO Test payload: 'Object or Object arr'
  var _have$strict = have.strict(args, [{
    path: 'str or str arr',
    payload: 'opt Object or Object arr',
    query: 'opt Object',
    options: 'opt Object'
  }, have.argumentsObject]);

  let path = _have$strict.path,
      payload = _have$strict.payload,
      query = _have$strict.query;
  var _have$strict$options = _have$strict.options;
  let options = _have$strict$options === undefined ? {} : _have$strict$options;


  let uri = this.buildUrl(path, query);
  let fetchOptions = { method: 'POST' };
  if (payload) fetchOptions.body = JSON.stringify(payload);

  return this.fetchUrl(uri, Object.assign({}, options, fetchOptions));
};

},{"../have":3}],9:[function(require,module,exports){
'use strict';

const have = require('../have');

module.exports = function PUT() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  var _have$strict = have.strict(args, [{
    path: 'str or str arr',
    payload: 'opt Object',
    query: 'opt Object',
    options: 'opt Object'
  }, have.argumentsObject]);

  let path = _have$strict.path,
      payload = _have$strict.payload,
      query = _have$strict.query;
  var _have$strict$options = _have$strict.options;
  let options = _have$strict$options === undefined ? {} : _have$strict$options;


  let uri = this.buildUrl(path, query);
  let fetchOptions = { method: 'PUT' };
  if (payload) fetchOptions.body = JSON.stringify(payload);

  return this.fetchUrl(uri, Object.assign({}, options, fetchOptions));
};

},{"../have":3}],10:[function(require,module,exports){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

const have = require('../have');
const buildQuery = require('../tools/buildQuery');
const normalizeUrl = require('../tools/normalizeUrl');

module.exports = function buildUrl() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  var _have$strict = have.strict(args, [{ url: 'url', query: 'opt Object' }, { path: 'str or str arr', query: 'opt Object' }, have.argumentsObject]);

  let url = _have$strict.url,
      path = _have$strict.path,
      query = _have$strict.query;


  if (url) {
    let parsedUrl = this.parseUrl(url);
    path = parsedUrl.path;
    query = _extends({}, parsedUrl.query, query);
  }

  var _getOptions = this.getOptions();

  let endpoint = _getOptions.endpoint,
      api = _getOptions.api,
      apiVersion = _getOptions.apiVersion;


  let resultUrl = normalizeUrl([endpoint, api, apiVersion].concat(path).join('/'));

  if (query) {
    resultUrl = `${resultUrl}?${buildQuery(query)}`;
  }

  return resultUrl;
};

},{"../have":3,"../tools/buildQuery":15,"../tools/normalizeUrl":19}],11:[function(require,module,exports){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const have = require('../have');
const getResponseError = require('../getResponseError');
const errorsHttp = require('../errorsHttp');

module.exports = (() => {
  var _ref = _asyncToGenerator(function* (uri) {
    let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    have.strict(arguments, { url: 'url', options: 'opt Object' });

    // Специфические параметры (не передаются в опции fetch)
    let includeHeaders = false;
    let muteErrors = false;
    let emit = this.emitter ? this.emitter.emit.bind(this.emitter) : null;

    let fetchOptions = _extends({
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      redirect: 'manual'
    }, options);

    if (fetchOptions.includeHeaders) {
      includeHeaders = true;
      delete fetchOptions.includeHeaders;
    }
    if (fetchOptions.muteErrors) {
      muteErrors = true;
      delete fetchOptions.muteErrors;
    }

    let authHeader = this.getAuthHeader();
    if (authHeader) {
      fetchOptions.headers.Authorization = this.getAuthHeader();
    }

    if (emit) emit('request:start', { uri: uri, options: fetchOptions });
    /** @type {Response} */
    let response = yield this.fetch(uri, fetchOptions);

    let contentType, responseJson, error;

    if (emit) emit('response:head', { uri: uri, options: fetchOptions, response: response });
    if (response.headers.has('Content-Type')) {
      contentType = response.headers.get('Content-Type');
    }

    if (contentType && contentType.indexOf('application/json') !== -1) {
      // получение ответа сервера и обработка ошибок API
      responseJson = yield response.json();
      if (emit) emit('response:body', { uri: uri, options: fetchOptions, response: response, body: responseJson });
      error = getResponseError(responseJson);
    } else if (!response.ok) {
      // обработка ошибок http
      error = errorsHttp[response.status.toString()];
      error = new Error(error || `Http error: ${response.status} ${response.statusText}`);
    }

    if (error) {
      if (emit) emit('error', error);
      if (!muteErrors) throw error;
    }

    return includeHeaders ? [response.headers, responseJson, response] : responseJson;
  });

  function fetchUrl(_x2) {
    return _ref.apply(this, arguments);
  }

  return fetchUrl;
})();

},{"../errorsHttp":1,"../getResponseError":2,"../have":3}],12:[function(require,module,exports){
'use strict';

/* global MOYSKLAD_LOGIN, MOYSKLAD_PASSWORD */

const base64encode = require('@wmakeev/base64encode');

module.exports = function getAuthHeader() {
  let login;
  let password;
  let options = this.getOptions();

  if (options.login && options.password) {
    login = options.login;
    password = options.password;
  } else if (typeof process !== 'undefined' && process.env && process.env.MOYSKLAD_LOGIN && process.env.MOYSKLAD_PASSWORD) {
    login = process.env.MOYSKLAD_LOGIN;
    password = process.env.MOYSKLAD_PASSWORD;
  } else if (typeof MOYSKLAD_LOGIN !== 'undefined' && typeof MOYSKLAD_PASSWORD !== 'undefined') {
    login = MOYSKLAD_LOGIN;
    password = MOYSKLAD_PASSWORD;
  } else {
    return null;
  }

  return 'Basic ' + base64encode(`${login}:${password}`);
};

},{"@wmakeev/base64encode":22}],13:[function(require,module,exports){
'use strict';
'use srict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

const have = require('../have');
const normalizeUrl = require('../tools/normalizeUrl');
const parseQueryString = require('../tools/parseQueryString');

const PATH_QUERY_REGEX = /([^?]+)(?:\?(.+))?$/;

module.exports = function parseUrl() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  var _have$strict = have.strict(arguments, [{ url: 'url' }, { path: 'str or str arr' }]);

  let url = _have$strict.url,
      path = _have$strict.path;

  var _getOptions = this.getOptions();

  let endpoint = _getOptions.endpoint,
      api = _getOptions.api,
      apiVersion = _getOptions.apiVersion;


  if (path instanceof Array) {
    return {
      endpoint: endpoint,
      api: api,
      apiVersion: apiVersion,
      path: normalizeUrl(path.join('/')).split(/\//g),
      query: {}
    };
  }

  let pathAndQuery;

  if (url) {
    let baseUrl = normalizeUrl([endpoint, api, apiVersion].join('/'));
    if (url.indexOf(baseUrl) !== 0) {
      throw new Error('Url не соответствует указанной в настройках точке доступа ' + baseUrl);
    }
    pathAndQuery = url.substring(baseUrl.length + 1);
  } else {
    pathAndQuery = path;
  }

  var _PATH_QUERY_REGEX$exe = PATH_QUERY_REGEX.exec(pathAndQuery),
      _PATH_QUERY_REGEX$exe2 = _slicedToArray(_PATH_QUERY_REGEX$exe, 3);

  let pathStr = _PATH_QUERY_REGEX$exe2[1],
      queryStr = _PATH_QUERY_REGEX$exe2[2];


  if (!pathStr) throw new Error('Не указан путь запроса');

  // TODO Parse query.filter

  return {
    endpoint: endpoint,
    api: api,
    apiVersion: apiVersion,
    path: normalizeUrl(pathStr).split(/\//g),
    query: parseQueryString(queryStr) || {}
  };
};

},{"../have":3,"../tools/normalizeUrl":19,"../tools/parseQueryString":20}],14:[function(require,module,exports){
'use strict';

const getTimeString = require('./getTimeString');
const isPlainObject = require('./isPlainObject');
const isSimpleValue = require('./isSimpleValue');

let createValueSelector = selector => (path, value) => {
  if (!isSimpleValue(value)) {
    throw new Error(`value must to be string, number, date or null`);
  }
  return [[path, selector, value]];
};

let createCollectionSelector = selector => {
  const sel = createValueSelector(selector);
  return (path, value) => {
    if (!(value instanceof Array)) {
      throw new Error(`selector value must to be an array`);
    }
    return value.reduce((res, v) => res.concat(sel(path, v)), []);
  };
};

// Comparison selectors
const selectors = {
  eq: { operator: '=' },
  gt: { operator: '>' },
  gte: { operator: '>=' },
  lt: { operator: '<' },
  lte: { operator: '>=' },
  ne: { operator: '!=' },
  in: { operator: '=', collection: true },
  nin: { operator: '!=', collection: true }
};

selectors.eq.not = selectors.ne;
selectors.gt.not = selectors.lte;
selectors.gte.not = selectors.lt;
selectors.lt.not = selectors.gte;
selectors.lte.not = selectors.gt;
selectors.ne.not = selectors.eq;
selectors.in.not = selectors.nin;
selectors.nin.not = selectors.in;

const comparisonSelectors = Object.keys(selectors).reduce((res, key) => {
  let op = selectors[key];
  res['$' + key] = (op.collection ? createCollectionSelector : createValueSelector)(op);
  return res;
}, {});

// Logical selectors
const invertFilterPart = fp => [fp[0], fp[1].not, fp[2]];

function getFilterParts(path, value) {
  const pathLen = path.length;
  const curKey = pathLen ? path[pathLen - 1] : null;

  switch (true) {
    // Mongo logical selectors
    case curKey === '$and':
      if (!(value instanceof Array)) {
        throw new Error(`$and: selector value must to be an array`);
      }
      return value.reduce((res, val) => res.concat(getFilterParts(path.slice(0, -1), val)), []);

    case curKey === '$not':
      if (!isPlainObject(value)) {
        throw new Error(`$not: selector value must to be an object`);
      }
      let headPath = path.slice(0, -1);
      return getFilterParts(headPath, value).map(invertFilterPart).concat([[headPath, selectors.eq, null]]);

    case curKey === '$exists':
      if (typeof value !== 'boolean') {
        throw new Error(`$exists: elector value must to be boolean`);
      }
      return [[path.slice(0, -1), selectors.ne, null]];

    // Mongo comparison selectors
    case !!comparisonSelectors[curKey]:
      let parts;
      try {
        parts = comparisonSelectors[curKey](path.slice(0, -1), value);
      } catch (error) {
        throw new Error(`${curKey}: ${error.message}`);
      }
      return parts;

    // Array
    case value instanceof Array:
      return value.reduce((res, val) => res.concat(getFilterParts(path, val)), []);

    // Object
    case !isSimpleValue(value):
      return Object.keys(value).reduce((res, key) => res.concat(getFilterParts(path.concat(key), value[key])), []);

    // some other value
    default:
      return [[path, selectors.eq, value]];
  }
}

module.exports = function buildFilter(filter) {
  if (!isPlainObject(filter)) {
    throw new Error('filter must to be an object');
  }

  let filterParts = getFilterParts([], filter);

  // преобразование ключа в строку
  filterParts = filterParts.map(part => [part[0].join('.'), part[1], part[2]]);

  return filterParts
  // конвертация операторов и значений в строку
  .map(part => {
    let key = part[0];
    let operator = part[1].operator;
    let value = part[2];
    switch (true) {
      case value === undefined:
        throw new Error(`filter "${key}" key value is undefined`);

      case value === null:
        return [key, operator, ''];

      case value instanceof Date:
        return [key, operator, getTimeString(value)];

      case typeof value === 'string':
      case typeof value === 'number':
        return [key, operator, value];

      default:
        throw new Error(`filter "${key}" key value is incorrect`);
    }
  }).map(part => `${part[0]}${part[1]}${part[2]}`).sort((p1, p2) => {
    if (p1 > p2) {
      return 1;
    }
    if (p1 < p2) {
      return -1;
    }
    return 0;
  }).join(';');
};

},{"./getTimeString":16,"./isPlainObject":17,"./isSimpleValue":18}],15:[function(require,module,exports){
'use strict';

const buildFilter = require('./buildFilter');
const isPlainObject = require('./isPlainObject');

module.exports = function buildQuery(query) {
  return Object.keys(query).reduce((res, key) => {
    let addPart = val => {
      if (['string', 'number', 'boolean'].indexOf(typeof val) === -1) {
        throw new Error('url query key value must to be string, number or boolean');
      }
      res = res.concat([[key, encodeURIComponent(val)]]);
    };

    switch (true) {
      case key === 'filter':
        if (isPlainObject(query.filter)) addPart(buildFilter(query.filter));else if (typeof query.filter === 'string') addPart(query.filter);else throw new Error('filter must to be string or object');
        break;

      case query[key] == null:
        addPart('');
        break;

      case query[key] instanceof Array:
        query[key].forEach(addPart);
        break;

      default:
        addPart(query[key]);
    }

    return res;
  }, []).map(kv => `${kv[0]}=${kv[1]}`).join('&');
};

},{"./buildFilter":14,"./isPlainObject":17}],16:[function(require,module,exports){
'use strict';

const MSK_TIMEZONE_OFFSET = 180 * 60 * 1000;

/**
 * Возвращает дату для фильтра в часовом поясе Москвы
 * @param {Date} date Конвертируемая дата
 * @param {boolean} includeMs Отображать миллисекунды
 * @returns {string} Дата ввиде строки
 */
module.exports = function getTimeString(date, includeMs) {
  let mskTime = new Date(+date + MSK_TIMEZONE_OFFSET);

  return mskTime.toJSON().replace('T', ' ').replace(includeMs ? /Z$/ : /\.\d{3}Z$/, '');
};

},{}],17:[function(require,module,exports){
'use strict';

module.exports = function isPlainObject(value) {
  return Object.prototype.toString.call(value) === '[object Object]';
};

},{}],18:[function(require,module,exports){
'use strict';

module.exports = function isSimpleValue(value) {
  return typeof value !== 'object' || value instanceof Date || value === null;
};

},{}],19:[function(require,module,exports){
'use strict';

const URI_EXTRA_SLASH_REGEX = /([^:]\/)\/+/g;
const TRIM_SLASH = /^\/+|\/+$/g;

module.exports = function normalizeUrl(url) {
  return url.replace(TRIM_SLASH, '').replace(URI_EXTRA_SLASH_REGEX, '$1').toLowerCase();
};

},{}],20:[function(require,module,exports){
'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function extractQueryValue(str) {
  if (str === '') {
    return null;
  }
  let asBool = Boolean(str);
  if (asBool.toString() === str) {
    return asBool;
  }

  let asNum = parseInt(str);
  if (asNum.toString() === str) {
    return asNum;
  }

  return decodeURIComponent(str);
}

function extractQueryValues(str) {
  return str.indexOf(',') !== -1 ? str.split(',').map(v => extractQueryValue(v)) : [extractQueryValue(str)];
}

module.exports = function parseQueryString(queryString) {
  if (queryString == null || queryString === '') {
    return void 0;
  }
  queryString = queryString.trim();
  if (!queryString) {
    return void 0;
  }

  let kvMap = queryString.split('&').reduce((res, queryPart) => {
    let kv = queryPart.split('=');
    let key = kv[0];
    let value = extractQueryValues(kv[1]);
    let resValue = res.get(key);
    return res.set(key, resValue ? resValue.concat(value) : value);
  }, new Map());

  let result = {};
  for (let entry of kvMap.entries()) {
    var _entry = _slicedToArray(entry, 2);

    let key = _entry[0],
        value = _entry[1];

    result[key] = value.length > 1 ? value : value[0];
  }

  return result;
};

},{}],21:[function(require,module,exports){
'use strict';

// https://regex101.com/r/Bxq7dZ/2

const MS_TIME_REGEX = new RegExp(/^(\d{4})-(\d{2})-(\d{2})\s(\d{2}):(\d{2}):(\d{2})(?:\.(\d{3}))?$/);

/**
 * Преобразует строку времени МойСклад в объект даты (с учетом временной зоны)
 * @param {string} timeString Время в формате МойСклад ("2017-04-08 13:33:00.123")
 * @returns {Date} Дата
 */
module.exports = function parseTimeString(timeString) {
  // 2017-04-08 13:33:00.123
  let m = MS_TIME_REGEX.exec(timeString);
  if (!m || m.length < 7 || m.length > 8) {
    throw new Error(`Некорректный формат даты "${timeString}"`);
  }
  return new Date(`${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}${m[7] ? '.' + m[7] : ''}+03:00`);
};

},{}],22:[function(require,module,exports){
'use strict'

/* eslint node/no-deprecated-api:0 */

var encode

if (typeof btoa !== 'undefined') {
  // browser
  encode = function (value) { return btoa(value) }
} else if (typeof process !== 'undefined' && process.version) {
  // node
  let nodeVersion = Number(process.version.match(/^v(\d+\.\d+)/)[1])
  encode = nodeVersion < 4.5
    ? function (value) { return new Buffer(value).toString('base64') }
    : function (value) { return Buffer.from(value).toString('base64') }
} else {
  // unknown context
  throw new Error('base64encode: Can\'t determine environment')
}

module.exports = function base64encode (value) {
  return encode(String(value))
}

},{}],23:[function(require,module,exports){
'use strict'

var ARR_RX = /^(.+) a(rr(ay)?)?$/i
var OR_RX = /^(.+) or (.+)$/i
var OPT_RX = /^opt(ional)? (.+)$/i

var isArray = function (value) { return Array.isArray(value) }
var isObject = function (value) { return value != null && typeof value === 'object' }
var isPlainObject = function (value) {
  return Object.prototype.toString.call(value) === '[object Object]'
}
var isArguments = function (value) {
  return isObject(value) && value.hasOwnProperty('callee') && !value.propertyIsEnumerable('callee')
}

var BUILT_IN_MATCHERS = {
  // string
  'string': function (value) {
    return typeof value === 'string'
  },
  's|str': 'string',

  // number
  'number': function (value) {
    return typeof value === 'number'
  },
  'n|num': 'number',

  // boolean
  'boolean': function (value) {
    return typeof value === 'boolean'
  },
  'b|bool': 'boolean',

  // function
  'function': function (value) {
    return typeof value === 'function'
  },
  'f|fun|func': 'function',

  // array
  'array': isArray,
  'a|arr': 'array',

  // object
  'object': isObject,
  'o|obj': 'object',

  // regexp
  'regexp': function (value) {
    return value && value instanceof RegExp
  },
  'r|rx|regex': 'regexp',

  // date
  'date': function (value) {
    return value && value instanceof Date
  },
  'd': 'date',

  // Object
  'Object': isPlainObject,
  'Obj': 'Object'
}
// TODO Add "any" matcher


var customAssert = function (test, msg) {
  if (!test) {
    if (msg === void 0) throw new Error(test + ' == true')
    else throw new Error(msg)
  }
}

var HAVE_ARGUMENTS_OBJECT = '@@have/argumentsObject'
var HAVE_DEFAULT_MATCHER = '@@have/defaultMatcher'
var ARGUMENTS_OBJECT_MATCHER = {}
var DEFAULT_MATCHER = {}
ARGUMENTS_OBJECT_MATCHER[HAVE_ARGUMENTS_OBJECT] = 'Object'
DEFAULT_MATCHER[HAVE_DEFAULT_MATCHER] = function () { return false }

// Object assign
function assign () {
  var args = Array.prototype.slice.call(arguments, 0)
  var target = args[0]
  var source = args.slice(1)
  var i, len, p

  for (i = 0, len = source.length; i < len; i++) {
    for (p in source[i]) {
      if (source[i].hasOwnProperty(p)) {
        target[p] = source[i][p]
      }
    }
  }
  return target
}

// { 's|str': val1 } -> { 's': val1, 'str': val1 }
function unfoldMatchers (matchers) {
  var unfolded = {}
  var variants, p, i, len

  for (p in matchers) {
    if (matchers.hasOwnProperty(p)) {
      variants = p.split(/\|/)
      for (i = 0, len = variants.length; i < len; i++) {
        unfolded[variants[i]] = matchers[p]
      }
    }
  }
  return unfolded
}

// core recursive check
function ensure (matchers, argName, argType, value, check) {
  var memberType = null
  var valid = true
  var reason = null
  var match = null
  var typeValidator = null
  var i = 0

  function softAssert (cond, reason_) {
    if (!(valid = cond)) reason = reason_
  }

  match = argType.match(OPT_RX)
  if (match) {
    memberType = match[2]
    ensure(matchers, argName, memberType, value, softAssert)
    return valid || value === null || value === void 0
  }

  match = argType.match(OR_RX)
  if (match) {
    memberType = match[1]
    ensure(matchers, argName, memberType, value, softAssert)
    if (valid) return true
    valid = true // reset previous softAssert

    memberType = match[2]
    ensure(matchers, argName, memberType, value, softAssert)
    check(valid, '`' + argName + '` is neither a ' + match[1] + ' nor ' + match[2])
    return true
  }

  match = argType.match(ARR_RX)
  if (match) {
    ensure(matchers, argName, 'array', value, softAssert)
    if (!valid) {
      check(false, reason)
      return false
    }
    memberType = match[1]
    for (i = 0; i < value.length; i++) {
      ensure(matchers, argName, memberType, value[i], softAssert)
      if (!valid) {
        check(false, '`' + argName + '` element is falsy or not a ' + memberType)
        return false
      }
    }
    return true
  }

  typeValidator = (function getValidator (t) {
    var validator = null
    argType = t
    if (matchers.hasOwnProperty(t)) validator = matchers[t]
    return typeof validator === 'string' ? getValidator(validator) : validator
  })(argType)

  valid = typeValidator ? typeValidator(value) : matchers[HAVE_DEFAULT_MATCHER](value)

  check(valid, '`' + argName + '` is not ' + argType)
  return true
}

function ensureArgs (args, schema, matchers, strict) {
  var ensureResults = []
  var parsedArgs = {}
  var argIndex = 0
  var argsKeys = []
  var fail = null
  var p, i, len, argName, ensured, argStr

  // have schema check
  if (schema instanceof Array) {
    if (!schema.length) { throw new Error('have() called with empty schema list') }

    for (i = 0, len = schema.length; i < len; i++) {
      ensureResults[i] = ensureArgs(args, schema[i], matchers, strict)
    }

    ensureResults.sort(function (a, b) {
      if (a.argIndex > b.argIndex) return -1
      if (a.argIndex < b.argIndex) return 1
      return 0
    })

    for (i = 0; i < ensureResults.length; i++) {
      if (!ensureResults[i].fail) return ensureResults[i]
    }

    return ensureResults[0]
  } else if (isPlainObject(schema)) {
    // have `arguments` check
    if (isArguments(args) || isArray(args)) {
      for (i = 0, len = args.length; i < len; i++) { argsKeys[i] = i }
    } else if (isPlainObject(args)) {
      i = 0
      for (p in args) {
        if (args.hasOwnProperty(p)) { argsKeys[i++] = p }
      }
    } else {
      throw new Error('have() `arguments` argument should be function arguments, array or object')
    }

    for (argName in schema) {
      if (schema.hasOwnProperty(argName)) {
        ensured = ensure(matchers, argName, schema[argName], args[argsKeys[argIndex]],
          function (cond, fail_) { if (!cond) fail = fail_ })
        if (fail) break
        if (ensured) {
          parsedArgs[argName] = args[argsKeys[argIndex]]
          argIndex++
        }
      }
    }

    if (strict && !fail && argIndex < argsKeys.length) {
      if (typeof argsKeys[argIndex] === 'string') {
        fail = 'Unexpected `' + argsKeys[argIndex] + '` argument'
      } else {
        argStr = '' + args[argsKeys[argIndex]]
        fail = 'Unexpected argument "' + (argStr.length > 15
            ? argStr.substring(0, 15) + '..'
            : argStr) + '"'
      }
    }

    return { fail: fail, parsedArgs: parsedArgs, argIndex: argIndex }
  } else {
    throw new Error('have() `schema` should be an array or an object')
  }
}

// have.js - Main have.js exports
module.exports = (function () {
  var assert = customAssert

  function have (args, schema, strict) {
    var res = ensureArgs(args, schema, this.matchers, strict)
    if (HAVE_ARGUMENTS_OBJECT in res.parsedArgs) {
      return have.call(this, res.parsedArgs[HAVE_ARGUMENTS_OBJECT], schema, strict)
    }
    assert(!res.fail, res.fail)
    return res.parsedArgs
  }

  have.assert = function (assert_) {
    return (assert_ === void 0) ? assert : (assert = assert_)
  }

  have.strict = function (args, schema) {
    return this(args, schema, true)
  }

  have.matchers = assign({}, ARGUMENTS_OBJECT_MATCHER, DEFAULT_MATCHER)

  have.argumentsObject = ARGUMENTS_OBJECT_MATCHER

  have.with = function (matchers) {
    var _have = function () { return have.apply(_have, arguments) } // TODO Test

    if (!isPlainObject(matchers)) {
      throw new Error('`checkers` argument must to be an object')
    }

    return assign(_have, {
      assert: have.assert,
      strict: have.strict.bind(_have),
      with: have.with,
      matchers: assign({}, unfoldMatchers(this.matchers), unfoldMatchers(matchers)),
      argumentsObject: have.argumentsObject
    })
  }

  return have.with(BUILT_IN_MATCHERS)
})()


},{}],24:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

/**
 * The 'src' argument plays the command role.
 * The returned values is always of the same type as the 'src'.
 * @param dst
 * @param src
 * @returns {*}
 */
function mergeOne(dst, src) {
  if (src === undefined) { return dst; }

  // According to specification arrays must be concatenated.
  // Also, the '.concat' creates a new array instance. Overrides the 'dst'.
  if (isArray(src)) { return (isArray(dst) ? dst : []).concat(src); }

  // Now deal with non plain 'src' object. 'src' overrides 'dst'
  // Note that functions are also assigned! We do not deep merge functions.
  if (!isPlainObject(src)) { return src; }

  // See if 'dst' is allowed to be mutated. If not - it's overridden with a new plain object.
  var returnValue = isObject(dst) ? dst : {};

  var keys = Object.keys(src);
  for (var i = 0; i < keys.length; i += 1) {
    var key = keys[i];

    var srcValue = src[key];
    // Do not merge properties with the 'undefined' value.
    if (srcValue !== undefined) {
      var dstValue = returnValue[key];
      // Recursive calls to mergeOne() must allow only plain objects or arrays in dst
      var newDst = isPlainObject(dstValue) || isArray(srcValue) ? dstValue : {};

      // deep merge each property. Recursion!
      returnValue[key] = mergeOne(newDst, srcValue);
    }
  }

  return returnValue;
}

var merge = function (dst) {
  var srcs = [], len = arguments.length - 1;
  while ( len-- > 0 ) srcs[ len ] = arguments[ len + 1 ];

  return srcs.reduce(mergeOne, dst);
};

function isFunction(obj) {
  return typeof obj === 'function';
}

function isObject(obj) {
  var type = typeof obj;
  return !!obj && (type === 'object' || type === 'function');
}

var assign = Object.assign;
var isArray = Array.isArray;

function isPlainObject(value) {
  return !!value && typeof value === 'object' &&
    Object.getPrototypeOf(value) === Object.prototype;
}


var concat = Array.prototype.concat;
function extractFunctions() {
  var fns = concat.apply([], arguments).filter(isFunction);
  return fns.length === 0 ? undefined : fns;
}

function concatAssignFunctions(dstObject, srcArray, propName) {
  if (!isArray(srcArray)) { return; }

  var length = srcArray.length;
  var dstArray = dstObject[propName] || [];
  dstObject[propName] = dstArray;
  for (var i = 0; i < length; i += 1) {
    var fn = srcArray[i];
    if (isFunction(fn) && dstArray.indexOf(fn) < 0) {
      dstArray.push(fn);
    }
  }
}


function combineProperties(dstObject, srcObject, propName, action) {
  if (!isObject(srcObject[propName])) { return; }
  if (!isObject(dstObject[propName])) { dstObject[propName] = {}; }
  action(dstObject[propName], srcObject[propName]);
}

function deepMergeAssign(dstObject, srcObject, propName) {
  combineProperties(dstObject, srcObject, propName, merge);
}
function mergeAssign(dstObject, srcObject, propName) {
  combineProperties(dstObject, srcObject, propName, assign);
}

/**
 * Converts stampit extended descriptor to a standard one.
 * @param [methods]
 * @param [properties]
 * @param [props]
 * @param [refs]
 * @param [initializers]
 * @param [init]
 * @param [deepProperties]
 * @param [deepProps]
 * @param [propertyDescriptors]
 * @param [staticProperties]
 * @param [statics]
 * @param [staticDeepProperties]
 * @param [deepStatics]
 * @param [staticPropertyDescriptors]
 * @param [configuration]
 * @param [conf]
 * @param [deepConfiguration]
 * @param [deepConf]
 * @param [composers]
 * @returns {Descriptor}
 */
var standardiseDescriptor = function (ref) {
  if ( ref === void 0 ) ref = {};
  var methods = ref.methods;
  var properties = ref.properties;
  var props = ref.props;
  var refs = ref.refs;
  var initializers = ref.initializers;
  var init = ref.init;
  var composers = ref.composers;
  var deepProperties = ref.deepProperties;
  var deepProps = ref.deepProps;
  var propertyDescriptors = ref.propertyDescriptors;
  var staticProperties = ref.staticProperties;
  var statics = ref.statics;
  var staticDeepProperties = ref.staticDeepProperties;
  var deepStatics = ref.deepStatics;
  var staticPropertyDescriptors = ref.staticPropertyDescriptors;
  var configuration = ref.configuration;
  var conf = ref.conf;
  var deepConfiguration = ref.deepConfiguration;
  var deepConf = ref.deepConf;

  var p = isObject(props) || isObject(refs) || isObject(properties) ?
    assign({}, props, refs, properties) : undefined;

  var dp = isObject(deepProps) ? merge({}, deepProps) : undefined;
  dp = isObject(deepProperties) ? merge(dp, deepProperties) : dp;

  var sp = isObject(statics) || isObject(staticProperties) ?
    assign({}, statics, staticProperties) : undefined;

  var dsp = isObject(deepStatics) ? merge({}, deepStatics) : undefined;
  dsp = isObject(staticDeepProperties) ? merge(dsp, staticDeepProperties) : dsp;

  var c = isObject(conf) || isObject(configuration) ?
    assign({}, conf, configuration) : undefined;

  var dc = isObject(deepConf) ? merge({}, deepConf) : undefined;
  dc = isObject(deepConfiguration) ? merge(dc, deepConfiguration) : dc;

  var ii = extractFunctions(init, initializers);

  var composerFunctions = extractFunctions(composers);
  if (composerFunctions) {
    dc = dc || {};
    concatAssignFunctions(dc, composerFunctions, 'composers');
  }

  var descriptor = {};
  if (methods) { descriptor.methods = methods; }
  if (p) { descriptor.properties = p; }
  if (ii) { descriptor.initializers = ii; }
  if (dp) { descriptor.deepProperties = dp; }
  if (sp) { descriptor.staticProperties = sp; }
  if (methods) { descriptor.methods = methods; }
  if (dsp) { descriptor.staticDeepProperties = dsp; }
  if (propertyDescriptors) { descriptor.propertyDescriptors = propertyDescriptors; }
  if (staticPropertyDescriptors) { descriptor.staticPropertyDescriptors = staticPropertyDescriptors; }
  if (c) { descriptor.configuration = c; }
  if (dc) { descriptor.deepConfiguration = dc; }

  return descriptor;
};

/**
 * Creates new factory instance.
 * @param {Descriptor} descriptor The information about the object the factory will be creating.
 * @returns {Function} The new factory function.
 */
function createFactory(descriptor) {
  return function Stamp(options) {
    var args = [], len = arguments.length - 1;
    while ( len-- > 0 ) args[ len ] = arguments[ len + 1 ];

    // Next line was optimized for most JS VMs. Please, be careful here!
    var obj = Object.create(descriptor.methods || null);

    merge(obj, descriptor.deepProperties);
    assign(obj, descriptor.properties);
    Object.defineProperties(obj, descriptor.propertyDescriptors || {});

    if (!descriptor.initializers || descriptor.initializers.length === 0) { return obj; }

    if (options === undefined) { options = {}; }
    var inits = descriptor.initializers;
    var length = inits.length;
    for (var i = 0; i < length; i += 1) {
      var initializer = inits[i];
      if (isFunction(initializer)) {
        var returnedValue = initializer.call(obj, options,
          {instance: obj, stamp: Stamp, args: [options].concat(args)});
        obj = returnedValue === undefined ? obj : returnedValue;
      }
    }

    return obj;
  };
}

/**
 * Returns a new stamp given a descriptor and a compose function implementation.
 * @param {Descriptor} [descriptor={}] The information about the object the stamp will be creating.
 * @param {Compose} composeFunction The "compose" function implementation.
 * @returns {Stamp}
 */
function createStamp(descriptor, composeFunction) {
  var Stamp = createFactory(descriptor);

  merge(Stamp, descriptor.staticDeepProperties);
  assign(Stamp, descriptor.staticProperties);
  Object.defineProperties(Stamp, descriptor.staticPropertyDescriptors || {});

  var composeImplementation = isFunction(Stamp.compose) ? Stamp.compose : composeFunction;
  Stamp.compose = function _compose() {
    var args = [], len = arguments.length;
    while ( len-- ) args[ len ] = arguments[ len ];

    return composeImplementation.apply(this, args);
  };
  assign(Stamp.compose, descriptor);

  return Stamp;
}

/**
 * Mutates the dstDescriptor by merging the srcComposable data into it.
 * @param {Descriptor} dstDescriptor The descriptor object to merge into.
 * @param {Composable} [srcComposable] The composable
 * (either descriptor or stamp) to merge data form.
 * @returns {Descriptor} Returns the dstDescriptor argument.
 */
function mergeComposable(dstDescriptor, srcComposable) {
  var srcDescriptor = (srcComposable && srcComposable.compose) || srcComposable;
  if (!isObject(srcDescriptor)) { return dstDescriptor; }

  mergeAssign(dstDescriptor, srcDescriptor, 'methods');
  mergeAssign(dstDescriptor, srcDescriptor, 'properties');
  deepMergeAssign(dstDescriptor, srcDescriptor, 'deepProperties');
  mergeAssign(dstDescriptor, srcDescriptor, 'propertyDescriptors');
  mergeAssign(dstDescriptor, srcDescriptor, 'staticProperties');
  deepMergeAssign(dstDescriptor, srcDescriptor, 'staticDeepProperties');
  mergeAssign(dstDescriptor, srcDescriptor, 'staticPropertyDescriptors');
  mergeAssign(dstDescriptor, srcDescriptor, 'configuration');
  deepMergeAssign(dstDescriptor, srcDescriptor, 'deepConfiguration');
  concatAssignFunctions(dstDescriptor, srcDescriptor.initializers, 'initializers');

  return dstDescriptor;
}

/**
 * Given the list of composables (stamp descriptors and stamps) returns
 * a new stamp (composable factory function).
 * @typedef {Function} Compose
 * @param {...(Composable)} [composables] The list of composables.
 * @returns {Stamp} A new stamp (aka composable factory function)
 */
function compose() {
  var composables = [], len = arguments.length;
  while ( len-- ) composables[ len ] = arguments[ len ];

  var descriptor = [this]
    .concat(composables)
    .filter(isObject)
    .reduce(mergeComposable, {});
  return createStamp(descriptor, compose);
}


/**
 * The Stamp Descriptor
 * @typedef {Function|Object} Descriptor
 * @returns {Stamp} A new stamp based on this Stamp
 * @property {Object} [methods] Methods or other data used as object instances' prototype
 * @property {Array<Function>} [initializers] List of initializers called for each object instance
 * @property {Object} [properties] Shallow assigned properties of object instances
 * @property {Object} [deepProperties] Deeply merged properties of object instances
 * @property {Object} [staticProperties] Shallow assigned properties of Stamps
 * @property {Object} [staticDeepProperties] Deeply merged properties of Stamps
 * @property {Object} [configuration] Shallow assigned properties of Stamp arbitrary metadata
 * @property {Object} [deepConfiguration] Deeply merged properties of Stamp arbitrary metadata
 * @property {Object} [propertyDescriptors] ES5 Property Descriptors applied to object instances
 * @property {Object} [staticPropertyDescriptors] ES5 Property Descriptors applied to Stamps
 */

/**
 * The Stamp factory function
 * @typedef {Function} Stamp
 * @returns {*} Instantiated object
 * @property {Descriptor} compose - The Stamp descriptor and composition function
 */

/**
 * A composable object - stamp or descriptor
 * @typedef {Stamp|Descriptor} Composable
 */

/**
 * Returns true if argument is a stamp.
 * @param {*} obj
 * @returns {Boolean}
 */
function isStamp(obj) {
  return isFunction(obj) && isFunction(obj.compose);
}

function createUtilityFunction(propName, action) {
  return function composeUtil() {
    var i = arguments.length, argsArray = Array(i);
    while ( i-- ) argsArray[i] = arguments[i];

    return ((this && this.compose) || stampit).call(this, ( obj = {}, obj[propName] = action.apply(void 0, [ {} ].concat( argsArray )), obj ));
    var obj;
  };
}

var methods = createUtilityFunction('methods', assign);

var properties = createUtilityFunction('properties', assign);
function initializers() {
  var args = [], len = arguments.length;
  while ( len-- ) args[ len ] = arguments[ len ];

  return ((this && this.compose) || stampit).call(this, {
    initializers: extractFunctions.apply(void 0, args)
  });
}
function composers() {
  var args = [], len = arguments.length;
  while ( len-- ) args[ len ] = arguments[ len ];

  return ((this && this.compose) || stampit).call(this, {
    composers: extractFunctions.apply(void 0, args)
  });
}

var deepProperties = createUtilityFunction('deepProperties', merge);
var staticProperties = createUtilityFunction('staticProperties', assign);
var staticDeepProperties = createUtilityFunction('staticDeepProperties', merge);
var configuration = createUtilityFunction('configuration', assign);
var deepConfiguration = createUtilityFunction('deepConfiguration', merge);
var propertyDescriptors = createUtilityFunction('propertyDescriptors', assign);

var staticPropertyDescriptors = createUtilityFunction('staticPropertyDescriptors', assign);

var allUtilities = {
  methods: methods,

  properties: properties,
  refs: properties,
  props: properties,

  initializers: initializers,
  init: initializers,

  composers: composers,

  deepProperties: deepProperties,
  deepProps: deepProperties,

  staticProperties: staticProperties,
  statics: staticProperties,

  staticDeepProperties: staticDeepProperties,
  deepStatics: staticDeepProperties,

  configuration: configuration,
  conf: configuration,

  deepConfiguration: deepConfiguration,
  deepConf: deepConfiguration,

  propertyDescriptors: propertyDescriptors,

  staticPropertyDescriptors: staticPropertyDescriptors
};

/**
 * Infected stamp. Used as a storage of the infection metadata
 * @type {Function}
 * @return {Stamp}
 */
var baseStampit = compose(
  {staticProperties: allUtilities},
  {
    staticProperties: {
      create: function create() {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        return this.apply(void 0, args);
      },
      compose: stampit // infecting
    }
  }
);

/**
 * Infected compose
 * @param {...(Composable)} [args] The list of composables.
 * @return {Stamp}
 */
function stampit() {
  var args = [], len = arguments.length;
  while ( len-- ) args[ len ] = arguments[ len ];

  var composables = args.filter(isObject)
    .map(function (arg) { return isStamp(arg) ? arg : standardiseDescriptor(arg); });

  // Calling the standard pure compose function here.
  var stamp = compose.apply(this || baseStampit, composables);

  var composerFunctions = stamp.compose.deepConfiguration &&
    stamp.compose.deepConfiguration.composers;
  if (isArray(composerFunctions) && composerFunctions.length > 0) {
    var uniqueComposers = [];
    for (var i = 0; i < composerFunctions.length; i += 1) {
      var composer = composerFunctions[i];
      if (isFunction(composer) && uniqueComposers.indexOf(composer) < 0) {
        uniqueComposers.push(composer);
      }
    }
    stamp.compose.deepConfiguration.composers = uniqueComposers;

    if (isStamp(this)) { composables.unshift(this); }
    for (var i$1 = 0; i$1 < uniqueComposers.length; i$1 += 1) {
      var composer$1 = uniqueComposers[i$1];
      var returnedValue = composer$1({stamp: stamp, composables: composables});
      stamp = isStamp(returnedValue) ? returnedValue : stamp;
    }
  }

  return stamp;
}

var exportedCompose = stampit.bind(); // bind to 'undefined'
stampit.compose = exportedCompose;

// Setting up the shortcut functions
var stampit$1 = assign(stampit, allUtilities);

exports.methods = methods;
exports.properties = properties;
exports.refs = properties;
exports.props = properties;
exports.initializers = initializers;
exports.init = initializers;
exports.composers = composers;
exports.deepProperties = deepProperties;
exports.deepProps = deepProperties;
exports.staticProperties = staticProperties;
exports.statics = staticProperties;
exports.staticDeepProperties = staticDeepProperties;
exports.deepStatics = staticDeepProperties;
exports.configuration = configuration;
exports.conf = configuration;
exports.deepConfiguration = deepConfiguration;
exports.deepConf = deepConfiguration;
exports.propertyDescriptors = propertyDescriptors;
exports.staticPropertyDescriptors = staticPropertyDescriptors;
exports.compose = exportedCompose;
exports['default'] = stampit$1;
module.exports = exports['default'];


},{}]},{},[4])(4)
});