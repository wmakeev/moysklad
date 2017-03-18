'use strict';
'use srict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

const have = require('../have');
const normalizeUrl = require('../tools/normalizeUrl');
const parseQueryString = require('../tools/parseQueryString');

const PATH_QUERY_REGEX = /([^?]+)(?:\?(.+))?$/;

module.exports = function parseUri(uri) {
  have.strict(arguments, { uri: 'str' });

  var _getOptions = this.getOptions();

  let endpoint = _getOptions.endpoint,
      api = _getOptions.api,
      apiVersion = _getOptions.apiVersion;


  let baseUri = normalizeUrl([endpoint, api, apiVersion].join('/'));
  if (uri.indexOf(baseUri) !== 0) {
    throw new Error('Uri does not match client settings (endpoint, api, apiVersion)');
  }

  let tail = uri.substring(baseUri.length + 1);

  var _PATH_QUERY_REGEX$exe = PATH_QUERY_REGEX.exec(tail),
      _PATH_QUERY_REGEX$exe2 = _slicedToArray(_PATH_QUERY_REGEX$exe, 3);

  let pathStr = _PATH_QUERY_REGEX$exe2[1],
      queryStr = _PATH_QUERY_REGEX$exe2[2];


  if (!pathStr) {
    throw new Error('Empty uri path');
  }

  let path = normalizeUrl(pathStr).split(/\//g);
  let query = parseQueryString(queryStr);

  // TODO Parse query.filter

  return { endpoint: endpoint, api: api, apiVersion: apiVersion, path: path, query: query };
};
//# sourceMappingURL=parseUri.js.map