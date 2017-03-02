'use strict'

const stampit = require('stampit')
const Queue = require('./queue')

let globalQueuePull = new Map()

module.exports = stampit().init(function (options) {
  let login, fetchUri

  function fetchUriWithQueue () {
    let requestTask = () => {
      return fetchUri.apply(this, arguments)
    }

    /** @type {Queue} */
    let accountQueue = globalQueuePull.get(login)

    if (!accountQueue) {
      accountQueue = new Queue()
      globalQueuePull.set(login, accountQueue)
    }

    return accountQueue.processTask(requestTask)
  }

  if (options.queue) {
    login = options.login ? options.login : null
    fetchUri = this.fetchUri
    this.fetchUri = fetchUriWithQueue
  }
})
