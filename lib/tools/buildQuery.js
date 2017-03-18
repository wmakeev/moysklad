'use strict';

const buildFilter = require('./buildFilter');

module.exports = function buildQuery(query) {
  return Object.keys(query).reduce((res, key) => {
    let addPart = val => {
      if (['string', 'number', 'boolean'].indexOf(typeof val) === -1) {
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
  }, []).map(kv => `${kv[0]}=${kv[1]}`).join('&');
};
//# sourceMappingURL=buildQuery.js.map