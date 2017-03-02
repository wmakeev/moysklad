'use strict';

/* eslint brace-style:0 */
/* global DEBUG, debug */

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var have = require('../../have');
var sleep = require('../../tools/sleep');

var Action =
/**
 * Создание Action
 * @param {number} id Идентификатор
 * @param {function(): Promise<any>} task Задача
 * @param {function} cb callback
 */
function Action(id, task, cb) {
  _classCallCheck(this, Action);

  this.id = id;
  this.action = function (cb) {
    return task().then(function (result) {
      return cb(null, result);
    }).catch(function (err) {
      return cb(err);
    });
  };
  this.cb = cb;
};

var Queue = function () {
  /**
   * Создание Queue
   * @param {object} options Параметры очереди
   */
  function Queue() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Queue);

    have.strict(options, {
      constraintPeriod: 'opt num',
      tasksPerPeriod: 'opt num',
      parallelTaskCount: 'opt num'
    });

    var _options$constraintPe = options.constraintPeriod,
        constraintPeriod = _options$constraintPe === undefined ? 1000 : _options$constraintPe,
        _options$tasksPerPeri = options.tasksPerPeriod,
        tasksPerPeriod = _options$tasksPerPeri === undefined ? 5 : _options$tasksPerPeri,
        _options$parallelTask = options.parallelTaskCount,
        parallelTaskCount = _options$parallelTask === undefined ? 2 : _options$parallelTask;

    /** @type {number} Период на который накладывается ограничение по кол-ву задач (мс) */

    this.constraintPeriod = constraintPeriod;

    /** @type {number} Кол-во задач допустимых за период */
    this.tasksPerPeriod = tasksPerPeriod;

    /** @type {number} Макс. допустимое кол-во параллельно выполняемых задач */
    this.parallelTaskCount = parallelTaskCount;

    /** @type {number} Последний id задачи */
    this._lastTaskId = 0;

    /** @type {Array<number>} Моменты времени завершения прошлых задач */
    this._timeline = [];

    /** @type {number} Кол-во задач ожидающих выполнения */
    this._tasksInProgress = 0;

    /** @type {Array<Action>} Очередь задач */
    this._actionsQueue = [];
  }

  /**
   * Выполняет задачу в рамках очереди
   * @param {function(): Promise<any>} task task to be wrapped
   * @returns {Promise<any>} Результат задачи
   */


  _createClass(Queue, [{
    key: 'processTask',
    value: function processTask(task) {
      var _this = this;

      if (typeof DEBUG !== 'undefined') {
        debug('processTask#' + (task ? '(task)' : '()') + ': tasksInProgress - ' + this._tasksInProgress + ' | ' + ('actionsQueue - ' + this._actionsQueue.length));
      }

      if (task) {
        if (typeof task !== 'function') {
          throw new Error('processTask: `task` argument must to be function');
        }
        var taskResult = new Promise(function (resolve, reject) {
          _this._actionsQueue.push(new Action(++_this._lastTaskId, task, function (err, result) {
            return err ? reject(err) : resolve(result);
          }));
        });
        this.processTask();
        return taskResult;
      }

      if (this._tasksInProgress < this.parallelTaskCount && this._actionsQueue.length > 0) {
        var _ret = function () {
          var curTime = Date.now();

          while (_this._timeline.length) {
            // -r1-r2-[-r3--r4-r5----------*]
            if (curTime - _this._timeline[0] > _this.constraintPeriod) {
              _this._timeline.shift();
            }
            // -------[-r3--r4-r5----------*]
            else {
                break;
              }
          }

          if (typeof DEBUG !== 'undefined') {
            debug('timeline - ' + JSON.stringify(_this._timeline));
          }

          // ----[r1-r2---r3--r4-r5--*--]
          if (_this._timeline.length >= _this.tasksPerPeriod) {
            var _ret2 = function () {
              var waitTime = _this.constraintPeriod - (curTime - _this._timeline[0]);
              if (typeof DEBUG !== 'undefined') {
                debug('tasksInProgress - ' + _this._tasksInProgress + ' | waitTime ' + waitTime);
              }
              sleep(waitTime).then(function () {
                if (typeof DEBUG !== 'undefined') {
                  debug('call processTask after waitTime - ' + waitTime);
                }
                _this.processTask();
              });
              return {
                v: {
                  v: void 0
                }
              };
            }();

            if ((typeof _ret2 === 'undefined' ? 'undefined' : _typeof(_ret2)) === "object") return _ret2.v;
          }
          // else
          // ----[r1-r2---r3---------*--]

          var curAction = _this._actionsQueue.shift();
          _this._tasksInProgress++;
          _this._timeline.push(Date.now());
          if (typeof DEBUG !== 'undefined') {
            debug('Start action#' + curAction.id + ' | tasksInProgress - ' + _this._tasksInProgress + ' | ' + ('timeline - ' + JSON.stringify(_this._timeline) + ' | ') + ('actionsQueue - ' + _this._actionsQueue.length));
          }
          curAction.action(function (err, data) {
            _this._tasksInProgress--;
            if (typeof DEBUG !== 'undefined') {
              debug('Fnish action#' + data + ' | tasksInProgress - ' + _this._tasksInProgress + ' | ' + ('timeline - ' + JSON.stringify(_this._timeline) + ' | ') + ('actionsQueue - ' + _this._actionsQueue.length));
            }
            // this._timeline.push(Date.now())
            _this.processTask();
            curAction.cb(err, data);
          });
        }();

        if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
      } else {
        this._tasksInProgress < this.parallelTaskCount;
        if (typeof DEBUG !== 'undefined') {
          debug('Skip processTask: tasksInProgress - ' + this._tasksInProgress + ' | ' + ('timeline - ' + JSON.stringify(this._timeline) + ' | ') + ('actionsQueue - ' + this._actionsQueue.length));
        }
      }
    }
  }]);

  return Queue;
}();

module.exports = Queue;
//# sourceMappingURL=queue.js.map