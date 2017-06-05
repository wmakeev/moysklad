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
//# sourceMappingURL=parseUrl.js.map