'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var buildFilter = require('./buildFilter');

module.exports = function buildQuery(query) {
  return Object.keys(query).reduce(function (res, key) {
    var addPart = function addPart(val) {
      if (['string', 'number', 'boolean'].indexOf(typeof val === 'undefined' ? 'undefined' : _typeof(val)) === -1) {
        throw new Error('url query key value must to be string, number or boolean');
      }
      res = res.concat([[key, encodeURIComponent(val)]]);
    };

    if (key === 'filter') {
      addPart(buildFilter(query[key]));
    } else if (query[key] == null) {
      addPart('');
    } else if (query[key] instanceof Array) {
      query[key].forEach(addPart);
    } else {
      addPart(query[key]);
    }

    return res;
  }, []).map(function (kv) {
    return kv[0] + '=' + kv[1];
  }).join('&');
};
//# sourceMappingURL=buildQuery.js.map