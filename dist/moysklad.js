(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.MoyskladCore = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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

},{}],2:[function(require,module,exports){
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


},{}],3:[function(require,module,exports){
/**
 * Lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright OpenJS Foundation and other contributors <https://openjsf.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as the size to enable large array optimizations. */
var LARGE_ARRAY_SIZE = 200;

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED = '__lodash_hash_undefined__';

/** Used to detect hot functions by number of calls within a span of milliseconds. */
var HOT_COUNT = 800,
    HOT_SPAN = 16;

/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER = 9007199254740991;

/** `Object#toString` result references. */
var argsTag = '[object Arguments]',
    arrayTag = '[object Array]',
    asyncTag = '[object AsyncFunction]',
    boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    errorTag = '[object Error]',
    funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]',
    mapTag = '[object Map]',
    numberTag = '[object Number]',
    nullTag = '[object Null]',
    objectTag = '[object Object]',
    proxyTag = '[object Proxy]',
    regexpTag = '[object RegExp]',
    setTag = '[object Set]',
    stringTag = '[object String]',
    undefinedTag = '[object Undefined]',
    weakMapTag = '[object WeakMap]';

var arrayBufferTag = '[object ArrayBuffer]',
    dataViewTag = '[object DataView]',
    float32Tag = '[object Float32Array]',
    float64Tag = '[object Float64Array]',
    int8Tag = '[object Int8Array]',
    int16Tag = '[object Int16Array]',
    int32Tag = '[object Int32Array]',
    uint8Tag = '[object Uint8Array]',
    uint8ClampedTag = '[object Uint8ClampedArray]',
    uint16Tag = '[object Uint16Array]',
    uint32Tag = '[object Uint32Array]';

/**
 * Used to match `RegExp`
 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
 */
var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

/** Used to detect host constructors (Safari). */
var reIsHostCtor = /^\[object .+?Constructor\]$/;

/** Used to detect unsigned integer values. */
var reIsUint = /^(?:0|[1-9]\d*)$/;

/** Used to identify `toStringTag` values of typed arrays. */
var typedArrayTags = {};
typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
typedArrayTags[uint32Tag] = true;
typedArrayTags[argsTag] = typedArrayTags[arrayTag] =
typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
typedArrayTags[dataViewTag] = typedArrayTags[dateTag] =
typedArrayTags[errorTag] = typedArrayTags[funcTag] =
typedArrayTags[mapTag] = typedArrayTags[numberTag] =
typedArrayTags[objectTag] = typedArrayTags[regexpTag] =
typedArrayTags[setTag] = typedArrayTags[stringTag] =
typedArrayTags[weakMapTag] = false;

/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

/** Detect free variable `exports`. */
var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports = freeModule && freeModule.exports === freeExports;

/** Detect free variable `process` from Node.js. */
var freeProcess = moduleExports && freeGlobal.process;

/** Used to access faster Node.js helpers. */
var nodeUtil = (function() {
  try {
    // Use `util.types` for Node.js 10+.
    var types = freeModule && freeModule.require && freeModule.require('util').types;

    if (types) {
      return types;
    }

    // Legacy `process.binding('util')` for Node.js < 10.
    return freeProcess && freeProcess.binding && freeProcess.binding('util');
  } catch (e) {}
}());

/* Node.js helper references. */
var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;

/**
 * A faster alternative to `Function#apply`, this function invokes `func`
 * with the `this` binding of `thisArg` and the arguments of `args`.
 *
 * @private
 * @param {Function} func The function to invoke.
 * @param {*} thisArg The `this` binding of `func`.
 * @param {Array} args The arguments to invoke `func` with.
 * @returns {*} Returns the result of `func`.
 */
function apply(func, thisArg, args) {
  switch (args.length) {
    case 0: return func.call(thisArg);
    case 1: return func.call(thisArg, args[0]);
    case 2: return func.call(thisArg, args[0], args[1]);
    case 3: return func.call(thisArg, args[0], args[1], args[2]);
  }
  return func.apply(thisArg, args);
}

/**
 * The base implementation of `_.times` without support for iteratee shorthands
 * or max array length checks.
 *
 * @private
 * @param {number} n The number of times to invoke `iteratee`.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the array of results.
 */
function baseTimes(n, iteratee) {
  var index = -1,
      result = Array(n);

  while (++index < n) {
    result[index] = iteratee(index);
  }
  return result;
}

/**
 * The base implementation of `_.unary` without support for storing metadata.
 *
 * @private
 * @param {Function} func The function to cap arguments for.
 * @returns {Function} Returns the new capped function.
 */
function baseUnary(func) {
  return function(value) {
    return func(value);
  };
}

/**
 * Gets the value at `key` of `object`.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {string} key The key of the property to get.
 * @returns {*} Returns the property value.
 */
function getValue(object, key) {
  return object == null ? undefined : object[key];
}

/**
 * Creates a unary function that invokes `func` with its argument transformed.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {Function} transform The argument transform.
 * @returns {Function} Returns the new function.
 */
function overArg(func, transform) {
  return function(arg) {
    return func(transform(arg));
  };
}

/** Used for built-in method references. */
var arrayProto = Array.prototype,
    funcProto = Function.prototype,
    objectProto = Object.prototype;

/** Used to detect overreaching core-js shims. */
var coreJsData = root['__core-js_shared__'];

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/** Used to detect methods masquerading as native. */
var maskSrcKey = (function() {
  var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
  return uid ? ('Symbol(src)_1.' + uid) : '';
}());

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto.toString;

/** Used to infer the `Object` constructor. */
var objectCtorString = funcToString.call(Object);

/** Used to detect if a method is native. */
var reIsNative = RegExp('^' +
  funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&')
  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/** Built-in value references. */
var Buffer = moduleExports ? root.Buffer : undefined,
    Symbol = root.Symbol,
    Uint8Array = root.Uint8Array,
    allocUnsafe = Buffer ? Buffer.allocUnsafe : undefined,
    getPrototype = overArg(Object.getPrototypeOf, Object),
    objectCreate = Object.create,
    propertyIsEnumerable = objectProto.propertyIsEnumerable,
    splice = arrayProto.splice,
    symToStringTag = Symbol ? Symbol.toStringTag : undefined;

var defineProperty = (function() {
  try {
    var func = getNative(Object, 'defineProperty');
    func({}, '', {});
    return func;
  } catch (e) {}
}());

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined,
    nativeMax = Math.max,
    nativeNow = Date.now;

/* Built-in method references that are verified to be native. */
var Map = getNative(root, 'Map'),
    nativeCreate = getNative(Object, 'create');

/**
 * The base implementation of `_.create` without support for assigning
 * properties to the created object.
 *
 * @private
 * @param {Object} proto The object to inherit from.
 * @returns {Object} Returns the new object.
 */
var baseCreate = (function() {
  function object() {}
  return function(proto) {
    if (!isObject(proto)) {
      return {};
    }
    if (objectCreate) {
      return objectCreate(proto);
    }
    object.prototype = proto;
    var result = new object;
    object.prototype = undefined;
    return result;
  };
}());

/**
 * Creates a hash object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Hash(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the hash.
 *
 * @private
 * @name clear
 * @memberOf Hash
 */
function hashClear() {
  this.__data__ = nativeCreate ? nativeCreate(null) : {};
  this.size = 0;
}

/**
 * Removes `key` and its value from the hash.
 *
 * @private
 * @name delete
 * @memberOf Hash
 * @param {Object} hash The hash to modify.
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function hashDelete(key) {
  var result = this.has(key) && delete this.__data__[key];
  this.size -= result ? 1 : 0;
  return result;
}

/**
 * Gets the hash value for `key`.
 *
 * @private
 * @name get
 * @memberOf Hash
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function hashGet(key) {
  var data = this.__data__;
  if (nativeCreate) {
    var result = data[key];
    return result === HASH_UNDEFINED ? undefined : result;
  }
  return hasOwnProperty.call(data, key) ? data[key] : undefined;
}

/**
 * Checks if a hash value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Hash
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function hashHas(key) {
  var data = this.__data__;
  return nativeCreate ? (data[key] !== undefined) : hasOwnProperty.call(data, key);
}

/**
 * Sets the hash `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Hash
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the hash instance.
 */
function hashSet(key, value) {
  var data = this.__data__;
  this.size += this.has(key) ? 0 : 1;
  data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED : value;
  return this;
}

// Add methods to `Hash`.
Hash.prototype.clear = hashClear;
Hash.prototype['delete'] = hashDelete;
Hash.prototype.get = hashGet;
Hash.prototype.has = hashHas;
Hash.prototype.set = hashSet;

/**
 * Creates an list cache object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function ListCache(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the list cache.
 *
 * @private
 * @name clear
 * @memberOf ListCache
 */
function listCacheClear() {
  this.__data__ = [];
  this.size = 0;
}

/**
 * Removes `key` and its value from the list cache.
 *
 * @private
 * @name delete
 * @memberOf ListCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function listCacheDelete(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    return false;
  }
  var lastIndex = data.length - 1;
  if (index == lastIndex) {
    data.pop();
  } else {
    splice.call(data, index, 1);
  }
  --this.size;
  return true;
}

/**
 * Gets the list cache value for `key`.
 *
 * @private
 * @name get
 * @memberOf ListCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function listCacheGet(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  return index < 0 ? undefined : data[index][1];
}

/**
 * Checks if a list cache value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf ListCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function listCacheHas(key) {
  return assocIndexOf(this.__data__, key) > -1;
}

/**
 * Sets the list cache `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf ListCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the list cache instance.
 */
function listCacheSet(key, value) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    ++this.size;
    data.push([key, value]);
  } else {
    data[index][1] = value;
  }
  return this;
}

