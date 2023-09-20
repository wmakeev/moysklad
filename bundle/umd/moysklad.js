/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 52:
/***/ ((module) => {

"use strict";


let encode

// node
if (typeof process !== 'undefined' && process.version) {
  encode = function (value) {
    return Buffer.from(value).toString('base64')
  }
}

// browser
else if (typeof btoa !== 'undefined') {
  encode = function (value) {
    return btoa(value)
  }
}

// GAS
else if (typeof Utilities !== 'undefined' && Utilities.base64Encode) {
  encode = function (value) {
    return Utilities.base64Encode(value)
  }
}

// unknown context
else {
  throw new Error("base64encode: Can't determine environment")
}

module.exports = function base64encode(value) {
  return encode(String(value))
}


/***/ }),

/***/ 91:
/***/ ((module) => {

"use strict";


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



/***/ }),

/***/ 992:
/***/ ((module) => {

!function(){"use strict";var u,c,a,s,f,y="properties",l="deepProperties",b="propertyDescriptors",d="staticProperties",O="staticDeepProperties",h="staticPropertyDescriptors",g="configuration",m="deepConfiguration",P="deepProps",A="deepStatics",j="deepConf",v="initializers",_="methods",w="composers",D="compose";function S(r){return Object.getOwnPropertyNames(r).concat(Object.getOwnPropertySymbols?Object.getOwnPropertySymbols(r):[])}function r(r,t){return Array.prototype.slice.call(arguments,2).reduce(r,t)}var x=r.bind(0,function r(t,e){if(e)for(var n=S(e),o=0;o<n.length;o+=1)Object.defineProperty(t,n[o],Object.getOwnPropertyDescriptor(e,n[o]));return t});function C(r){return"function"==typeof r}function N(r){return r&&"object"==typeof r||C(r)}function z(r){return r&&"object"==typeof r&&r.__proto__==Object.prototype}var E=r.bind(0,function r(t,e){if(e===u)return t;if(Array.isArray(e))return(Array.isArray(t)?t:[]).concat(e);if(!z(e))return e;for(var n,o,i=S(e),p=0;p<i.length;)n=i[p++],(o=Object.getOwnPropertyDescriptor(e,n)).hasOwnProperty("value")?o.value!==u&&(t[n]=r(z(t[n])||Array.isArray(e[n])?t[n]:{},e[n])):Object.defineProperty(t,n,o);return t});function I(){return(c=Array.prototype.concat.apply([],arguments).filter(function(r,t,e){return C(r)&&e.indexOf(r)===t})).length?c:u}function t(r){return c=function r(){return function r(t){var e,n,o=r[D]||{},i={__proto__:o[_]},p=o[v],c=Array.prototype.slice.apply(arguments),a=o[l];if(a&&E(i,a),(a=o[y])&&x(i,a),(a=o[b])&&Object.defineProperties(i,a),!p||!p.length)return i;for(t===u&&(t={}),o=0;o<p.length;)C(e=p[o++])&&(i=(n=e.call(i,t,{instance:i,stamp:r,args:c}))===u?i:n);return i}}(),(a=r[O])&&E(c,a),(a=r[d])&&x(c,a),(a=r[h])&&Object.defineProperties(c,a),a=C(c[D])?c[D]:R,x(c[D]=function(){return a.apply(this,arguments)},r),c}function e(e,n){function r(r,t){N(n[r])&&(N(e[r])||(e[r]={}),(t||x)(e[r],n[r]))}function t(r){(c=I(e[r],n[r]))&&(e[r]=c)}return n&&N(n=n[D]||n)&&(r(_),r(y),r(l,E),r(b),r(d),r(O,E),r(h),r(g),r(m,E),t(v),t(w)),e}function R(){return t(Array.prototype.concat.apply([this],arguments).reduce(e,{}))}function V(r){return C(r)&&C(r[D])}var n={};function o(r,t){return function(){return(s={})[r]=t.apply(u,Array.prototype.concat.apply([{}],arguments)),((c=this)&&c[D]||a).call(c,s)}}n[_]=o(_,x),n[y]=n.props=o(y,x),n[v]=n.init=o(v,I),n[w]=o(w,I),n[l]=n[P]=o(l,E),n[d]=n.statics=o(d,x),n[O]=n[A]=o(O,E),n[g]=n.conf=o(g,x),n[m]=n[j]=o(m,E),n[b]=o(b,x),n[h]=o(h,x),a=n[D]=x(function r(){for(var t,e,n=0,o=[],i=arguments,p=this;n<i.length;)N(t=i[n++])&&o.push(V(t)?t:((s={})[_]=(e=t)[_]||u,a=e.props,s[y]=N((c=e[y])||a)?x({},a,c):u,s[v]=I(e.init,e[v]),s[w]=I(e[w]),a=e[P],s[l]=N((c=e[l])||a)?E({},a,c):u,s[b]=e[b],a=e.statics,s[d]=N((c=e[d])||a)?x({},a,c):u,a=e[A],s[O]=N((c=e[O])||a)?E({},a,c):u,c=e[h],s[h]=N((a=e.name&&{name:{value:e.name}})||c)?x({},c,a):u,a=e.conf,s[g]=N((c=e[g])||a)?x({},a,c):u,a=e[j],s[m]=N((c=e[m])||a)?E({},a,c):u,s));if(t=R.apply(p||f,o),p&&o.unshift(p),Array.isArray(i=t[D][w]))for(n=0;n<i.length;)t=V(p=i[n++]({stamp:t,composables:o}))?p:t;return t},n),n.create=function(){return this.apply(u,arguments)},(s={})[d]=n,f=R(s),a[D]=a.bind(),a.version="4.3.2",typeof u!="object"?module.exports=a:self.stampit=a}();

/***/ }),

