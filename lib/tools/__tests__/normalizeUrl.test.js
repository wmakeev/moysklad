'use strict';

var test = require('blue-tape');
var normalizeUrl = require('../normalizeUrl');

test('normalizeUrl', function (t) {
  t.ok(normalizeUrl);

  t.equal(normalizeUrl('//Path/to//Some/'), 'path/to/some');
  t.equal(normalizeUrl('Path/to//Some///'), 'path/to/some');
  t.equal(normalizeUrl('///Path////to/Some'), 'path/to/some');

  t.end();
});
//# sourceMappingURL=normalizeUrl.test.js.map