'use strict';

var stampit = require('stampit');
var _loadPositions = require('../tools/loadPositions');
var _loadRows = require('../tools/loadRows');

module.exports = stampit({
  methods: {
    loadPositions: function loadPositions() {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return _loadPositions.apply(undefined, [this].concat(args));
    },
    loadRows: function loadRows() {
      for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      return _loadRows.apply(undefined, [this].concat(args));
    }
  }
});
//# sourceMappingURL=loadPositions.js.map