/***/ 658:
/***/ ((module) => {

"use strict";


class MoyskladError extends Error {
  constructor(message, ...args) {
    super(message, ...args)
    this.name = this.constructor.name
    /* c8 ignore else  */
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }
  }
}

class MoyskladRequestError extends MoyskladError {
  constructor(message, response) {
    super(message)

    if (response) {
      this.url = response.url
      this.status = response.status
      this.statusText = response.statusText
    }
  }
}

class MoyskladUnexpectedRedirectError extends MoyskladRequestError {
  constructor(response) {
    super(
      `Неожиданное перенаправление запроса с кодом ${response.status}` +
        ' (см. подробнее https://github.com/wmakeev/moysklad#moyskladunexpectedredirecterror)',
      response
    )

    const location = response.headers.get('location')

    if (response) {
      this.url = response.url
      this.status = response.status
      this.statusText = response.statusText
      this.location = location
    }
  }
}

class MoyskladApiError extends MoyskladRequestError {
  constructor(errors, response) {
    const error = errors[0]
    /* c8 ignore next */
    const message = error.error + (error.moreInfo ? ` (${error.moreInfo})` : '')

    super(message, response)

    this.code = error.code
    this.moreInfo = error.moreInfo
    if (error.line != null) this.line = error.line
    if (error.column != null) this.column = error.column
    this.errors = errors
  }
}

class MoyskladCollectionError extends MoyskladApiError {
  constructor(errors, errorsIndexes, response) {
    super(errors, response)
    this.errorsIndexes = errorsIndexes
  }
}

module.exports = {
  MoyskladError,
  MoyskladRequestError,
  MoyskladUnexpectedRedirectError,
  MoyskladApiError,
  MoyskladCollectionError
}


/***/ }),

/***/ 112:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


const getEnvVar = __webpack_require__(489)

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


/***/ }),

/***/ 489:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


/* global window */

/**
 * Получить значение переменной окружения
 * @param {string} key Наименоване переменной окружения
 * @param {string} defaultValue Наименоване переменной окружения
 * @returns {string | null} Значение переменной окружения
 */
function getEnvVar(key, defaultValue) {
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key]
  } else if (typeof window !== 'undefined' && window[key]) {
    return window[key]
  } else if (typeof __webpack_require__.g !== 'undefined' && __webpack_require__.g[key]) {
    return __webpack_require__.g[key]
  } else {
    return defaultValue !== undefined ? defaultValue : null
  }
}

module.exports = getEnvVar


/***/ }),

/***/ 418:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


const { MoyskladApiError, MoyskladCollectionError } = __webpack_require__(658)