// Add methods to `ListCache`.
ListCache.prototype.clear = listCacheClear;
ListCache.prototype['delete'] = listCacheDelete;
ListCache.prototype.get = listCacheGet;
ListCache.prototype.has = listCacheHas;
ListCache.prototype.set = listCacheSet;

/**
 * Creates a map cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function MapCache(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the map.
 *
 * @private
 * @name clear
 * @memberOf MapCache
 */
function mapCacheClear() {
  this.size = 0;
  this.__data__ = {
    'hash': new Hash,
    'map': new (Map || ListCache),
    'string': new Hash
  };
}

/**
 * Removes `key` and its value from the map.
 *
 * @private
 * @name delete
 * @memberOf MapCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function mapCacheDelete(key) {
  var result = getMapData(this, key)['delete'](key);
  this.size -= result ? 1 : 0;
  return result;
}

/**
 * Gets the map value for `key`.
 *
 * @private
 * @name get
 * @memberOf MapCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function mapCacheGet(key) {
  return getMapData(this, key).get(key);
}

/**
 * Checks if a map value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf MapCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function mapCacheHas(key) {
  return getMapData(this, key).has(key);
}

/**
 * Sets the map `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf MapCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the map cache instance.
 */
function mapCacheSet(key, value) {
  var data = getMapData(this, key),
      size = data.size;

  data.set(key, value);
  this.size += data.size == size ? 0 : 1;
  return this;
}

// Add methods to `MapCache`.
MapCache.prototype.clear = mapCacheClear;
MapCache.prototype['delete'] = mapCacheDelete;
MapCache.prototype.get = mapCacheGet;
MapCache.prototype.has = mapCacheHas;
MapCache.prototype.set = mapCacheSet;

/**
 * Creates a stack cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Stack(entries) {
  var data = this.__data__ = new ListCache(entries);
  this.size = data.size;
}

/**
 * Removes all key-value entries from the stack.
 *
 * @private
 * @name clear
 * @memberOf Stack
 */
function stackClear() {
  this.__data__ = new ListCache;
  this.size = 0;
}

/**
 * Removes `key` and its value from the stack.
 *
 * @private
 * @name delete
 * @memberOf Stack
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function stackDelete(key) {
  var data = this.__data__,
      result = data['delete'](key);

  this.size = data.size;
  return result;
}

/**
 * Gets the stack value for `key`.
 *
 * @private
 * @name get
 * @memberOf Stack
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function stackGet(key) {
  return this.__data__.get(key);
}

/**
 * Checks if a stack value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Stack
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function stackHas(key) {
  return this.__data__.has(key);
}

/**
 * Sets the stack `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Stack
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the stack cache instance.
 */
function stackSet(key, value) {
  var data = this.__data__;
  if (data instanceof ListCache) {
    var pairs = data.__data__;
    if (!Map || (pairs.length < LARGE_ARRAY_SIZE - 1)) {
      pairs.push([key, value]);
      this.size = ++data.size;
      return this;
    }
    data = this.__data__ = new MapCache(pairs);
  }
  data.set(key, value);
  this.size = data.size;
  return this;
}

// Add methods to `Stack`.
Stack.prototype.clear = stackClear;
Stack.prototype['delete'] = stackDelete;
Stack.prototype.get = stackGet;
Stack.prototype.has = stackHas;
Stack.prototype.set = stackSet;

/**
 * Creates an array of the enumerable property names of the array-like `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @param {boolean} inherited Specify returning inherited property names.
 * @returns {Array} Returns the array of property names.
 */
