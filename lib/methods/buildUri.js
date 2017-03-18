'use strict';

const have = require('../have');
const buildQuery = require('../tools/buildQuery');
const normalizeUrl = require('../tools/normalizeUrl');

module.exports = function buildUri() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  var _have$strict = have.strict(args, [{ path: 'str or str arr', query: 'opt Object' }, have.argumentsObject]);

  let path = _have$strict.path,
      query = _have$strict.query;

  var _getOptions = this.getOptions();

  let endpoint = _getOptions.endpoint,
      api = _getOptions.api,
      apiVersion = _getOptions.apiVersion;


  let uri = [endpoint, api, apiVersion].concat(path).join('/');

  uri = normalizeUrl(uri);

  if (query) {
    uri = `${uri}?${buildQuery(query)}`;
  }

  return uri;
};
//# sourceMappingURL=buildUri.js.map