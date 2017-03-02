'use strict';

// const debug = require('debug')

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var test = require('blue-tape');
var Queue = require('../queue');
var sleep = require('../../../tools/sleep');

// TODO remove
// process.env.DEBUG = 'queue'
// global.DEBUG = true

// let debugLog = []
// global.debug = function (msg) {
//   debugLog.push(msg)
// }

test('Queue is ok', function (t) {
  t.ok(Queue);
  t.equals(typeof Queue === 'undefined' ? 'undefined' : _typeof(Queue), 'function');
  t.end();
});

test('Queue instance', function (t) {
  var queue = new Queue();
  t.ok(queue, 'should be truthy');
  t.equals(queue.constraintPeriod, 1000, 'should have `constraintPeriod` property default to 1000');
  t.equals(queue.tasksPerPeriod, 5, 'should have `tasksPerPeriod` property default to 5');
  t.equals(queue.parallelTaskCount, 2, 'should have `parallelTaskCount` property default to 2');
  t.equals(_typeof(queue.processTask), 'function', 'should have `processTask` method');
  t.end();
});

test('Queue#processTask (simple)', function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(t) {
    var queue, task, result;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            queue = new Queue();

            task = function () {
              var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
                return regeneratorRuntime.wrap(function _callee$(_context) {
                  while (1) {
                    switch (_context.prev = _context.next) {
                      case 0:
                        _context.next = 2;
                        return sleep(10);

                      case 2:
                        return _context.abrupt('return', 'foo');

                      case 3:
                      case 'end':
                        return _context.stop();
                    }
                  }
                }, _callee, undefined);
              }));

              return function task() {
                return _ref2.apply(this, arguments);
              };
            }();

            _context2.next = 4;
            return queue.processTask(task);

          case 4:
            result = _context2.sent;

            t.equals(result, 'foo', 'should process async task');

          case 6:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, undefined);
  }));

  return function (_x) {
    return _ref.apply(this, arguments);
  };
}());

