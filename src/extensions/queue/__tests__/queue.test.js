'use strict'

// const debug = require('debug')
const test = require('blue-tape')
const Queue = require('../queue')
const sleep = require('../../../tools/sleep')

// TODO remove
// process.env.DEBUG = 'queue'
// global.DEBUG = true

// let debugLog = []
// global.debug = function (msg) {
//   debugLog.push(msg)
// }

test('Queue is ok', t => {
  t.ok(Queue)
  t.equals(typeof Queue, 'function')
  t.end()
})

test('Queue instance', t => {
  let queue = new Queue()
  t.ok(queue, 'should be truthy')
  t.equals(queue.constraintPeriod, 1000, 'should have `constraintPeriod` property default to 1000')
  t.equals(queue.tasksPerPeriod, 5, 'should have `tasksPerPeriod` property default to 5')
  t.equals(queue.parallelTaskCount, 2, 'should have `parallelTaskCount` property default to 2')
  t.equals(typeof queue.processTask, 'function', 'should have `processTask` method')
  t.end()
})

test('Queue#processTask (simple)', async t => {
  let queue = new Queue()
  let task = async () => {
    await sleep(10)
    return 'foo'
  }
  let result = await queue.processTask(task)
  t.equals(result, 'foo', 'should process async task')
})

// https://docs.google.com/spreadsheets/d/1GX4OaolG_AmZ-NbUKI9XcDhewV-jFLCn29WWn-thEf0/edit
test('Queue#processTask (complex)', async t => {
  // debugLog = []
  const CONSTRAINT_PERIOD = 100
  const TASKS_PER_PERIOD = 3
  const PARALLEL_TASK_COUNT = 2

  let queue = new Queue({
    constraintPeriod: CONSTRAINT_PERIOD,
    tasksPerPeriod: TASKS_PER_PERIOD,
    parallelTaskCount: PARALLEL_TASK_COUNT
  })

  let startTime = Date.now()
  let getCurTime = () => Date.now() - startTime
  let timeLog = []

  function getAsyncTask (number, executionTime) {
    timeLog.push({ number, added: getCurTime() })
    return async function () {
      timeLog.push({ number, started: getCurTime() })
      await sleep(executionTime)
      timeLog.push({ number, processed: getCurTime() })
      return number
    }
  }

  let tasks = [
    queue.processTask(getAsyncTask(0, 20)),
    queue.processTask(getAsyncTask(1, 60)),
    queue.processTask(getAsyncTask(2, 130)),
    queue.processTask(getAsyncTask(3, 20)),
    queue.processTask(getAsyncTask(4, 30)),
    queue.processTask(getAsyncTask(5, 30)),
    queue.processTask(getAsyncTask(6, 70)),
    queue.processTask(getAsyncTask(7, 170))
  ]

  await sleep(100)
  tasks.push(queue.processTask(getAsyncTask(8, 20)))

  await sleep(10)
  tasks.push(queue.processTask(getAsyncTask(9, 20)))

  await sleep(10)
  tasks.push(queue.processTask(getAsyncTask(10, 70)))

  await sleep(10)
  tasks.push(queue.processTask(getAsyncTask(11, 20)))

  let tasksResults = await Promise.all(tasks)

  t.deepEqual(tasksResults, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], 'should return tasks results')

  let timeline = timeLog.reduce((res, log) => {
    res[log.number] = Object.assign((res[log.number] || {}), log)
    return res
  }, [])

  // Задачи выполняются последовательно
  timeline.reduce((prev, next) => {
    if (prev.started > next.started) {
      t.fail(`task#${prev.number} start before task#${next.number}`)
    }
    return next
  })

  // Не более заданного кол-ва одновременно исполняемых задач
  for (let task1 of timeline) {
    let parallelTasks = 0
    for (let task2 of timeline) {
      if (task1 !== task2) {
        let [a1, a2, b2] = [task1.started, task2.started, task2.processed]
        if (a2 <= a1 && a1 < b2) { parallelTasks++ }
      }
    }
    if (parallelTasks > PARALLEL_TASK_COUNT - 1) {
      t.fail(`more than ${PARALLEL_TASK_COUNT - 1} tasks at the same time for task#${task1.number}`)
    }
  }

  // Не более заданного кол-ва задач за указанных период
  for (let task1 of timeline) {
    let periodStart = task1.started - CONSTRAINT_PERIOD
    let periodTasks = timeline.filter(task2 => {
      if (task2 !== task1) {
        return task2.started >= periodStart && task2.started < task1.started
      }
    })
    if (periodTasks.length > TASKS_PER_PERIOD) {
      t.fail(`more than ${TASKS_PER_PERIOD} tasks for task#${task1.number}`)
    }
  }

  // console.log(timeline)
  // console.log(debugLog)
})
