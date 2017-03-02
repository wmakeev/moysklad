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
        pages,
        _collection$meta,
        size,
        limit,
        offset,
        href,
        rows,
        _args = arguments;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _have = have(_args, [{ client: 'Object', collection: 'Moysklad.Collection', query: 'opt obj' }, have.argumentsObject]), client = _have.client, collection = _have.collection, _have$query = _have.query, query = _have$query === undefined ? {} : _have$query;

            // TODO Коллекция может быть не загружена!

            if (collection.meta.nextHref) {
              _context.next = 3;
              break;
            }

            return _context.abrupt('return', collection.rows);

          case 3:
            pages = [collection];
            _collection$meta = collection.meta, size = _collection$meta.size, limit = _collection$meta.limit, offset = _collection$meta.offset;
            href = client.parseUri(collection.meta.href);


            offset += limit;

            if (!(query.limit != null)) {
              _context.next = 11;
              break;
            }

            if (!(query.limit <= 0)) {
              _context.next = 10;
              break;
            }

            throw new Error('query.limit should be greater then 0');

          case 10:
            limit = query.limit;

          case 11:

            while (size > offset) {
              pages.push(client.GET(href.path, Object.assign({}, href.query || {}, query, { offset: offset })));
              offset += limit;
            }

            _context.next = 14;
            return Promise.all(pages);

          case 14:
            _context.t0 = function (res, pos) {
              return res.concat(pos.rows);
            };

            _context.t1 = [];
            rows = _context.sent.reduce(_context.t0, _context.t1);
            return _context.abrupt('return', rows);

          case 18:
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