function arrayLikeKeys(value, inherited) {
  var isArr = isArray(value),
      isArg = !isArr && isArguments(value),
      isBuff = !isArr && !isArg && isBuffer(value),
      isType = !isArr && !isArg && !isBuff && isTypedArray(value),
      skipIndexes = isArr || isArg || isBuff || isType,
      result = skipIndexes ? baseTimes(value.length, String) : [],
      length = result.length;

  for (var key in value) {
    if ((inherited || hasOwnProperty.call(value, key)) &&
        !(skipIndexes && (
           // Safari 9 has enumerable `arguments.length` in strict mode.
           key == 'length' ||
           // Node.js 0.10 has enumerable non-index properties on buffers.
           (isBuff && (key == 'offset' || key == 'parent')) ||
           // PhantomJS 2 has enumerable non-index properties on typed arrays.
           (isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset')) ||
           // Skip index properties.
           isIndex(key, length)
        ))) {
      result.push(key);
    }
  }
  return result;
}

/**
 * This function is like `assignValue` except that it doesn't assign
 * `undefined` values.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {string} key The key of the property to assign.
 * @param {*} value The value to assign.
 */
function assignMergeValue(object, key, value) {
  if ((value !== undefined && !eq(object[key], value)) ||
      (value === undefined && !(key in object))) {
    baseAssignValue(object, key, value);
  }
}

/**
 * Assigns `value` to `key` of `object` if the existing value is not equivalent
 * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * for equality comparisons.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {string} key The key of the property to assign.
 * @param {*} value The value to assign.
 */
function assignValue(object, key, value) {
  var objValue = object[key];
  if (!(hasOwnProperty.call(object, key) && eq(objValue, value)) ||
      (value === undefined && !(key in object))) {
    baseAssignValue(object, key, value);
  }
}

/**
 * Gets the index at which the `key` is found in `array` of key-value pairs.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} key The key to search for.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function assocIndexOf(array, key) {
  var length = array.length;
  while (length--) {
    if (eq(array[length][0], key)) {
      return length;
    }
  }
  return -1;
}

/**
 * The base implementation of `assignValue` and `assignMergeValue` without
 * value checks.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {string} key The key of the property to assign.
 * @param {*} value The value to assign.
 */
function baseAssignValue(object, key, value) {
  if (key == '__proto__' && defineProperty) {
    defineProperty(object, key, {
      'configurable': true,
      'enumerable': true,
      'value': value,
      'writable': true
    });
  } else {
    object[key] = value;
  }
}

/**
 * The base implementation of `baseForOwn` which iterates over `object`
 * properties returned by `keysFunc` and invokes `iteratee` for each property.
 * Iteratee functions may exit iteration early by explicitly returning `false`.
 *
 * @private
 * @param {Object} object The object to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @param {Function} keysFunc The function to get the keys of `object`.
 * @returns {Object} Returns `object`.
 */
var baseFor = createBaseFor();

/**
 * The base implementation of `getTag` without fallbacks for buggy environments.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
function baseGetTag(value) {
  if (value == null) {
    return value === undefined ? undefinedTag : nullTag;
  }
  return (symToStringTag && symToStringTag in Object(value))
    ? getRawTag(value)
    : objectToString(value);
}

/**
 * The base implementation of `_.isArguments`.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 */
function baseIsArguments(value) {
  return isObjectLike(value) && baseGetTag(value) == argsTag;
}

/**
 * The base implementation of `_.isNative` without bad shim checks.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function,
 *  else `false`.
 */
function baseIsNative(value) {
  if (!isObject(value) || isMasked(value)) {
    return false;
  }
  var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
  return pattern.test(toSource(value));
}

/**
 * The base implementation of `_.isTypedArray` without Node.js optimizations.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 */
function baseIsTypedArray(value) {
  return isObjectLike(value) &&
    isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
}

/**
 * The base implementation of `_.keysIn` which doesn't treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function baseKeysIn(object) {
  if (!isObject(object)) {
    return nativeKeysIn(object);
  }
  var isProto = isPrototype(object),
      result = [];

  for (var key in object) {
    if (!(key == 'constructor' && (isProto || !hasOwnProperty.call(object, key)))) {
      result.push(key);
    }
  }
  return result;
}

/**
 * The base implementation of `_.merge` without support for multiple sources.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @param {number} srcIndex The index of `source`.
 * @param {Function} [customizer] The function to customize merged values.
 * @param {Object} [stack] Tracks traversed source values and their merged
 *  counterparts.
 */
function baseMerge(object, source, srcIndex, customizer, stack) {
  if (object === source) {
    return;
  }
  baseFor(source, function(srcValue, key) {
    stack || (stack = new Stack);
    if (isObject(srcValue)) {
      baseMergeDeep(object, source, key, srcIndex, baseMerge, customizer, stack);
    }
    else {
      var newValue = customizer
        ? customizer(safeGet(object, key), srcValue, (key + ''), object, source, stack)
        : undefined;

      if (newValue === undefined) {
        newValue = srcValue;
      }
      assignMergeValue(object, key, newValue);
    }
  }, keysIn);
}

/**
 * A specialized version of `baseMerge` for arrays and objects which performs
 * deep merges and tracks traversed objects enabling objects with circular
 * references to be merged.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @param {string} key The key of the value to merge.
 * @param {number} srcIndex The index of `source`.
 * @param {Function} mergeFunc The function to merge values.
 * @param {Function} [customizer] The function to customize assigned values.
 * @param {Object} [stack] Tracks traversed source values and their merged
 *  counterparts.
 */
function baseMergeDeep(object, source, key, srcIndex, mergeFunc, customizer, stack) {
  var objValue = safeGet(object, key),
      srcValue = safeGet(source, key),
      stacked = stack.get(srcValue);

  if (stacked) {
    assignMergeValue(object, key, stacked);
    return;
  }
  var newValue = customizer
    ? customizer(objValue, srcValue, (key + ''), object, source, stack)
    : undefined;

  var isCommon = newValue === undefined;

  if (isCommon) {
    var isArr = isArray(srcValue),
        isBuff = !isArr && isBuffer(srcValue),
        isTyped = !isArr && !isBuff && isTypedArray(srcValue);

    newValue = srcValue;
    if (isArr || isBuff || isTyped) {
      if (isArray(objValue)) {
        newValue = objValue;
      }
      else if (isArrayLikeObject(objValue)) {
        newValue = copyArray(objValue);
      }
      else if (isBuff) {
        isCommon = false;
        newValue = cloneBuffer(srcValue, true);
      }
      else if (isTyped) {
        isCommon = false;
        newValue = cloneTypedArray(srcValue, true);
      }
      else {
        newValue = [];
      }
    }
    else if (isPlainObject(srcValue) || isArguments(srcValue)) {
      newValue = objValue;
      if (isArguments(objValue)) {
        newValue = toPlainObject(objValue);
      }
      else if (!isObject(objValue) || isFunction(objValue)) {
        newValue = initCloneObject(srcValue);
      }
    }
    else {
      isCommon = false;
    }
  }
  if (isCommon) {
    // Recursively merge objects and arrays (susceptible to call stack limits).
    stack.set(srcValue, newValue);
    mergeFunc(newValue, srcValue, srcIndex, customizer, stack);
    stack['delete'](srcValue);
  }
  assignMergeValue(object, key, newValue);
}

/**
 * The base implementation of `_.rest` which doesn't validate or coerce arguments.
 *
 * @private
 * @param {Function} func The function to apply a rest parameter to.
 * @param {number} [start=func.length-1] The start position of the rest parameter.
 * @returns {Function} Returns the new function.
 */
function baseRest(func, start) {
  return setToString(overRest(func, start, identity), func + '');
}

/**
 * The base implementation of `setToString` without support for hot loop shorting.
 *
 * @private
 * @param {Function} func The function to modify.
 * @param {Function} string The `toString` result.
 * @returns {Function} Returns `func`.
 */
var baseSetToString = !defineProperty ? identity : function(func, string) {
  return defineProperty(func, 'toString', {
    'configurable': true,
    'enumerable': false,
    'value': constant(string),
    'writable': true
  });
};

/**
 * Creates a clone of  `buffer`.
 *
 * @private
 * @param {Buffer} buffer The buffer to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Buffer} Returns the cloned buffer.
 */
function cloneBuffer(buffer, isDeep) {
  if (isDeep) {
    return buffer.slice();
  }
  var length = buffer.length,
      result = allocUnsafe ? allocUnsafe(length) : new buffer.constructor(length);

  buffer.copy(result);
  return result;
}

/**
 * Creates a clone of `arrayBuffer`.
 *
 * @private
 * @param {ArrayBuffer} arrayBuffer The array buffer to clone.
 * @returns {ArrayBuffer} Returns the cloned array buffer.
 */
function cloneArrayBuffer(arrayBuffer) {
  var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
  new Uint8Array(result).set(new Uint8Array(arrayBuffer));
  return result;
}

/**
 * Creates a clone of `typedArray`.
 *
 * @private
 * @param {Object} typedArray The typed array to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the cloned typed array.
 */
function cloneTypedArray(typedArray, isDeep) {
  var buffer = isDeep ? cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
  return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
}

/**
 * Copies the values of `source` to `array`.
 *
 * @private
 * @param {Array} source The array to copy values from.
 * @param {Array} [array=[]] The array to copy values to.
 * @returns {Array} Returns `array`.
 */
function copyArray(source, array) {
  var index = -1,
      length = source.length;

  array || (array = Array(length));
  while (++index < length) {
    array[index] = source[index];
  }
  return array;
}

/**
 * Copies properties of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy properties from.
 * @param {Array} props The property identifiers to copy.
 * @param {Object} [object={}] The object to copy properties to.
 * @param {Function} [customizer] The function to customize copied values.
 * @returns {Object} Returns `object`.
 */
function copyObject(source, props, object, customizer) {
  var isNew = !object;
  object || (object = {});

  var index = -1,
      length = props.length;

  while (++index < length) {
    var key = props[index];

    var newValue = customizer
      ? customizer(object[key], source[key], key, object, source)
      : undefined;

    if (newValue === undefined) {
      newValue = source[key];
    }
    if (isNew) {
      baseAssignValue(object, key, newValue);
    } else {
      assignValue(object, key, newValue);
    }
  }
  return object;
}

/**
 * Creates a function like `_.assign`.
 *
 * @private
 * @param {Function} assigner The function to assign values.
 * @returns {Function} Returns the new assigner function.
 */
function createAssigner(assigner) {
  return baseRest(function(object, sources) {
    var index = -1,
        length = sources.length,
        customizer = length > 1 ? sources[length - 1] : undefined,
        guard = length > 2 ? sources[2] : undefined;

    customizer = (assigner.length > 3 && typeof customizer == 'function')
      ? (length--, customizer)
      : undefined;

    if (guard && isIterateeCall(sources[0], sources[1], guard)) {
      customizer = length < 3 ? undefined : customizer;
      length = 1;
    }
    object = Object(object);
    while (++index < length) {
      var source = sources[index];
      if (source) {
        assigner(object, source, index, customizer);
      }
    }
    return object;
  });
}

/**
 * Creates a base function for methods like `_.forIn` and `_.forOwn`.
 *
 * @private
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {Function} Returns the new base function.
 */
function createBaseFor(fromRight) {
  return function(object, iteratee, keysFunc) {
    var index = -1,
        iterable = Object(object),
        props = keysFunc(object),
        length = props.length;

    while (length--) {
      var key = props[fromRight ? length : ++index];
      if (iteratee(iterable[key], key, iterable) === false) {
        break;
      }
    }
    return object;
  };
}

/**
 * Used by `_.defaultsDeep` to customize its `_.merge` use to merge source
 * objects into destination objects that are passed thru.
 *
 * @private
 * @param {*} objValue The destination value.
 * @param {*} srcValue The source value.
 * @param {string} key The key of the property to merge.
 * @param {Object} object The parent object of `objValue`.
 * @param {Object} source The parent object of `srcValue`.
 * @param {Object} [stack] Tracks traversed source values and their merged
 *  counterparts.
 * @returns {*} Returns the value to assign.
 */
function customDefaultsMerge(objValue, srcValue, key, object, source, stack) {
  if (isObject(objValue) && isObject(srcValue)) {
    // Recursively merge objects and arrays (susceptible to call stack limits).
    stack.set(srcValue, objValue);
    baseMerge(objValue, srcValue, undefined, customDefaultsMerge, stack);
    stack['delete'](srcValue);
  }
  return objValue;
}

/**
 * Gets the data for `map`.
 *
 * @private
 * @param {Object} map The map to query.
 * @param {string} key The reference key.
 * @returns {*} Returns the map data.
 */
function getMapData(map, key) {
  var data = map.__data__;
  return isKeyable(key)
    ? data[typeof key == 'string' ? 'string' : 'hash']
    : data.map;
}

/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */
function getNative(object, key) {
  var value = getValue(object, key);
  return baseIsNative(value) ? value : undefined;
}

/**
 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the raw `toStringTag`.
 */
function getRawTag(value) {
  var isOwn = hasOwnProperty.call(value, symToStringTag),
      tag = value[symToStringTag];

  try {
    value[symToStringTag] = undefined;
    var unmasked = true;
  } catch (e) {}

  var result = nativeObjectToString.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag] = tag;
    } else {
      delete value[symToStringTag];
    }
  }
  return result;
}

