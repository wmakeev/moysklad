'use strict';

var stampit = require('stampit');
var Queue = require('./queue');

var globalQueuePull = new Map();

module.exports = stampit().init(function (options) {
  var login = void 0,
      fetchUri = void 0;

  function fetchUriWithQueue() {
    var _this = this,
        _arguments = arguments;

    var requestTask = function requestTask() {
      return fetchUri.apply(_this, _arguments);
    };

    /** @type {Queue} */
    var accountQueue = globalQueuePull.get(login);

    if (!accountQueue) {
      accountQueue = new Queue();
      globalQueuePull.set(login, accountQueue);
    }

    return accountQueue.processTask(requestTask);
  }

  if (options.queue) {
    login = options.login ? options.login : null;
    fetchUri = this.fetchUri;
    this.fetchUri = fetchUriWithQueue;
  }
});
//# sourceMappingURL=index.js.map