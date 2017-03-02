'use strict';

var getTimeString = require('./getTimeString');
var isObject = require('./isObject');
var isSimpleValue = require('./isSimpleValue');

var createValueSelector = function createValueSelector(selector) {
  return function (path, value) {
    if (!isSimpleValue(value)) {
      throw new Error('value must to be string, number, date or null');
    }
    return [[path, selector, value]];
  };
};

var createCollectionSelector = function createCollectionSelector(selector) {
  var sel = createValueSelector(selector);
  return function (path, value) {
    if (!(value instanceof Array)) {
      throw new Error('selector value must to be an array');
    }
    return value.reduce(function (res, v) {
      return res.concat(sel(path, v));
    }, []);
  };
};

// Comparison selectors
var selectors = {
  eq: { operator: '=' },
  gt: { operator: '>' },
  gte: { operator: '>=' },
  lt: { operator: '<' },
  lte: { operator: '>=' },
  ne: { operator: '!=' },
  in: { operator: '=', collection: true },
  nin: { operator: '!=', collection: true }
};

selectors.eq.not = selectors.ne;
selectors.gt.not = selectors.lte;
selectors.gte.not = selectors.lt;
selectors.lt.not = selectors.gte;
selectors.lte.not = selectors.gt;
selectors.ne.not = selectors.eq;
selectors.in.not = selectors.nin;
selectors.nin.not = selectors.in;

var comparisonSelectors = Object.keys(selectors).reduce(function (res, key) {
  var op = selectors[key];
  res['$' + key] = (op.collection ? createCollectionSelector : createValueSelector)(op);
  return res;
}, {});

// Logical selectors
var invertFilterPart = function invertFilterPart(fp) {
  return [fp[0], fp[1].not, fp[2]];
};

function getFilterParts(path, value) {
  var pathLen = path.length;
  var curKey = pathLen ? path[pathLen - 1] : null;

  switch (true) {
    // Mongo logical selectors
    case curKey === '$and':
      if (!(value instanceof Array)) {
        throw new Error('$and: selector value must to be an array');
      }
      return value.reduce(function (res, val) {
        return res.concat(getFilterParts(path.slice(0, -1), val));
      }, []);

    case curKey === '$not':
      if (!isObject(value)) {
        throw new Error('$not: selector value must to be an object');
      }
      var headPath = path.slice(0, -1);
      return getFilterParts(headPath, value).map(invertFilterPart).concat([[headPath, selectors.eq, null]]);

    case curKey === '$exists':
      if (typeof value !== 'boolean') {
        throw new Error('$exists: elector value must to be boolean');
      }
      return [[path.slice(0, -1), selectors.ne, null]];

    // Mongo comparison selectors
    case !!comparisonSelectors[curKey]:
      var parts = void 0;
      try {
        parts = comparisonSelectors[curKey](path.slice(0, -1), value);
      } catch (error) {
        throw new Error(curKey + ': ' + error.message);
      }
      return parts;

    // Array
    case value instanceof Array:
      return value.reduce(function (res, val) {
        return res.concat(getFilterParts(path, val));
      }, []);

    // Object
    case !isSimpleValue(value):
      return Object.keys(value).reduce(function (res, key) {
        return res.concat(getFilterParts(path.concat(key), value[key]));
      }, []);

    // some other value
    default:
      return [[path, selectors.eq, value]];
  }
}

module.exports = function buildFilter(filter) {
  if (!isObject(filter)) {
    throw new Error('filter must to be an object');
  }

  var filterParts = getFilterParts([], filter);

  // преобразование ключа в строку
  filterParts = filterParts.map(function (part) {
    return [part[0].join('.'), part[1], part[2]];
  });

  return filterParts
  // конвертация операторов и значений в строку
  .map(function (part) {
    var key = part[0];
    var operator = part[1].operator;
    var value = part[2];
    switch (true) {
      case value === undefined:
        throw new Error('filter "' + key + '" key value is undefined');

      case value === null:
        return [key, operator, ''];

      case value instanceof Date:
        return [key, operator, getTimeString(value)];

      case typeof value === 'string':
      case typeof value === 'number':
        return [key, operator, value];

      default:
        throw new Error('filter "' + key + '" key value is incorrect');
    }
  }).map(function (part) {
    return '' + part[0] + part[1] + part[2];
  }).sort(function (p1, p2) {
    if (p1 > p2) {
      return 1;
    }
    if (p1 < p2) {
      return -1;
    }
    return 0;
  }).join(';');
};
//# sourceMappingURL=buildFilter.js.map