module.exports = function getResponseError(responseBody, response) {
  if (!responseBody) return null

  if (Array.isArray(responseBody)) {
    const errorsIndexes = responseBody
      .map((item, index) => {
        if (item.errors) {
          return [index, item.errors]
        } else {
          return null
        }
      })
      .filter(item => item !== null)

    if (errorsIndexes.length === 0) return null

    const errors = errorsIndexes
      .map(errItem => errItem[1])
      .reduce((res, errors) => res.concat(errors), [])

    return new MoyskladCollectionError(errors, errorsIndexes, response)
  } else if (responseBody.errors) {
    return new MoyskladApiError(responseBody.errors, response)
  }

  return null
}


/***/ }),

/***/ 83:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


const have = __webpack_require__(91)
const matchers = __webpack_require__(823)

module.exports = have.with(matchers)


/***/ }),

/***/ 138:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/*
 * moysklad
 * Клиент для JSON API МойСклад
 *
 * Copyright (c) 2017, Vitaliy V. Makeev
 * Licensed under MIT.
 */



const stampit = __webpack_require__(992)

const have = __webpack_require__(83)
const getApiDefaultVersion = __webpack_require__(112)
const { version } = __webpack_require__(345)

// methods
const getTimeString = __webpack_require__(9)
const parseTimeString = __webpack_require__(562)
const buildFilter = __webpack_require__(656)
const buildQuery = __webpack_require__(467)
const getEnvVar = __webpack_require__(489)
const getAuthHeader = __webpack_require__(706)
const buildUrl = __webpack_require__(831)
const parseUrl = __webpack_require__(60)
const fetchUrl = __webpack_require__(579)
const GET = __webpack_require__(573)
const POST = __webpack_require__(397)
const PUT = __webpack_require__(874)
const DELETE = __webpack_require__(200)

// errors
const {
  MoyskladApiError,
  MoyskladError,
  MoyskladRequestError,
  MoyskladCollectionError,
  MoyskladUnexpectedRedirectError
} = __webpack_require__(658)

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
    getTimeString,
    parseTimeString,
    parseUrl,
    buildFilter,
    buildQuery,
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


/***/ }),

/***/ 823:
/***/ ((module) => {

"use strict";


const UUID_REGEX =
  /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/

const urlMatcher = url =>
  typeof url === 'string' && url.substring(0, 8) === 'https://'

const uuidMatcher = uuid => typeof uuid === 'string' && UUID_REGEX.test(uuid)

// TODO Убедиться что указан необходимый минимум полей для сущностей
module.exports = {
  'entity': ent =>
    !!(ent && ent.id && uuidMatcher(ent.id) && ent.meta && ent.meta.type),

  'uuid': uuidMatcher,

  'url': urlMatcher,

  // 'uuid/uuid': id => {
  //   if (typeof id !== 'string') { return false }
  //   let [dicId, entId] = id.split('/')
  //   return UUID_REGEX.test(dicId) && UUID_REGEX.test(entId)
  // },

  'Moysklad.Collection': col =>
    !!(
      col &&
      col.meta &&
      col.meta.type &&
      urlMatcher(col.meta.href) &&
      typeof col.meta.size === 'number'
    )
}

// TODO Проверка типов "Moysklad." на основании модели


/***/ }),

/***/ 200:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


const have = __webpack_require__(83)

module.exports = function DELETE(...args) {
  const { path, options = {} } = have.strict(args, [
    { path: 'str or str arr', options: 'opt Object' },
    have.argumentsObject
  ])

  const url = this.buildUrl(path)

  return this.fetchUrl(url, { ...options, method: 'DELETE' })
}


/***/ }),

/***/ 573:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


const have = __webpack_require__(83)

module.exports = function GET(...args) {
  const {
    path,
    query,
    options = {}
  } = have.strict(args, [
    { path: 'str or str arr', query: 'opt Object', options: 'opt Object' },
    have.argumentsObject
  ])

  const url = this.buildUrl(path, query)

  return this.fetchUrl(url, { ...options, method: 'GET' })
}


/***/ }),

/***/ 397:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


const have = __webpack_require__(83)

module.exports = function POST(...args) {
  // TODO Test payload: 'Object or Object arr'
  const {
    path,
    payload,
    query,
    options = {}
  } = have.strict(args, [
    {
      path: 'str or str arr',
      payload: 'opt Object or Object arr or str',
      query: 'opt Object',
      options: 'opt Object'
    },
    have.argumentsObject
  ])

  const url = this.buildUrl(path, query)
  const fetchOptions = { method: 'POST' }

  if (payload) {
    fetchOptions.body =
      typeof payload === 'string' ? payload : JSON.stringify(payload)
  }

  return this.fetchUrl(url, { ...options, ...fetchOptions })
}


