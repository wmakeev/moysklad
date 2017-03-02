'use strict'

const test = require('blue-tape')
const normalizeUrl = require('../normalizeUrl')

test('normalizeUrl', t => {
  t.ok(normalizeUrl)

  t.equal(normalizeUrl('//Path/to//Some/'), 'path/to/some')
  t.equal(normalizeUrl('Path/to//Some///'), 'path/to/some')
  t.equal(normalizeUrl('///Path////to/Some'), 'path/to/some')

  t.end()
})
