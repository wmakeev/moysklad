'use strict'

const test = require('blue-tape')
const normalizeUrl = require('../normalizeUrl')

test('normalizeUrl', t => {
  t.ok(normalizeUrl)

  t.equal(normalizeUrl('//Path/to//Some/'), 'path/to/some')
  t.equal(normalizeUrl('Path/to//Some///'), 'path/to/some')
  t.equal(normalizeUrl('///Path////to/Some'), 'path/to/some')
  t.equal(normalizeUrl('http:///Path////to/Some'), 'http://path/to/some')
  t.equal(normalizeUrl('abc:///Path////to /Some'), 'abc://path/to /some')

  t.end()
})