/***/ }),

/***/ 874:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


const have = __webpack_require__(83)

module.exports = function PUT(...args) {
  const {
    path,
    payload,
    query,
    options = {}
  } = have.strict(args, [
    {
      path: 'str or str arr',
      payload: 'opt Object or str',
      query: 'opt Object',
      options: 'opt Object'
    },
    have.argumentsObject
  ])

  const url = this.buildUrl(path, query)
  const fetchOptions = { method: 'PUT' }

  if (payload) {
    fetchOptions.body =
      typeof payload === 'string' ? payload : JSON.stringify(payload)
  }

  return this.fetchUrl(url, { ...options, ...fetchOptions })
}


/***/ }),

/***/ 831:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


const have = __webpack_require__(83)
const buildQuery = __webpack_require__(467)
const normalizeUrl = __webpack_require__(461)

let pathArrayDeprecationNoticeShown = false

module.exports = function buildUrl(...args) {
  // eslint-disable-next-line prefer-const
  let { url, path, query } = have.strict(args, [
    { url: 'url', query: 'opt Object' },
    { path: 'str or str arr', query: 'opt Object' },
    have.argumentsObject
  ])

  if (url) {
    const parsedUrl = this.parseUrl(url)
    path = parsedUrl.path.join('/')
    query = {
      ...parsedUrl.query,
      ...query
    }
  }

  if (Array.isArray(path)) {
    if (!pathArrayDeprecationNoticeShown) {
      console.log(
        '[DEPRECATED] moysklad#buildUrl: для передачи параметра path' +
          ' используйте строку вместо массива'
      )
      pathArrayDeprecationNoticeShown = true
    }

    path = path.join('/')
  }

  const { endpoint, api, apiVersion } = this.getOptions()

  let resultUrl = normalizeUrl(
    [endpoint, api, apiVersion].concat(path).join('/')
  )

  if (query) {
    const queryString = buildQuery(query)
    resultUrl = resultUrl + (queryString ? `?${queryString}` : '')
  }

  return resultUrl
}


/***/ }),

/***/ 579:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


const have = __webpack_require__(83)
const getResponseError = __webpack_require__(418)
const {
  MoyskladRequestError,
  MoyskladApiError,
  MoyskladCollectionError,
  MoyskladUnexpectedRedirectError
} = __webpack_require__(658)

let globalRequestId = 0

