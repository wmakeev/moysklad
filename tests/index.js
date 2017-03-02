'use strict'

var walk = require('walkdir')
var parseOpts = require('minimist')

var TEST_FILES_PATTERN = /__tests__[/\\]+.+\.test\.js$/i

var opts = parseOpts(process.argv.slice(2))

if (!opts.src) { throw new Error('Tests source folder not specified. Use --src') }

walk.sync(opts.src, function (path, stat) {
  if (TEST_FILES_PATTERN.test(path)) {
    require(path)
  }
})
