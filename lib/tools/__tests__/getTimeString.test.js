'use strict';

const test = require('blue-tape');
const getTimeString = require('../getTimeString');

test('getTimeString', t => {
  t.ok(getTimeString);
  t.equals(typeof getTimeString, 'function', 'should be function');
  t.end();
});

test('getTimeString', t => {
  let date1 = new Date('2017-02-01T07:10:11Z');
  let date2 = new Date('2017-02-01T07:10:11.123Z');

  t.equals(getTimeString(date1), '2017-02-01 10:10:11', 'should return time string');

  t.equals(getTimeString(date2), '2017-02-01 10:10:11', 'should return time string');

  t.equals(getTimeString(date1, true), '2017-02-01 10:10:11.000', 'should return time string with ms');

  t.equals(getTimeString(date2, true), '2017-02-01 10:10:11.123', 'should return time string with ms');

  t.end();
});
//# sourceMappingURL=getTimeString.test.js.map