module.exports = async function fetchUrl(url, options = {}) {
  const requestId = ++globalRequestId

  have.strict(arguments, { url: 'url', options: 'opt Object' })

  let result, error

  // Специфические параметры (не передаются в опции fetch)
  let rawResponse = false
  let rawRedirect = false
  let muteApiErrors = false
  let muteCollectionErrors = false

  const emit = this.emitter ? this.emitter.emit.bind(this.emitter) : null

  const fetchOptions = {
    redirect: 'manual',
    ...options,
    headers: {
      'User-Agent': this.getOptions().userAgent,
      'Content-Type': 'application/json',
      'Accept-Encoding': 'gzip',
      ...options.headers
    }
  }

  if (!fetchOptions.headers.Authorization) {
    fetchOptions.credentials = 'include'
  }

  // получаем специфичные параметры
  if (fetchOptions.rawResponse) {
    rawResponse = true
    delete fetchOptions.rawResponse
  }
  if (fetchOptions.rawRedirect) {
    rawRedirect = true
    delete fetchOptions.rawRedirect
  }
  if (/* depricated */ fetchOptions.muteErrors) {
    muteApiErrors = true
    delete fetchOptions.muteErrors
  }
  if (fetchOptions.muteApiErrors) {
    muteApiErrors = true
    delete fetchOptions.muteApiErrors
  }
  if (fetchOptions.muteCollectionErrors) {
    muteCollectionErrors = true
    delete fetchOptions.muteCollectionErrors
  }

  // X-Lognex
  if (fetchOptions.precision) {
    fetchOptions.headers['X-Lognex-Precision'] = 'true'
    delete fetchOptions.precision
  }
  if (fetchOptions.webHookDisable) {
    fetchOptions.headers['X-Lognex-WebHook-Disable'] = 'true'
    delete fetchOptions.webHookDisable
  }
  if (fetchOptions.downloadExpirationSeconds) {
    fetchOptions.headers['X-Lognex-Download-Expiration-Seconds'] = String(
      fetchOptions.downloadExpirationSeconds
    )
    delete fetchOptions.downloadExpirationSeconds
  }

  const authHeader = this.getAuthHeader()
  if (authHeader) {
    fetchOptions.headers.Authorization = this.getAuthHeader()
  }

  if (emit) emit('request', { requestId, url, options: fetchOptions })

  /** @type {Response} */
  const response = await this.fetch(url, fetchOptions)

  if (emit)
    emit('response', { requestId, url, options: fetchOptions, response })

  if (rawResponse) return response

  if (response.status >= 300 && response.status < 400) {
    if (rawRedirect) {
      return response
    } else {
      throw new MoyskladUnexpectedRedirectError(response)
    }
  }

  // response.ok → response.status >= 200 && response.status < 300
  if (response.status < 200 || response.status >= 300) {
    error = new MoyskladRequestError(
      [response.status, response.statusText].filter(it => it).join(' '),
      response
    )
  }

  // разбираем тело запроса
  if (
    response.headers.has('Content-Type') &&
    response.headers.get('Content-Type').indexOf('application/json') !== -1
  ) {
    // response.json() может вызвать ошибку, если тело ответа пустое
    const resBodyText = await response.text()

    if (resBodyText) {
      result = JSON.parse(resBodyText)
    } else {
      result = undefined
    }

    error = getResponseError(result, response) || error
  }

  if (emit) {
    emit('response:body', {
      requestId,
      url,
      options: fetchOptions,
      response,
      body: result
    })
  }

  if (error) {
    if (error instanceof MoyskladApiError && muteApiErrors) {
      return result
    }

    if (error instanceof MoyskladCollectionError && muteCollectionErrors) {
      return result
    }

    if (emit) emit('error', error, { requestId })
    throw error
  }

  return result
}


/***/ }),

/***/ 706:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


const { MoyskladError } = __webpack_require__(658)

/* global MOYSKLAD_LOGIN, MOYSKLAD_PASSWORD */
/* eslint no-undef:0 no-unused-vars:0 */

const base64encode = __webpack_require__(52)

const getEnvVar = __webpack_require__(489)

const bearerAuth = token => `Bearer ${token}`
const basicAuth = (login, password) =>
  'Basic ' + base64encode(`${login}:${password}`)

module.exports = function getAuthHeader() {
  let token
  let login
  let password

  const options = this.getOptions()

  switch (true) {
    case options.token != null:
      token = options.token
      break

    case options.login != null:
      login = options.login
      password = options.password
      break

    case getEnvVar('MOYSKLAD_TOKEN') != null:
      token = getEnvVar('MOYSKLAD_TOKEN')
      break

    case getEnvVar('MOYSKLAD_LOGIN') != null:
      login = getEnvVar('MOYSKLAD_LOGIN')
      password = getEnvVar('MOYSKLAD_PASSWORD')
      break

    default:
      return undefined
  }

  if (token) {
    return bearerAuth(token)
  } else if (password) {
    return basicAuth(login, password)
  } else {
    throw new MoyskladError('Не указан пароль для доступа к API')
  }
}


/***/ }),

/***/ 60:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

'use srict'

const { MoyskladError } = __webpack_require__(658)
const have = __webpack_require__(83)
const normalizeUrl = __webpack_require__(461)
const parseQueryString = __webpack_require__(565)

// https://regex101.com/r/yQgvn4/4
const URL_REGEX = /^(https:\/\/.+\/api)\/(.+)\/(\d+\.\d+)\/([^?]+)(?:\?(.+))?$/

