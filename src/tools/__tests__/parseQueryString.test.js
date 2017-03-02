'use strict'

const test = require('blue-tape')
const parseQueryString = require('../parseQueryString')

test('parseQueryString', t => {
  t.ok(parseQueryString)

  t.equal(parseQueryString(), undefined, 'should return undefined with undefined')
  t.equal(parseQueryString(null), undefined, 'should return undefined with null')
  t.equal(parseQueryString(''), undefined, 'should return undefined with empty string')
  t.equal(parseQueryString(' '), undefined, 'should return undefined with space string')

  t.deepEqual(
    parseQueryString('a=1&b=tow&c=true'),
    { a: 1, b: 'tow', c: true },
    'should parse simple query')

  t.deepEqual(
    parseQueryString('a=1&b=3three&a=tow&c=three &e=qwerty%20123%20&foo.bar= baz&a=&a=4,,five&' +
      'bool=true&f=&notBool= true'),
    {
      a: [1, 'tow', null, 4, null, 'five'],
      b: '3three',
      c: 'three ',
      e: 'qwerty 123 ',
      'foo.bar': ' baz',
      bool: true,
      notBool: ' true',
      f: null
    },
    'should parse complex query')

  t.end()
})