/**
 * Initializes an object clone.
 *
 * @private
 * @param {Object} object The object to clone.
 * @returns {Object} Returns the initialized clone.
 */
function initCloneObject(object) {
  return (typeof object.constructor == 'function' && !isPrototype(object))
    ? baseCreate(getPrototype(object))
    : {};
}

/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */
function isIndex(value, length) {
  var type = typeof value;
  length = length == null ? MAX_SAFE_INTEGER : length;

  return !!length &&
    (type == 'number' ||
      (type != 'symbol' && reIsUint.test(value))) &&
        (value > -1 && value % 1 == 0 && value < length);
}

/**
 * Checks if the given arguments are from an iteratee call.
 *
 * @private
 * @param {*} value The potential iteratee value argument.
 * @param {*} index The potential iteratee index or key argument.
 * @param {*} object The potential iteratee object argument.
 * @returns {boolean} Returns `true` if the arguments are from an iteratee call,
 *  else `false`.
 */
function isIterateeCall(value, index, object) {
  if (!isObject(object)) {
    return false;
  }
  var type = typeof index;
  if (type == 'number'
        ? (isArrayLike(object) && isIndex(index, object.length))
        : (type == 'string' && index in object)
      ) {
    return eq(object[index], value);
  }
  return false;
}

/**
 * Checks if `value` is suitable for use as unique object key.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
 */
function isKeyable(value) {
  var type = typeof value;
  return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
    ? (value !== '__proto__')
    : (value === null);
}

/**
 * Checks if `func` has its source masked.
 *
 * @private
 * @param {Function} func The function to check.
 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
 */
function isMasked(func) {
  return !!maskSrcKey && (maskSrcKey in func);
}

/**
 * Checks if `value` is likely a prototype object.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
 */
function isPrototype(value) {
  var Ctor = value && value.constructor,
      proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto;

  return value === proto;
}

/**
 * This function is like
 * [`Object.keys`](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
 * except that it includes inherited enumerable properties.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function nativeKeysIn(object) {
  var result = [];
  if (object != null) {
    for (var key in Object(object)) {
      result.push(key);
    }
  }
  return result;
}

/**
 * Converts `value` to a string using `Object.prototype.toString`.
 *
 * @private
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 */
function objectToString(value) {
  return nativeObjectToString.call(value);
}

/**
 * A specialized version of `baseRest` which transforms the rest array.
 *
 * @private
 * @param {Function} func The function to apply a rest parameter to.
 * @param {number} [start=func.length-1] The start position of the rest parameter.
 * @param {Function} transform The rest array transform.
 * @returns {Function} Returns the new function.
 */
function overRest(func, start, transform) {
  start = nativeMax(start === undefined ? (func.length - 1) : start, 0);
  return function() {
    var args = arguments,
        index = -1,
        length = nativeMax(args.length - start, 0),
        array = Array(length);

    while (++index < length) {
      array[index] = args[start + index];
    }
    index = -1;
    var otherArgs = Array(start + 1);
    while (++index < start) {
      otherArgs[index] = args[index];
    }
    otherArgs[start] = transform(array);
    return apply(func, this, otherArgs);
  };
}

/**
 * Gets the value at `key`, unless `key` is "__proto__" or "constructor".
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the property to get.
 * @returns {*} Returns the property value.
 */
function safeGet(object, key) {
  if (key === 'constructor' && typeof object[key] === 'function') {
    return;
  }

  if (key == '__proto__') {
    return;
  }

  return object[key];
}

/**
 * Sets the `toString` method of `func` to return `string`.
 *
 * @private
 * @param {Function} func The function to modify.
 * @param {Function} string The `toString` result.
 * @returns {Function} Returns `func`.
 */
var setToString = shortOut(baseSetToString);

/**
 * Creates a function that'll short out and invoke `identity` instead
 * of `func` when it's called `HOT_COUNT` or more times in `HOT_SPAN`
 * milliseconds.
 *
 * @private
 * @param {Function} func The function to restrict.
 * @returns {Function} Returns the new shortable function.
 */
function shortOut(func) {
  var count = 0,
      lastCalled = 0;

  return function() {
    var stamp = nativeNow(),
        remaining = HOT_SPAN - (stamp - lastCalled);

    lastCalled = stamp;
    if (remaining > 0) {
      if (++count >= HOT_COUNT) {
        return arguments[0];
      }
    } else {
      count = 0;
    }
    return func.apply(undefined, arguments);
  };
}

/**
 * Converts `func` to its source code.
 *
 * @private
 * @param {Function} func The function to convert.
 * @returns {string} Returns the source code.
 */
function toSource(func) {
  if (func != null) {
    try {
      return funcToString.call(func);
    } catch (e) {}
    try {
      return (func + '');
    } catch (e) {}
  }
  return '';
}

/**
 * Performs a
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * comparison between two values to determine if they are equivalent.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'a': 1 };
 * var other = { 'a': 1 };
 *
 * _.eq(object, object);
 * // => true
 *
 * _.eq(object, other);
 * // => false
 *
 * _.eq('a', 'a');
 * // => true
 *
 * _.eq('a', Object('a'));
 * // => false
 *
 * _.eq(NaN, NaN);
 * // => true
 */
function eq(value, other) {
  return value === other || (value !== value && other !== other);
}

/**
 * Checks if `value` is likely an `arguments` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 *  else `false`.
 * @example
 *
 * _.isArguments(function() { return arguments; }());
 * // => true
 *
 * _.isArguments([1, 2, 3]);
 * // => false
 */