module.exports = function parseUrl(...args) {
  const { url, path } = have.strict(args, [
    { url: 'url' },
    { path: 'str or str arr' }
  ])

  const isCalledOnInstance = !!(this && this.getOptions)

  if (!url && !isCalledOnInstance) {
    throw new MoyskladError(
      'Для вызова статического метода parseUrl, необходимо передать url'
    )
  }

  let { endpoint, api, apiVersion } = isCalledOnInstance
    ? this.getOptions()
    : {}

  let pathStr = ''
  let queryStr = ''

  if (path instanceof Array) {
    pathStr = path.join('/')
  } else if (typeof path === 'string') {
    pathStr = path
  } else if (url) {
    const [, endpoint_, api_, version_, path_, query_] =
      URL_REGEX.exec(url) || []
    endpoint = endpoint_
    api = api_
    pathStr = path_
    apiVersion = version_
    queryStr = query_
  }

  if (!endpoint || !api || !apiVersion || !pathStr) {
    throw new MoyskladError(
      `parseUrl: Url не соответствует API МойСклад - ${url || path}`
    )
  }

  return {
    endpoint,
    api,
    apiVersion,
    path: normalizeUrl(pathStr).split(/\//g),
    query: parseQueryString(queryStr) || {}
  }
}


/***/ }),

/***/ 656:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


const { MoyskladError } = __webpack_require__(658)
const getTimeString = __webpack_require__(9)
const isPlainObject = __webpack_require__(226)
const isSimpleValue = __webpack_require__(981)

const createValueSelector = selector => (path, value) => {
  if (!isSimpleValue(value)) {
    throw new MoyskladError(
      'значение должно быть строкой, числом, датой или null'
    )
  }
  return [[path, selector, value]]
}

const createCollectionSelector = selector => {
  const sel = createValueSelector(selector)

  return (path, value) => {
    if (!(value instanceof Array)) {
      throw new MoyskladError(
        `значение селектора ${path.join('.')} должно быть массивом`
      )
    }

    return value.reduce((res, v) => res.concat(sel(path, v)), [])
  }
}

// Comparison selectors
const selectors = {
  eq: { operator: '=' },
  gt: { operator: '>' },
  gte: { operator: '>=' },
  lt: { operator: '<' },
  lte: { operator: '<=' },
  ne: { operator: '!=' },
  contains: { operator: '~' },
  st: { operator: '~=' },
  et: { operator: '=~' },
  in: { operator: '=', collection: true },
  nin: { operator: '!=', collection: true }
}

Object.keys(selectors).forEach(key => {
  selectors[key].name = `$${key}`
})

selectors.eq.not = selectors.ne
selectors.gt.not = selectors.lte
selectors.gte.not = selectors.lt
selectors.lt.not = selectors.gte
selectors.lte.not = selectors.gt
selectors.ne.not = selectors.eq
selectors.in.not = selectors.nin
selectors.nin.not = selectors.in

const comparisonSelectors = Object.keys(selectors).reduce((res, key) => {
  const op = selectors[key]
  res['$' + key] = (
    op.collection ? createCollectionSelector : createValueSelector
  )(op)
  return res
}, {})

// Logical selectors
const invertFilterPart = fp => {
  if (!fp[1].not) {
    throw new MoyskladError(
      `${fp[1].name} не поддерживает селектор отрицания $not`
    )
  }
  return [fp[0], fp[1].not, fp[2]]
}

function getFilterParts(path, value) {
  const pathLen = path.length
  const curKey = pathLen ? path[pathLen - 1] : null

  switch (true) {
    // Mongo logical selectors
    case curKey === '$all':
      if (!(value instanceof Array)) {
        throw new MoyskladError('$all: значение селектора должно быть массивом')
      }
      return value.reduce(
        (res, val) => res.concat(getFilterParts(path.slice(0, -1), val)),
        []
      )

    case curKey === '$not':
      if (!isPlainObject(value)) {
        throw new MoyskladError('$not: значение селектора должно быть объектом')
      }
      // .concat([[headPath, selectors.eq, null]])
      return getFilterParts(path.slice(0, -1), value).map(invertFilterPart)

    case curKey === '$exists':
      if (typeof value !== 'boolean') {
        throw new MoyskladError(
          '$exists: значение селектора должно быть логическим значением'
        )
      }
      return [[path.slice(0, -1), value ? selectors.ne : selectors.eq, null]]

    // Mongo comparison selectors
    case !!comparisonSelectors[curKey]:
      try {
        return comparisonSelectors[curKey](path.slice(0, -1), value)
      } catch (error) {
        throw new MoyskladError(`${curKey}: ${error.message}`)
      }

    // Unknown mongo selector
    case curKey && curKey.substr(0, 1) === '$' && path.length > 1:
      throw new MoyskladError(`Неизвестный селектор "${curKey}"`)

    // Array
    case value instanceof Array:
      return value.reduce(
        (res, val) => res.concat(getFilterParts(path, val)),
        []
      )

    // Object
    case !isSimpleValue(value):
      return Object.keys(value).reduce(
        (res, key) => res.concat(getFilterParts(path.concat(key), value[key])),
        []
      )

    // some other value
    default:
      return [[path, selectors.eq, value]]
  }
}

