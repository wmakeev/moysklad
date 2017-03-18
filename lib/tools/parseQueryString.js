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
//# sourceMappingURL=parseQueryString.js.map