var isArguments = baseIsArguments(function() { return arguments; }()) ? baseIsArguments : function(value) {
  return isObjectLike(value) && hasOwnProperty.call(value, 'callee') &&
    !propertyIsEnumerable.call(value, 'callee');
};

/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */
var isArray = Array.isArray;

/**
 * Checks if `value` is array-like. A value is considered array-like if it's
 * not a function and has a `value.length` that's an integer greater than or
 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 * @example
 *
 * _.isArrayLike([1, 2, 3]);
 * // => true
 *
 * _.isArrayLike(document.body.children);
 * // => true
 *
 * _.isArrayLike('abc');
 * // => true
 *
 * _.isArrayLike(_.noop);
 * // => false
 */
function isArrayLike(value) {
  return value != null && isLength(value.length) && !isFunction(value);
}

/**
 * This method is like `_.isArrayLike` except that it also checks if `value`
 * is an object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array-like object,
 *  else `false`.
 * @example
 *
 * _.isArrayLikeObject([1, 2, 3]);
 * // => true
 *
 * _.isArrayLikeObject(document.body.children);
 * // => true
 *
 * _.isArrayLikeObject('abc');
 * // => false
 *
 * _.isArrayLikeObject(_.noop);
 * // => false
 */
function isArrayLikeObject(value) {
  return isObjectLike(value) && isArrayLike(value);
}

/**
 * Checks if `value` is a buffer.
 *
 * @static
 * @memberOf _
 * @since 4.3.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
 * @example
 *
 * _.isBuffer(new Buffer(2));
 * // => true
 *
 * _.isBuffer(new Uint8Array(2));
 * // => false
 */
var isBuffer = nativeIsBuffer || stubFalse;

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  if (!isObject(value)) {
    return false;
  }
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 9 which returns 'object' for typed arrays and other constructors.
  var tag = baseGetTag(value);
  return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
}

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This method is loosely based on
 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 * @example
 *
 * _.isLength(3);
 * // => true
 *
 * _.isLength(Number.MIN_VALUE);
 * // => false
 *
 * _.isLength(Infinity);
 * // => false
 *
 * _.isLength('3');
 * // => false
 */
function isLength(value) {
  return typeof value == 'number' &&
    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return value != null && (type == 'object' || type == 'function');
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return value != null && typeof value == 'object';
}

/**
 * Checks if `value` is a plain object, that is, an object created by the
 * `Object` constructor or one with a `[[Prototype]]` of `null`.
 *
 * @static
 * @memberOf _
 * @since 0.8.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 * }
 *
 * _.isPlainObject(new Foo);
 * // => false
 *
 * _.isPlainObject([1, 2, 3]);
 * // => false
 *
 * _.isPlainObject({ 'x': 0, 'y': 0 });
 * // => true
 *
 * _.isPlainObject(Object.create(null));
 * // => true
 */
function isPlainObject(value) {
  if (!isObjectLike(value) || baseGetTag(value) != objectTag) {
    return false;
  }
  var proto = getPrototype(value);
  if (proto === null) {
    return true;
  }
  var Ctor = hasOwnProperty.call(proto, 'constructor') && proto.constructor;
  return typeof Ctor == 'function' && Ctor instanceof Ctor &&
    funcToString.call(Ctor) == objectCtorString;
}

/**
 * Checks if `value` is classified as a typed array.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 * @example
 *
 * _.isTypedArray(new Uint8Array);
 * // => true
 *
 * _.isTypedArray([]);
 * // => false
 */
var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;

/**
 * Converts `value` to a plain object flattening inherited enumerable string
 * keyed properties of `value` to own properties of the plain object.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {Object} Returns the converted plain object.
 * @example
 *
 * function Foo() {
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.assign({ 'a': 1 }, new Foo);
 * // => { 'a': 1, 'b': 2 }
 *
 * _.assign({ 'a': 1 }, _.toPlainObject(new Foo));
 * // => { 'a': 1, 'b': 2, 'c': 3 }
 */
function toPlainObject(value) {
  return copyObject(value, keysIn(value));
}

/**
 * This method is like `_.defaults` except that it recursively assigns
 * default properties.
 *
 * **Note:** This method mutates `object`.
 *
 * @static
 * @memberOf _
 * @since 3.10.0
 * @category Object
 * @param {Object} object The destination object.
 * @param {...Object} [sources] The source objects.
 * @returns {Object} Returns `object`.
 * @see _.defaults
 * @example
 *
 * _.defaultsDeep({ 'a': { 'b': 2 } }, { 'a': { 'b': 1, 'c': 3 } });
 * // => { 'a': { 'b': 2, 'c': 3 } }
 */
var defaultsDeep = baseRest(function(args) {
  args.push(undefined, customDefaultsMerge);
  return apply(mergeWith, undefined, args);
});

/**
 * Creates an array of the own and inherited enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keysIn(new Foo);
 * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
 */
function keysIn(object) {
  return isArrayLike(object) ? arrayLikeKeys(object, true) : baseKeysIn(object);
}

/**
 * This method is like `_.merge` except that it accepts `customizer` which
 * is invoked to produce the merged values of the destination and source
 * properties. If `customizer` returns `undefined`, merging is handled by the
 * method instead. The `customizer` is invoked with six arguments:
 * (objValue, srcValue, key, object, source, stack).
 *
 * **Note:** This method mutates `object`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Object
 * @param {Object} object The destination object.
 * @param {...Object} sources The source objects.
 * @param {Function} customizer The function to customize assigned values.
 * @returns {Object} Returns `object`.
 * @example
 *
 * function customizer(objValue, srcValue) {
 *   if (_.isArray(objValue)) {
 *     return objValue.concat(srcValue);
 *   }
 * }
 *
 * var object = { 'a': [1], 'b': [2] };
 * var other = { 'a': [3], 'b': [4] };
 *
 * _.mergeWith(object, other, customizer);
 * // => { 'a': [1, 3], 'b': [2, 4] }
 */
var mergeWith = createAssigner(function(object, source, srcIndex, customizer) {
  baseMerge(object, source, srcIndex, customizer);
});

/**
 * Creates a function that returns `value`.
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Util
 * @param {*} value The value to return from the new function.
 * @returns {Function} Returns the new constant function.
 * @example
 *
 * var objects = _.times(2, _.constant({ 'a': 1 }));
 *
 * console.log(objects);
 * // => [{ 'a': 1 }, { 'a': 1 }]
 *
 * console.log(objects[0] === objects[1]);
 * // => true
 */
function constant(value) {
  return function() {
    return value;
  };
}

/**
 * This method returns the first argument it receives.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Util
 * @param {*} value Any value.
 * @returns {*} Returns `value`.
 * @example
 *
 * var object = { 'a': 1 };
 *
 * console.log(_.identity(object) === object);
 * // => true
 */
function identity(value) {
  return value;
}

/**
 * This method returns `false`.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {boolean} Returns `false`.
 * @example
 *
 * _.times(2, _.stubFalse);
 * // => [false, false]
 */
function stubFalse() {
  return false;
}

