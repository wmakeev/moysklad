'use strict';

var have = require('../have');
var buildQuery = require('../tools/buildQuery');
var normalizeUrl = require('../tools/normalizeUrl');

module.exports = function buildUri() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  var _have$strict = have.strict(args, [{ path: 'str or str arr', query: 'opt Object' }, have.argumentsObject]),
      path = _have$strict.path,
      query = _have$strict.query;

  var _getOptions = this.getOptions(),
      endpoint = _getOptions.endpoint,
      api = _getOptions.api,
      apiVersion = _getOptions.apiVersion;

  var uri = [endpoint, api, apiVersion].concat(path).join('/');

  uri = normalizeUrl(uri);

  if (query) {
    uri = uri + '?' + buildQuery(query);
  }

  return uri;
};
//# sourceMappingURL=buildUri.js.map