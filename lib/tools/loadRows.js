'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var have = require('../have');

module.exports = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
    var _have,
        client,
        collection,
        _have$query,
        query,
        _collection$meta,
        size,
        limit,
        offset,
        href,
        rowsPages,
        cobinedRows,
        _args = arguments;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _have = have(_args, [{ client: 'Object', collection: 'Moysklad.Collection', query: 'opt obj' }, have.argumentsObject]), client = _have.client, collection = _have.collection, _have$query = _have.query, query = _have$query === undefined ? {} : _have$query;
            _collection$meta = collection.meta, size = _collection$meta.size, limit = _collection$meta.limit, offset = _collection$meta.offset;
            href = client.parseUri(collection.meta.href);
            rowsPages = [];

            if (!(collection.rows && collection.rows.length)) {
              _context.next = 8;
              break;
            }

            if (!(size <= limit)) {
              _context.next = 7;
              break;
            }

            return _context.abrupt('return', query.offset ? collection.rows.slice(query.offset) : collection.rows);

          case 7:

            if (query.offset >= limit) {
              offset = query.offset;
            } else {
              rowsPages = [query.offset != null ? collection.rows.slice(query.offset) : collection.rows];
              offset = limit;
            }

          case 8:
            if (!(query.limit != null)) {
              _context.next = 12;
              break;
            }

            if (!(query.limit <= 0)) {
              _context.next = 11;
              break;
            }

            throw new Error('query.limit should be greater then 0');

          case 11:
            limit = query.limit;

          case 12:

            while (size > offset) {
              rowsPages.push(client.GET(href.path, Object.assign({}, href.query, query, { offset: offset, limit: limit })).then(function (col) {
                return col.rows;
              }));
              offset += limit;
            }

            _context.next = 15;
            return Promise.all(rowsPages);

          case 15:
            _context.t0 = function (res, rows) {
              return res.concat(rows);
            };

            _context.t1 = [];
            cobinedRows = _context.sent.
            // TODO Remove Debug
            // .map(pos => {
            //   return pos
            // })
            reduce(_context.t0, _context.t1);
            return _context.abrupt('return', cobinedRows);

          case 19:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  function loadRows() {
    return _ref.apply(this, arguments);
  }

  return loadRows;
}();
//# sourceMappingURL=loadRows.js.map