// https://docs.google.com/spreadsheets/d/1GX4OaolG_AmZ-NbUKI9XcDhewV-jFLCn29WWn-thEf0/edit
test('Queue#processTask (complex)', function () {
  var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee4(t) {
    var CONSTRAINT_PERIOD, TASKS_PER_PERIOD, PARALLEL_TASK_COUNT, queue, startTime, getCurTime, timeLog, getAsyncTask, tasks, tasksResults, timeline, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, task1, parallelTasks, _iteratorNormalCompletion3, _didIteratorError3, _iteratorError3, _iterator3, _step3, task2, _ref5, a1, a2, b2, _loop, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, _task;

    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            getAsyncTask = function getAsyncTask(number, executionTime) {
              timeLog.push({ number: number, added: getCurTime() });
              return _asyncToGenerator(regeneratorRuntime.mark(function _callee3() {
                return regeneratorRuntime.wrap(function _callee3$(_context3) {
                  while (1) {
                    switch (_context3.prev = _context3.next) {
                      case 0:
                        timeLog.push({ number: number, started: getCurTime() });
                        _context3.next = 3;
                        return sleep(executionTime);

                      case 3:
                        timeLog.push({ number: number, processed: getCurTime() });
                        return _context3.abrupt('return', number);

                      case 5:
                      case 'end':
                        return _context3.stop();
                    }
                  }
                }, _callee3, this);
              }));
            };

            // debugLog = []
            CONSTRAINT_PERIOD = 100;
            TASKS_PER_PERIOD = 3;
            PARALLEL_TASK_COUNT = 2;
            queue = new Queue({
              constraintPeriod: CONSTRAINT_PERIOD,
              tasksPerPeriod: TASKS_PER_PERIOD,
              parallelTaskCount: PARALLEL_TASK_COUNT
            });
            startTime = Date.now();

            getCurTime = function getCurTime() {
              return Date.now() - startTime;
            };

            timeLog = [];
            tasks = [queue.processTask(getAsyncTask(0, 20)), queue.processTask(getAsyncTask(1, 60)), queue.processTask(getAsyncTask(2, 130)), queue.processTask(getAsyncTask(3, 20)), queue.processTask(getAsyncTask(4, 30)), queue.processTask(getAsyncTask(5, 30)), queue.processTask(getAsyncTask(6, 70)), queue.processTask(getAsyncTask(7, 170))];
            _context4.next = 11;
            return sleep(100);

          case 11:
            tasks.push(queue.processTask(getAsyncTask(8, 20)));

            _context4.next = 14;
            return sleep(10);

          case 14:
            tasks.push(queue.processTask(getAsyncTask(9, 20)));

            _context4.next = 17;
            return sleep(10);

          case 17:
            tasks.push(queue.processTask(getAsyncTask(10, 70)));

            _context4.next = 20;
            return sleep(10);

          case 20:
            tasks.push(queue.processTask(getAsyncTask(11, 20)));

            _context4.next = 23;
            return Promise.all(tasks);

          case 23:
            tasksResults = _context4.sent;


            t.deepEqual(tasksResults, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], 'should return tasks results');

            timeline = timeLog.reduce(function (res, log) {
              res[log.number] = Object.assign(res[log.number] || {}, log);
              return res;
            }, []);

            // Задачи выполняются последовательно

            timeline.reduce(function (prev, next) {
              if (prev.started > next.started) {
                t.fail('task#' + prev.number + ' start before task#' + next.number);
              }
              return next;
            });

            // Не более заданного кол-ва одновременно исполняемых задач
            _iteratorNormalCompletion = true;
            _didIteratorError = false;
            _iteratorError = undefined;
            _context4.prev = 30;
            _iterator = timeline[Symbol.iterator]();

          case 32:
            if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
              _context4.next = 58;
              break;
            }

            task1 = _step.value;
            parallelTasks = 0;
            _iteratorNormalCompletion3 = true;
            _didIteratorError3 = false;
            _iteratorError3 = undefined;
            _context4.prev = 38;

            for (_iterator3 = timeline[Symbol.iterator](); !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
              task2 = _step3.value;

              if (task1 !== task2) {
                _ref5 = [task1.started, task2.started, task2.processed], a1 = _ref5[0], a2 = _ref5[1], b2 = _ref5[2];

                if (a2 <= a1 && a1 < b2) {
                  parallelTasks++;
                }
              }
            }
            _context4.next = 46;
            break;

          case 42:
            _context4.prev = 42;
            _context4.t0 = _context4['catch'](38);
            _didIteratorError3 = true;
            _iteratorError3 = _context4.t0;

          case 46:
            _context4.prev = 46;
            _context4.prev = 47;

            if (!_iteratorNormalCompletion3 && _iterator3.return) {
              _iterator3.return();
            }

          case 49:
            _context4.prev = 49;

            if (!_didIteratorError3) {
              _context4.next = 52;
              break;
            }

            throw _iteratorError3;

          case 52:
            return _context4.finish(49);

          case 53:
            return _context4.finish(46);

          case 54:
            if (parallelTasks > PARALLEL_TASK_COUNT - 1) {
              t.fail('more than ' + (PARALLEL_TASK_COUNT - 1) + ' tasks at the same time for task#' + task1.number);
            }

          case 55:
            _iteratorNormalCompletion = true;
            _context4.next = 32;
            break;

          case 58:
            _context4.next = 64;
            break;

          case 60:
            _context4.prev = 60;
            _context4.t1 = _context4['catch'](30);
            _didIteratorError = true;
            _iteratorError = _context4.t1;

          case 64:
            _context4.prev = 64;
            _context4.prev = 65;

            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }

          case 67:
            _context4.prev = 67;

            if (!_didIteratorError) {
              _context4.next = 70;
              break;
            }

            throw _iteratorError;

          case 70:
            return _context4.finish(67);

          case 71:
            return _context4.finish(64);

          case 72:
            _loop = function _loop(_task) {
              var periodStart = _task.started - CONSTRAINT_PERIOD;
              var periodTasks = timeline.filter(function (task2) {
                if (task2 !== _task) {
                  return task2.started >= periodStart && task2.started < _task.started;
                }
              });
              if (periodTasks.length > TASKS_PER_PERIOD) {
                t.fail('more than ' + TASKS_PER_PERIOD + ' tasks for task#' + _task.number);
              }
            };

            // Не более заданного кол-ва задач за указанных период
            _iteratorNormalCompletion2 = true;
            _didIteratorError2 = false;
            _iteratorError2 = undefined;
            _context4.prev = 76;
            for (_iterator2 = timeline[Symbol.iterator](); !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
              _task = _step2.value;

              _loop(_task);
            }

            // console.log(timeline)
            // console.log(debugLog)
            _context4.next = 84;
            break;

          case 80:
            _context4.prev = 80;
            _context4.t2 = _context4['catch'](76);
            _didIteratorError2 = true;
            _iteratorError2 = _context4.t2;

          case 84:
            _context4.prev = 84;
            _context4.prev = 85;

            if (!_iteratorNormalCompletion2 && _iterator2.return) {
              _iterator2.return();
            }

          case 87:
            _context4.prev = 87;

            if (!_didIteratorError2) {
              _context4.next = 90;
              break;
            }

            throw _iteratorError2;

          case 90:
            return _context4.finish(87);

          case 91:
            return _context4.finish(84);

          case 92:
          case 'end':
            return _context4.stop();
        }
      }
    }, _callee4, undefined, [[30, 60, 64, 72], [38, 42, 46, 54], [47,, 49, 53], [65,, 67, 71], [76, 80, 84, 92], [85,, 87, 91]]);
  }));

  return function (_x2) {
    return _ref3.apply(this, arguments);
  };
}());
//# sourceMappingURL=queue.test.js.map