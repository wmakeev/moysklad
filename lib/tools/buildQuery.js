'use strict';

const buildFilter = require('./buildFilter');
const isPlainObject = require('./isPlainObject');

module.exports = function buildQuery(query) {
  return Object.keys(query).reduce((res, key) => {
    let addPart = val => {
      if (['string', 'number', 'boolean'].indexOf(typeof val) === -1) {
        throw new Error('url query key value must to be string, number or boolean');
      }
      res = res.concat([[key, encodeURIComponent(val)]]);
    };

    switch (true) {
      case key === 'filter':
        if (isPlainObject(query.filter)) addPart(buildFilter(query.filter));else if (typeof query.filter === 'string') addPart(query.filter);else throw new Error('filter must to be string or object');
        break;

      case query[key] == null:
        addPart('');
        break;

      case query[key] instanceof Array:
        query[key].forEach(addPart);
        break;

      default:
        addPart(query[key]);
    }

    return res;
  }, []).map(kv => `${kv[0]}=${kv[1]}`).join('&');
};
//# sourceMappingURL=buildQuery.js.map