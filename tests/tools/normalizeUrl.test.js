'use strict'

const test = require('tape')
const normalizeUrl = require('../../tools/normalizeUrl')

test('normalizeUrl', t => {
  t.ok(normalizeUrl)

  t.equal(normalizeUrl('//Path/to//Some/'), 'Path/to/Some')
  t.equal(normalizeUrl('Path/to//Some///'), 'Path/to/Some')
  t.equal(normalizeUrl('///Path////to/Some'), 'Path/to/Some')
  t.equal(normalizeUrl('http:///Path////to/Some'), 'http://Path/to/Some')
  t.equal(normalizeUrl('abc:///Path////to /Some'), 'abc://Path/to /Some')

  t.end()
})