module.exports = defaultsDeep;

},{}],4:[function(require,module,exports){
!function(){"use strict";var f,p="roperties",c="ropertyDescriptors",t="static",a="onfiguration",s="p"+p,l="deepP"+p,y="p"+c,d=t+"P"+p,m=t+"DeepP"+p,v=t+"P"+c,h="c"+a,P="deepC"+a,_="deepProps",b="deepStatics",g="deepConf",O="initializers",w="methods",A="composers",D="compose",r="object",S="length",n=Object,j=Array.isArray,x=n.defineProperties,C=n.defineProperty,N=n.getOwnPropertyDescriptor,e=n.getOwnPropertySymbols,z=Array.prototype,o=z.concat,E=z.slice;function I(t){return n.getOwnPropertyNames(t).concat(e?e(t):[])}function i(t,r){return E.call(arguments,2).reduce(t,r)}var R=i.bind(0,function t(r,n){if(n)for(var e,o=I(n),i=0;i<o.length;i+=1)e=N(n,o[i]),C(r,o[i],e);return r});function V(t){return"function"==typeof t}function k(t){return t&&typeof t==r||V(t)}function q(t){return t&&typeof t==r&&t.__proto__==n.prototype}var B=i.bind(0,function t(r,n){if(n===f)return r;if(j(n))return(j(r)?r:[]).concat(n);if(!q(n))return n;for(var e,o,i=I(n),u=0;u<i[S];)e=i[u++],(o=N(n,e)).hasOwnProperty("value")?o.value!==f&&(r[e]=t(q(r[e])||j(n[e])?r[e]:{},n[e])):C(r,e,o);return r});function F(){return(p=o.apply([],arguments).filter(function(t,r,n){return V(t)&&n.indexOf(t)===r}))[S]?p:f}function u(t){return p=function t(){return function t(r){var n,e,o=t[D]||{},i={__proto__:o[w]},u=o[O],p=E.apply(arguments),c=o[l];if(c&&B(i,c),(c=o[s])&&R(i,c),(c=o[y])&&x(i,c),!u||!u[S])return i;for(r===f&&(r={}),o=0;o<u[S];)V(n=u[o++])&&(i=(e=n.call(i,r,{instance:i,stamp:t,args:p}))===f?i:e);return i}}(),(c=t[m])&&B(p,c),(c=t[d])&&R(p,c),(c=t[v])&&x(p,c),c=V(p[D])?p[D]:H,R(p[D]=function(){return c.apply(this,arguments)},t),p}function G(n,e){function t(t,r){k(e[t])&&(k(n[t])||(n[t]={}),(r||R)(n[t],e[t]))}function r(t){(p=F(n[t],e[t]))&&(n[t]=p)}return e&&k(e=e[D]||e)&&(t(w),t(s),t(l,B),t(y),t(d),t(m,B),t(v),t(h),t(P,B),r(O),r(A)),n}function H(){return u(o.apply([this],arguments).reduce(G,{}))}function J(t){return V(t)&&V(t[D])}var K={};function L(t,r){return function(){return(a={})[t]=r.apply(f,o.apply([{}],arguments)),((p=this)&&p[D]||c).call(p,a)}}K[w]=L(w,R),K[s]=K.props=L(s,R),K[O]=K.init=L(O,F),K[A]=L(A,F),K[l]=K[_]=L(l,B),K[d]=K.statics=L(d,R),K[m]=K[b]=L(m,B),K[h]=K.conf=L(h,R),K[P]=K[g]=L(P,B),K[y]=L(y,R),K[v]=L(v,R),c=K[D]=R(function t(){for(var r,n,e=0,o=[],i=arguments,u=this;e<i[S];)k(r=i[e++])&&o.push(J(r)?r:((a={})[w]=(n=r)[w]||f,c=n.props,a[s]=k((p=n[s])||c)?R({},c,p):f,a[O]=F(n.init,n[O]),a[A]=F(n[A]),c=n[_],a[l]=k((p=n[l])||c)?B({},c,p):f,a[y]=n[y],c=n.statics,a[d]=k((p=n[d])||c)?R({},c,p):f,c=n[b],a[m]=k((p=n[m])||c)?B({},c,p):f,p=n[v],a[v]=k((c=n.name&&{name:{value:n.name}})||p)?R({},p,c):f,c=n.conf,a[h]=k((p=n[h])||c)?R({},c,p):f,c=n[g],a[P]=k((p=n[P])||c)?B({},c,p):f,a));if(r=H.apply(u||z,o),u&&o.unshift(u),j(i=r[D][A]))for(e=0;e<i[S];)r=J(u=i[e++]({stamp:r,composables:o}))?u:r;return r},K),K["create"]=function(){return this.apply(f,arguments)},(a={})[d]=K,z=H(a),c[D]=c.bind(),c.version="4.3.1",typeof f!=typeof module?module.exports=c:self.stampit=c}();

},{}],5:[function(require,module,exports){
'use strict'

class MoyskladError extends Error {
  constructor (message) {
    super(message)
    this.name = this.constructor.name
    /* istanbul ignore else  */
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }
  }
}

class MoyskladRequestError extends MoyskladError {
  constructor (message, response) {
    super(message)

    if (response) {
      this.url = response.url
      this.status = response.status
      this.statusText = response.statusText
    }
  }
}

class MoyskladApiError extends MoyskladRequestError {
  constructor (errors, response) {
    const error = errors[0]
    const message = error.error

    super(message, response)

    this.code = error.code
    this.moreInfo = error.moreInfo
    if (error.line != null) this.line = error.line
    if (error.column != null) this.column = error.column
    this.errors = errors
  }
}

module.exports = {
  MoyskladError,
  MoyskladRequestError,
  MoyskladApiError
}

},{}],6:[function(require,module,exports){
'use strict'

const getEnvVar = require('./getEnvVar')

const DEFAULT_VERSIONS = {
  remap: '1.2',
  phone: '1.0',
  posap: '1.0',
  'moysklad/loyalty': '1.0'
}

const ENV_KEY = {
  remap: 'REMAP',
  phone: 'PHONE',
  posap: 'POSAP',
  'moysklad/loyalty': 'LOYALTY'
}

function getApiDefaultVersion (api) {
  if (!api) return null

  const apiVersion = DEFAULT_VERSIONS[api]
  const envKey = ENV_KEY[api] || api.replace(/\W/g, '_').toUpperCase()
  const envName = `MOYSKLAD_${envKey}_API_VERSION`

  return getEnvVar(envName) || apiVersion
}

module.exports = getApiDefaultVersion

},{"./getEnvVar":7}],7:[function(require,module,exports){
'use strict'

/**
 * Получить значение переменной окружения
 * @param {string} key Наименоване переменной окружения
 * @param {string} defaultValue Наименоване переменной окружения
 * @returns {string | null} Значение переменной окружения
 */
function getEnvVar (key, defaultValue) {
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key]
  } else if (typeof window !== 'undefined' && window[key] != null) {
    return window[key]
  } else if (typeof global !== 'undefined' && global[key] != null) {
    return global[key]
  } else {
    return defaultValue !== undefined ? defaultValue : null
  }
}