module.exports = function buildFilter(filter) {
  if (!isPlainObject(filter)) {
    throw new MoyskladError('Поле filter должно быть объектом')
  }

  let filterParts = getFilterParts([], filter)

  // преобразование ключа в строку
  filterParts = filterParts.map(part => [part[0].join('.'), part[1], part[2]])

  return (
    filterParts
      // конвертация операторов и значений в строку
      .map(part => {
        const key = part[0]
        const operator = part[1].operator
        const value = part[2]
        switch (true) {
          case value === undefined:
            return null

          case value === null:
            return [key, operator, '']

          case value instanceof Date:
            return [key, operator, getTimeString(value, true)]

          case typeof value === 'string': {
            return [
              key,
              operator,
              value.includes(';') ? value.replaceAll(';', '\\;') : value
            ]
          }

          case typeof value === 'number':
          case typeof value === 'boolean':
            return [key, operator, value]

          default:
            throw new MoyskladError(
              `Некорректное значение поля "${key}" в фильтре`
            )
        }
      })
      .filter(it => it != null)
      .map(part => `${part[0]}${part[1]}${part[2]}`)
      // TODO Можно удалить эту сортировку (лишняя не нужная работа)
      // только нужно адаптировать тесты
      .sort((p1, p2) => {
        if (p1 > p2) {
          return 1
        }
        if (p1 < p2) {
          return -1
        }
        return 0
      })
      .join(';')
  )
}


/***/ }),

/***/ 467:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


const { MoyskladError } = __webpack_require__(658)
const buildFilter = __webpack_require__(656)
const isPlainObject = __webpack_require__(226)

const addQueryPart = (res, key) => val => {
  if (val === null) {
    res.push([key, ''])
  } else if (val === undefined) {
    return undefined
  } else if (['string', 'number', 'boolean'].indexOf(typeof val) === -1) {
    throw new MoyskladError(
      'Значение поля строки запроса должно быть строкой, числом, логическим значением, null или undefined'
    )
  } else {
    res.push([key, encodeURIComponent(val)])
  }
}

module.exports = function buildQuery(query) {
  // совместимость с remap 1.2
  if (query.expand && query.limit == null) {
    query.limit = 100
  }

  return Object.keys(query)
    .reduce((res, key) => {
      const addPart = addQueryPart(res, key)

      switch (true) {
        case key === 'filter':
          if (isPlainObject(query.filter)) addPart(buildFilter(query.filter))
          else if (typeof query.filter === 'string') addPart(query.filter)
          else {
            throw new MoyskladError(
              'Поле filter запроса должно быть строкой или объектом'
            )
          }
          break

        case key === 'order' && query.order instanceof Array:
          addPart(
            query.order
              .map(o =>
                o instanceof Array
                  ? `${o[0]}${o[1] != null ? ',' + o[1] : ''}`
                  : o
              )
              .join(';')
          )
          break

        case query[key] instanceof Array:
          query[key].forEach(addPart)
          break

        default:
          addPart(query[key])
      }

      return res
    }, [])
    .map(kv => `${kv[0]}=${kv[1]}`)
    .join('&')
}


/***/ }),

/***/ 9:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


const getTimezoneShift = __webpack_require__(928)

const timezoneFix = getTimezoneShift()

/** Временная зона API МойСклад (часовой пояс в мс) */
const mskTimezone = +3 * 60 * 60 * 1000 // ms

function leftPad1(num) {
  return `0${num}`.slice(-2)
}

function leftPad2(num) {
  return `00${num}`.slice(-3)
}

/**
 * Возвращает дату для фильтра в часовом поясе Москвы
 *
 * @param {Date | number} date Конвертируемая дата
 * @param {Boolean} includeMs Необходимо ли включить миллисекунды в дату
 * @returns {string} Дата ввиде строки
 */
