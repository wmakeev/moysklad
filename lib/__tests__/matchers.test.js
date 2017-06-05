'use strict';

const test = require('blue-tape');
const matchers = require('../matchers');

test('matchers', t => {
  t.ok(matchers);

  t.ok(matchers.entity({
    meta: {
      type: 'entity'
    },
    id: '47896027-0e7b-11e2-c959-3c4a92f3a0a7'
  }), 'should match entity');

  t.ok(matchers.uuid('47896027-0e7b-11e2-c959-3c4a92f3a0a7'), 'should match uuid');
  t.false(matchers.uuid('123-456'), 'should *not* match incorrect uuid');
  t.false(matchers.uuid(123), 'should *not* match incorrect uuid');

  t.ok(matchers.url('https://path/to'), 'should match uri');
  t.false(matchers.url('abc://path/to'), 'should *not* match incorrect uri');

  t.ok(matchers['Moysklad.Collection']({
    meta: {
      href: 'https://path/to',
      type: 'entity',
      size: 10
    }
  }), 'should match collection');

  t.end();
});
//# sourceMappingURL=matchers.test.js.map