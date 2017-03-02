'use strict'

const stampit = require('stampit')
const loadPositions = require('../tools/loadPositions')
const loadRows = require('../tools/loadRows')

module.exports = stampit({
  methods: {
    loadPositions: function (...args) {
      return loadPositions(this, ...args)
    },
    loadRows: function (...args) {
      return loadRows(this, ...args)
    }
  }
})
