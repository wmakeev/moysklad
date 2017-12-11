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
    let queryString = buildQuery(query);
    resultUrl = resultUrl + (queryString ? `?${queryString}` : '');
  }

  return resultUrl;
};
//# sourceMappingURL=buildUrl.js.map