module.exports = getEnvVar

},{}],8:[function(require,module,exports){
'use strict'

const { MoyskladApiError } = require('./errors')

module.exports = function getResponseError (responseBody, response) {
  let errors

  if (!responseBody) return null

  if (responseBody instanceof Array) {
    errors = responseBody
      .filter(item => item.errors)
      .map(errItem => errItem.errors)
      .reduce((res, errors) => res.concat(errors), [])
  } else if (responseBody.errors) {
    errors = responseBody.errors
  }

  return errors && errors.length ? new MoyskladApiError(errors, response) : null
}

},{"./errors":5}],9:[function(require,module,exports){
'use strict'

const have = require('have2')
const matchers = require('./matchers')

module.exports = have.with(matchers)

},{"./matchers":11,"have2":2}],10:[function(require,module,exports){
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
const { MoyskladError } = require('./errors')
const getApiDefaultVersion = require('./getApiDefaultVersion')

// methods
const getTimeString = require('./tools/getTimeString')
const parseTimeString = require('./tools/parseTimeString')
const getAuthHeader = require('./methods/getAuthHeader')
const buildUrl = require('./methods/buildUrl')
const parseUrl = require('./methods/parseUrl')
const fetchUrl = require('./methods/fetchUrl')
const GET = require('./methods/GET')
const POST = require('./methods/POST')
const PUT = require('./methods/PUT')
const DELETE = require('./methods/DELETE')

// TODO Remove old methods
module.exports = stampit({
  methods: {
    getAuthHeader,
    buildUrl,
    /* istanbul ignore next */
    buildUri (...args) {
      console.log('Warning: метод buildUri переименован в buildUrl')
      return this.buildUrl(...args)
    },
    parseUrl,
    /* istanbul ignore next */
    parseUri (...args) {
      console.log('Warning: метод parseUri переименован в parseUrl')
      return this.parseUrl(...args)
    },
    fetchUrl,
    /* istanbul ignore next */
    fetchUri (...args) {
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
    parseTimeString
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
      throw new Error(
        'Нельзя выполнить http запрос, т.к. при инициализации' +
          ' экземпляра библиотеки не указан Fetch API модуль' +
          ' (cм. подробнее https://github.com/wmakeev/moysklad#Установка).'
      )
    }
  }

  if (options.emitter) {
    this.emitter = options.emitter
  }

  const _options = Object.assign(
    {
      endpoint: 'https://online.moysklad.ru/api',
      api: 'remap'
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
})

},{"./errors":5,"./getApiDefaultVersion":6,"./have":9,"./methods/DELETE":12,"./methods/GET":13,"./methods/POST":14,"./methods/PUT":15,"./methods/buildUrl":16,"./methods/fetchUrl":17,"./methods/getAuthHeader":18,"./methods/parseUrl":19,"./tools/getTimeString":22,"./tools/parseTimeString":28,"stampit":4}],11:[function(require,module,exports){
'use strict'

const UUID_REGEX = /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/

const urlMatcher = url => typeof url === 'string' && url.substring(0, 8) === 'https://'
const uuidMatcher = uuid => typeof uuid === 'string' && UUID_REGEX.test(uuid)

// TODO Убедиться что указан необходимый минимум полей для сущностей
module.exports = {
  entity: ent => !!(ent && ent.id && uuidMatcher(ent.id) && ent.meta && ent.meta.type),
  uuid: uuidMatcher,
  url: urlMatcher,
  // 'uuid/uuid': id => {
  //   if (typeof id !== 'string') { return false }
  //   let [dicId, entId] = id.split('/')
  //   return UUID_REGEX.test(dicId) && UUID_REGEX.test(entId)
  // },
  'Moysklad.Collection': col => !!(col && col.meta && col.meta.type && urlMatcher(col.meta.href) &&
    typeof col.meta.size === 'number')
}

// TODO Проверка типов "Moysklad." на основании модели

},{}],12:[function(require,module,exports){
'use strict'

const have = require('../have')

module.exports = function DELETE (...args) {
  const { path, options = {} } = have.strict(args, [
    { path: 'str or str arr', options: 'opt Object' },
    have.argumentsObject
  ])

  const url = this.buildUrl(path)

  return this.fetchUrl(url, { ...options, method: 'DELETE' })
}

},{"../have":9}],13:[function(require,module,exports){
'use strict'

const have = require('../have')

module.exports = function GET (...args) {
  const { path, query, options = {} } = have.strict(args, [
    { path: 'str or str arr', query: 'opt Object', options: 'opt Object' },
    have.argumentsObject
  ])

  const url = this.buildUrl(path, query)

  return this.fetchUrl(url, { ...options, method: 'GET' })
}

},{"../have":9}],14:[function(require,module,exports){
'use strict'

const have = require('../have')

module.exports = function POST (...args) {
  // TODO Test payload: 'Object or Object arr'
  const { path, payload, query, options = {} } = have.strict(args, [
    {
      path: 'str or str arr',
      payload: 'opt Object or Object arr',
      query: 'opt Object',
      options: 'opt Object'
    },
    have.argumentsObject
  ])

  const url = this.buildUrl(path, query)
  const fetchOptions = { method: 'POST' }
  if (payload) fetchOptions.body = JSON.stringify(payload)

  return this.fetchUrl(url, { ...options, ...fetchOptions })
}

},{"../have":9}],15:[function(require,module,exports){
'use strict'

const have = require('../have')

module.exports = function PUT (...args) {
  const { path, payload, query, options = {} } = have.strict(args, [
    {
      path: 'str or str arr',
      payload: 'opt Object',
      query: 'opt Object',
      options: 'opt Object'
    },
    have.argumentsObject
  ])

  const url = this.buildUrl(path, query)
  const fetchOptions = { method: 'PUT' }
  if (payload) fetchOptions.body = JSON.stringify(payload)

  return this.fetchUrl(url, { ...options, ...fetchOptions })
}

},{"../have":9}],16:[function(require,module,exports){
'use strict'

const have = require('../have')
const buildQuery = require('../tools/buildQuery')
const normalizeUrl = require('../tools/normalizeUrl')

module.exports = function buildUrl (...args) {
  let { url, path, query } = have.strict(args, [
    { url: 'url', query: 'opt Object' },
    { path: 'str or str arr', query: 'opt Object' },
    have.argumentsObject
  ])

  if (url) {
    const parsedUrl = this.parseUrl(url)
    path = parsedUrl.path
    query = {
      ...parsedUrl.query,
      ...query
    }
  }

  const { endpoint, api, apiVersion } = this.getOptions()

  let resultUrl = normalizeUrl([endpoint, api, apiVersion].concat(path).join('/'))

  if (query) {
    const queryString = buildQuery(query)
    resultUrl = resultUrl + (queryString ? `?${queryString}` : '')
  }

  return resultUrl
}

},{"../have":9,"../tools/buildQuery":21,"../tools/normalizeUrl":26}],17:[function(require,module,exports){
'use strict'

const defaultsDeep = require('lodash.defaultsdeep')

const have = require('../have')
const getResponseError = require('../getResponseError')
const { MoyskladRequestError } = require('../errors')

module.exports = async function fetchUrl (url, options = {}) {
  have.strict(arguments, { url: 'url', options: 'opt Object' })

  let resBodyJson, error

  // Специфические параметры (не передаются в опции fetch)
  let rawResponse = false
  let muteErrors = false

  const emit = this.emitter ? this.emitter.emit.bind(this.emitter) : null

  const fetchOptions = defaultsDeep(
    { ...options },
    {
      headers: {
        'Content-Type': 'application/json'
      },
      redirect: 'manual'
    }
  )

  if (!fetchOptions.headers.Authorization) {
    fetchOptions.credentials = 'include'
  }

  // получаем специфичные параметры
  if (fetchOptions.rawResponse) {
    rawResponse = true
    delete fetchOptions.rawResponse
  }
  if (fetchOptions.muteErrors) {
    muteErrors = true
    delete fetchOptions.muteErrors
  }

  // X-Lognex
  if (fetchOptions.millisecond) {
    fetchOptions.headers['X-Lognex-Format-Millisecond'] = 'true'
    delete fetchOptions.millisecond
  }
  if (fetchOptions.precision) {
    fetchOptions.headers['X-Lognex-Precision'] = 'true'
    delete fetchOptions.precision
  }
  if (fetchOptions.webHookDisable) {
    fetchOptions.headers['X-Lognex-WebHook-Disable'] = 'true'
    delete fetchOptions.webHookDisable
  }

  const authHeader = this.getAuthHeader()
  if (authHeader) {
    fetchOptions.headers.Authorization = this.getAuthHeader()
  }

  if (emit) emit('request', { url, options: fetchOptions })

  /** @type {Response} */
  const response = await this.fetch(url, fetchOptions)

  if (emit) emit('response', { url, options: fetchOptions, response })

  if (rawResponse && muteErrors) return response

  // response.ok → res.status >= 200 && res.status < 300
  if (!response.ok) {
    error = new MoyskladRequestError(
      `${response.status} ${response.statusText}`,
      response
    )
  } else if (rawResponse) {
    return response
  }

  // разбираем тело запроса
  if (
    response.headers.has('Content-Type') &&
    response.headers.get('Content-Type').indexOf('application/json') !== -1
  ) {
    // response.json() может вызвать ошибку, если тело ответа пустое
    try {
      resBodyJson = await response.json()
    } catch (e) {}

    if (emit) {
      emit('response:body', {
        url,
        options: fetchOptions,
        response,
        body: resBodyJson
      })
    }
    error = getResponseError(resBodyJson, response) || error
  }

  if (error && !muteErrors) {
    if (emit) emit('error', error)
    throw error
  }

  return rawResponse ? response : resBodyJson
}

},{"../errors":5,"../getResponseError":8,"../have":9,"lodash.defaultsdeep":3}],18:[function(require,module,exports){
'use strict'

const { MoyskladError } = require('../errors')

/* global MOYSKLAD_LOGIN, MOYSKLAD_PASSWORD */
/* eslint no-undef:0 no-unused-vars:0 */

const base64encode = require('@wmakeev/base64encode')

const getEnvVar = require('../getEnvVar')

const bearerAuth = token => `Bearer ${token}`
const basicAuth = (login, password) =>
  'Basic ' + base64encode(`${login}:${password}`)

module.exports = function getAuthHeader () {
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

},{"../errors":5,"../getEnvVar":7,"@wmakeev/base64encode":1}],19:[function(require,module,exports){
'use srict'

const have = require('../have')
const normalizeUrl = require('../tools/normalizeUrl')
const parseQueryString = require('../tools/parseQueryString')

// https://regex101.com/r/yQgvn4/4
const URL_REGEX = /^(https:\/\/.+\/api)\/(.+)\/(\d+\.\d+)\/([^?]+)(?:\?(.+))?$/

module.exports = function parseUrl (...args) {
  const { url, path } = have.strict(args, [
    { url: 'url' },
    { path: 'str or str arr' }
  ])

  let { endpoint, api, apiVersion } = this.getOptions()

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
    throw new Error(
      `parseUrl: Url не соответсвует API МойСклад - ${url || path}`
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

},{"../have":9,"../tools/normalizeUrl":26,"../tools/parseQueryString":27}],20:[function(require,module,exports){
'use strict'

const getTimeString = require('./getTimeString')
const isPlainObject = require('./isPlainObject')
const isSimpleValue = require('./isSimpleValue')

const createValueSelector = selector => (path, value) => {
  if (!isSimpleValue(value)) {
    throw new TypeError('value must to be string, number, date or null')
  }
  return [[path, selector, value]]
}

const createCollectionSelector = selector => {
  const sel = createValueSelector(selector)
  return (path, value) => {
    if (!(value instanceof Array)) {
      throw new TypeError('selector value must to be an array')
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
  res['$' + key] = (op.collection
    ? createCollectionSelector
    : createValueSelector)(op)
  return res
}, {})

// Logical selectors
const invertFilterPart = fp => {
  if (!fp[1].not) {
    throw new Error(`${fp[1].name} not support negation like $not`)
  }
  return [fp[0], fp[1].not, fp[2]]
}

function getFilterParts (path, value) {
  const pathLen = path.length
  const curKey = pathLen ? path[pathLen - 1] : null

  switch (true) {
    // Mongo logical selectors
    case curKey === '$and':
      if (!(value instanceof Array)) {
        throw new TypeError('$and: selector value must to be an array')
      }
      return value.reduce(
        (res, val) => res.concat(getFilterParts(path.slice(0, -1), val)),
        []
      )

    case curKey === '$not':
      if (!isPlainObject(value)) {
        throw new TypeError('$not: selector value must to be an object')
      }
      // .concat([[headPath, selectors.eq, null]])
      return getFilterParts(path.slice(0, -1), value).map(invertFilterPart)

    case curKey === '$exists':
      if (typeof value !== 'boolean') {
        throw new TypeError('$exists: selector value must to be boolean')
      }
      return [[path.slice(0, -1), value ? selectors.ne : selectors.eq, null]]

    // Mongo comparison selectors
    case !!comparisonSelectors[curKey]:
      try {
        return comparisonSelectors[curKey](path.slice(0, -1), value)
      } catch (error) {
        throw new Error(`${curKey}: ${error.message}`)
      }

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

module.exports = function buildFilter (filter) {
  if (!isPlainObject(filter)) {
    throw new TypeError('filter must to be an object')
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

          case typeof value === 'string':
          case typeof value === 'number':
          case typeof value === 'boolean':
            return [key, operator, value]

          default:
            throw new TypeError(`filter field "${key}" value is incorrect`)
        }
      })
      .filter(it => it != null)
      .map(part => `${part[0]}${part[1]}${part[2]}`)
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

},{"./getTimeString":22,"./isPlainObject":24,"./isSimpleValue":25}],21:[function(require,module,exports){
'use strict'

const buildFilter = require('./buildFilter')
const isPlainObject = require('./isPlainObject')

const addQueryPart = (res, key) => val => {
  if (val === null) {
    res.push([key, ''])
  } else if (val === undefined) {
    return undefined
  } else if (['string', 'number', 'boolean'].indexOf(typeof val) === -1) {
    throw new TypeError(
      'url query key value must to be string, number, boolean, null or undefined'
    )
  } else {
    res.push([key, encodeURIComponent(val)])
  }
}

module.exports = function buildQuery (query) {
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
          else throw new TypeError('query.filter must to be string or object')
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

},{"./buildFilter":20,"./isPlainObject":24}],22:[function(require,module,exports){
'use strict'

const getTimezoneFix = require('./getTimezoneFix')

const timezoneFix = getTimezoneFix()

/** Временная зона API МойСклад (часовой пояс в мс) */
const mskTimezone = +3 * 60 * 60 * 1000 // ms

function leftPad1 (num) {
  return `0${num}`.slice(-2)
}

function leftPad2 (num) {
  return `00${num}`.slice(-3)
}

/**
 * Возвращает дату для фильтра в часовом поясе Москвы
 * @param {Date} date Конвертируемая дата
 * @param {Boolean} includeMs Необходимо ли включить миллисекунды в дату
 * @returns {string} Дата ввиде строки
 */
module.exports = function getTimeString (date, includeMs) {
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
    milliseconds !== 0 && includeMs ? `.${leftPad2(milliseconds)}` : ''
  ].join('')
}

},{"./getTimezoneFix":23}],23:[function(require,module,exports){
const { MoyskladError } = require('../errors')
const getEnvVar = require('../getEnvVar')

module.exports = function getTimezoneFix () {
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

},{"../errors":5,"../getEnvVar":7}],24:[function(require,module,exports){
'use strict'

module.exports = function isPlainObject (value) {
  return Object.prototype.toString.call(value) === '[object Object]'
}

},{}],25:[function(require,module,exports){
'use strict'

module.exports = function isSimpleValue (value) {
  return typeof value !== 'object' || value instanceof Date || value === null
}

},{}],26:[function(require,module,exports){
'use strict'

const URI_EXTRA_SLASH_REGEX = /([^:]\/)\/+/g
const TRIM_SLASH = /^\/+|\/+$/g

module.exports = function normalizeUrl (url) {
  return url.replace(TRIM_SLASH, '').replace(URI_EXTRA_SLASH_REGEX, '$1')
}

},{}],27:[function(require,module,exports){
'use strict'

function extractQueryValue (str) {
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

function extractQueryValues (str) {
  return str.indexOf(',') !== -1
    ? str.split(',').map(v => extractQueryValue(v))
    : [extractQueryValue(str)]
}

module.exports = function parseQueryString (queryString) {
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

},{}],28:[function(require,module,exports){
'use strict'

const getTimezoneFix = require('./getTimezoneFix')

const timezoneFix = getTimezoneFix()

// https://regex101.com/r/Bxq7dZ/2
const MS_TIME_REGEX = new RegExp(
  /^(\d{4})-(\d{2})-(\d{2})\s(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?$/
)

function rightPad2 (num) {
  return `${num}00`.slice(0, 3)
}

/**
 * Преобразует строку времени МойСклад в объект даты (с учетом временной зоны)
 * @param {string} timeString Время в формате МойСклад ("2017-04-08 13:33:00.123")
 * @returns {Date} Дата
 */
module.exports = function parseTimeString (timeString) {
  // 2017-04-08 13:33:00.123
  const m = MS_TIME_REGEX.exec(timeString)
  if (!m || m.length < 7 || m.length > 8) {
    throw new Error(`Некорректный формат даты "${timeString}"`)
  }

  const dateExp = `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}${
    m[7] && Number.parseInt(m[7]) !== 0 ? '.' + rightPad2(m[7]) : ''
  }+03:00`

  const date = new Date(dateExp)

  return timezoneFix ? new Date(+date - timezoneFix) : date
}

},{"./getTimezoneFix":23}]},{},[10])(10)
});
