'use strict'

const test = require('blue-tape')
const Moysklad = require('..')

test('PUT error', t => {
  t.plan(2)

  const ms = Moysklad()

  ms.PUT('entity/product', {
    foo: 'bar'
  }).catch(err => {
    t.equal(err.message, 'Не указан идентификатор объекта')
    t.equal(err.code, 1012)
  })
})

test('POST error', t => {
  t.plan(2)

  const ms = Moysklad()

  ms.POST('entity/product', [
    { foo: 'bar1' },
    { id: 'not-id', foo: 'bar2' }
  ]).catch(err => {
    t.equal(err.message,
      'Ошибка сохранения объекта: поле \'name\' не может быть пустым или отсутствовать')
    t.equal(err.code, 3000)
  })
})

test('POST error with muteErrors', t => {
  t.plan(2)

  const ms = Moysklad()

  ms.POST('entity/product', [
    { foo: 'bar1' },
    { id: 'not-id', foo: 'bar2' }
  ], null, { muteErrors: true }).then(res => {
    t.ok(res instanceof Array)
    t.ok(res.every(i => i.errors instanceof Array))
  })
})