module.exports = function getTimeString(date, includeMs) {
  const mskTime = new Date(+date + mskTimezone + timezoneFix)

  const milliseconds = mskTime.getUTCMilliseconds()

  // 2000-01-01 01:00:00.123
  return [
    mskTime.getUTCFullYear(),
    '-',
    leftPad1(mskTime.getUTCMonth() + 1),
    '-',
    leftPad1(mskTime.getUTCDate()),
    ' ',
    leftPad1(mskTime.getUTCHours()),
    ':',
    leftPad1(mskTime.getUTCMinutes()),
    ':',
    leftPad1(mskTime.getUTCSeconds()),
    includeMs ? `.${leftPad2(milliseconds)}` : ''
  ].join('')
}


/***/ }),

/***/ 928:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const { MoyskladError } = __webpack_require__(658)
const getEnvVar = __webpack_require__(489)

/**
 * @deprecated Работать с датами нужно в UTC либо преобразовывать
 * вне библиотеки
 */
module.exports = function getTimezoneShift() {
  const localTimeZoneOffset = -(new Date().getTimezoneOffset() * 60 * 1000)

  /** Локальная временная зона в мс */
  let timeZoneMs = localTimeZoneOffset

  /** Временная зона приложения (часовой пояс в минутах) */
  const MOYSKLAD_TIMEZONE = getEnvVar('MOYSKLAD_TIMEZONE')

  if (MOYSKLAD_TIMEZONE) {
    const tz = Number.parseInt(MOYSKLAD_TIMEZONE) * 60 * 1000

    if (Number.isNaN(tz)) {
      throw new MoyskladError(
        'Некорректно указана переменная окружения MOYSKLAD_TIMEZONE' +
          ` - ${MOYSKLAD_TIMEZONE}` // TODO Ссылка на документацию
      )
    }

    timeZoneMs = tz
  }

  return localTimeZoneOffset - timeZoneMs
}


/***/ }),

/***/ 226:
/***/ ((module) => {

"use strict";


module.exports = function isPlainObject(value) {
  return Object.prototype.toString.call(value) === '[object Object]'
}


/***/ }),

/***/ 981:
/***/ ((module) => {

"use strict";


module.exports = function isSimpleValue(value) {
  return typeof value !== 'object' || value instanceof Date || value === null
}


/***/ }),

/***/ 461:
/***/ ((module) => {

"use strict";


const URI_EXTRA_SLASH_REGEX = /([^:]\/)\/+/g
const TRIM_SLASH = /^\/+|\/+$/g

module.exports = function normalizeUrl(url) {
  return url.replace(TRIM_SLASH, '').replace(URI_EXTRA_SLASH_REGEX, '$1')
}


/***/ }),

/***/ 565:
/***/ ((module) => {

"use strict";


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


/***/ }),

/***/ 562:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


const { MoyskladError } = __webpack_require__(658)
const getTimezoneShift = __webpack_require__(928)

const timezoneFix = getTimezoneShift()

// https://regex101.com/r/Bxq7dZ/2
const MS_TIME_REGEX =
  /^(\d{4})-(\d{2})-(\d{2})\s(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?$/

function rightPad2(num) {
  return `${num}00`.slice(0, 3)
}

/**
 * Преобразует строку времени МойСклад в объект даты (с учетом временной зоны)
 * @param {string} timeString Время в формате МойСклад ("2017-04-08 13:33:00.123")
 * @returns {Date} Дата
 */
module.exports = function parseTimeString(timeString) {
  // 2017-04-08 13:33:00.123
  const m = MS_TIME_REGEX.exec(timeString)
  if (!m || m.length < 7 || m.length > 8) {
    throw new MoyskladError(`Некорректный формат даты "${timeString}"`)
  }

  const dateExp = `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}${
    m[7] && Number.parseInt(m[7]) !== 0 ? '.' + rightPad2(m[7]) : ''
  }+03:00`

  const date = new Date(dateExp)

  return timezoneFix ? new Date(+date - timezoneFix) : date
}


/***/ }),

/***/ 345:
/***/ ((module) => {

module.exports = { version: '0.15.1' }


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__(138);
/******/ 	window.MoyskladClient = __webpack_exports__;
/******/ 	
/******/ })()
;