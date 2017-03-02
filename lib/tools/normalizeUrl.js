'use strict';

var URI_EXTRA_SLASH_REGEX = /([^:]\/)\/+/;
var TRIM_SLASH = /^\/+|\/+$/;

module.exports = function normalizeUrl(url) {
  return url.replace(TRIM_SLASH, '').replace(URI_EXTRA_SLASH_REGEX, '$1').toLowerCase();
};
//# sourceMappingURL=normalizeUrl.js.map