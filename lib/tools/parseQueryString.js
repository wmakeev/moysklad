'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function extractQueryValue(str) {
  if (str === '') {
    return null;
  }
  var asBool = Boolean(str);
  if (asBool.toString() === str) {
    return asBool;
  }

  var asNum = parseInt(str);
  if (asNum.toString() === str) {
    return asNum;
  }

  return decodeURIComponent(str);
}

function extractQueryValues(str) {
  return str.indexOf(',') !== -1 ? str.split(',').map(function (v) {
    return extractQueryValue(v);
  }) : [extractQueryValue(str)];
}

module.exports = function parseQueryString(queryString) {
  if (queryString == null || queryString === '') {
    return void 0;
  }
  queryString = queryString.trim();
  if (!queryString) {
    return void 0;
  }

  var kvMap = queryString.split('&').reduce(function (res, queryPart) {
    var kv = queryPart.split('=');
    var key = kv[0];
    var value = extractQueryValues(kv[1]);
    var resValue = res.get(key);
    return res.set(key, resValue ? resValue.concat(value) : value);
  }, new Map());

  var result = {};
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = kvMap.entries()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var entry = _step.value;

      var _entry = _slicedToArray(entry, 2),
          key = _entry[0],
          value = _entry[1];

      result[key] = value.length > 1 ? value : value[0];
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  return result;
};
//# sourceMappingURL=parseQueryString.js.map