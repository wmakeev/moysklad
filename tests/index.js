'use strict'

const walk = require('walkdir')

const TEST_FILES_PATTERN = /.+\.test\.js$/i

walk.sync(__dirname, function (path, stat) {
  if (TEST_FILES_PATTERN.test(path)) {
    require(path)
  }
})
