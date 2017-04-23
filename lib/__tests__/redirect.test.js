'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const test = require('blue-tape');
const nodeFetch = require('node-fetch');
const Moysklad = require('..');

test('Array response with muted errors', (() => {
  var _ref = _asyncToGenerator(function* (t) {
    const ms = Moysklad({
      fetch: nodeFetch
    });

    let body = {
      template: {
        meta: {
          href: 'https://online.moysklad.ru/api/remap/1.1/entity/demand/metadata/customtemplate/' + '8a686b8a-9e4a-11e5-7a69-97110004af3e',
          type: 'customtemplate',
          mediaType: 'application/json'
        }
      },
      extension: 'html'
    };

    var _ref2 = yield ms.POST('entity/demand/773e16c5-ef53-11e6-7a69-9711001669c5/export/', body, null, {
      includeHeaders: true,
      muteErrors: true
    }),
        _ref3 = _slicedToArray(_ref2, 3);

    let headers = _ref3[0],
        result = _ref3[1],
        response = _ref3[2];


    t.ok(headers.get, 'headers should have get method');
    t.ok(/https:\/\/120708.selcdn.ru\/prod-files/.test(headers.get('location')), 'headers Location header should contain url to from');
    t.equal(result, undefined, 'result should to be undefined');
    t.equal(response.status, 307, 'response.status should to be 307');
  });

  return function (_x) {
    return _ref.apply(this, arguments);
  };
})());
//# sourceMappingURL=redirect.test.js.map