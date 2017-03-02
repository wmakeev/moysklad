'use strict'

/* eslint brace-style:0 */
/* global DEBUG, debug */

const have = require('../../have')
const sleep = require('../../tools/sleep')

class Action {
  /**
   * Создание Action
   * @param {number} id Идентификатор
   * @param {function(): Promise<any>} task Задача
   * @param {function} cb callback
   */
  constructor (id, task, cb) {
    this.id = id
    this.action = cb => task()
      .then(result => cb(null, result))
      .catch(err => cb(err))
    this.cb = cb
  }
}

class Queue {
  /**
   * Создание Queue
   * @param {object} options Параметры очереди
   */
  constructor (options = {}) {
    have.strict(options, {
      constraintPeriod: 'opt num',
      tasksPerPeriod: 'opt num',
      parallelTaskCount: 'opt num'
    })

    let {
      constraintPeriod = 1000, tasksPerPeriod = 5, parallelTaskCount = 2
    } = options

    /** @type {number} Период на который накладывается ограничение по кол-ву задач (мс) */
    this.constraintPeriod = constraintPeriod

    /** @type {number} Кол-во задач допустимых за период */
    this.tasksPerPeriod = tasksPerPeriod

    /** @type {number} Макс. допустимое кол-во параллельно выполняемых задач */
    this.parallelTaskCount = parallelTaskCount

    /** @type {number} Последний id задачи */
    this._lastTaskId = 0

    /** @type {Array<number>} Моменты времени завершения прошлых задач */
    this._timeline = []

    /** @type {number} Кол-во задач ожидающих выполнения */
    this._tasksInProgress = 0

    /** @type {Array<Action>} Очередь задач */
    this._actionsQueue = []
  }

  /**
   * Выполняет задачу в рамках очереди
   * @param {function(): Promise<any>} task task to be wrapped
   * @returns {Promise<any>} Результат задачи
   */
  processTask (task) {
    if (typeof DEBUG !== 'undefined') {
      debug(`processTask#${task ? '(task)' : '()'}: tasksInProgress - ${this._tasksInProgress} | ` +
        `actionsQueue - ${this._actionsQueue.length}`)
    }

    if (task) {
      if (typeof task !== 'function') {
        throw new Error('processTask: `task` argument must to be function')
      }
      let taskResult = new Promise((resolve, reject) => {
        this._actionsQueue.push(
          new Action(++this._lastTaskId, task, (err, result) =>
            err ? reject(err) : resolve(result)))
      })
      this.processTask()
      return taskResult
    }

    if (this._tasksInProgress < this.parallelTaskCount && this._actionsQueue.length > 0) {
      let curTime = Date.now()

      while (this._timeline.length) {
        // -r1-r2-[-r3--r4-r5----------*]
        if (curTime - this._timeline[0] > this.constraintPeriod) {
          this._timeline.shift()
        }
        // -------[-r3--r4-r5----------*]
        else {
          break
        }
      }

      if (typeof DEBUG !== 'undefined') {
        debug(`timeline - ${JSON.stringify(this._timeline)}`)
      }

      // ----[r1-r2---r3--r4-r5--*--]
      if (this._timeline.length >= this.tasksPerPeriod) {
        let waitTime = this.constraintPeriod - (curTime - this._timeline[0])
        if (typeof DEBUG !== 'undefined') {
          debug(`tasksInProgress - ${this._tasksInProgress} | waitTime ${waitTime}`)
        }
        sleep(waitTime).then(() => {
          if (typeof DEBUG !== 'undefined') {
            debug(`call processTask after waitTime - ${waitTime}`)
          }
          this.processTask()
        })
        return
      }
      // else
      // ----[r1-r2---r3---------*--]

      let curAction = this._actionsQueue.shift()
      this._tasksInProgress++
      this._timeline.push(Date.now())
      if (typeof DEBUG !== 'undefined') {
        debug(`Start action#${curAction.id} | tasksInProgress - ${this._tasksInProgress} | ` +
          `timeline - ${JSON.stringify(this._timeline)} | ` +
          `actionsQueue - ${this._actionsQueue.length}`)
      }
      curAction.action((err, data) => {
        this._tasksInProgress--
        if (typeof DEBUG !== 'undefined') {
          debug(`Fnish action#${data} | tasksInProgress - ${this._tasksInProgress} | ` +
            `timeline - ${JSON.stringify(this._timeline)} | ` +
            `actionsQueue - ${this._actionsQueue.length}`)
        }
        // this._timeline.push(Date.now())
        this.processTask()
        curAction.cb(err, data)
      })
    } else {
      this._tasksInProgress < this.parallelTaskCount
      if (typeof DEBUG !== 'undefined') {
        debug(`Skip processTask: tasksInProgress - ${this._tasksInProgress} | ` +
        `timeline - ${JSON.stringify(this._timeline)} | ` +
        `actionsQueue - ${this._actionsQueue.length}`)
      }
    }
  }
}

module.exports = Queue
