'use strict'

const test = require('tape')
const { buildFilter } = require('../..')

test('buildFilter', t => {
  t.ok(buildFilter)
  t.equals(typeof buildFilter, 'function', 'should to be function')
  t.end()
})

test('buildFilter with simple filter', t => {
  const filter = {
    name: 'foo',
    value: 3,
    moment: new Date('2017-01-09T19:15:06.556Z'),
    some: null,
    other: true
  }

  t.deepEqual(
    buildFilter(filter),
    [
      'moment=2017-01-09 22:15:06.556',
      'name=foo',
      'other=true',
      'some=',
      'value=3'
    ].join(';')
  )

  t.end()
})

test('buildFilter with simple deep and many condition filter', t => {
  const filter = {
    'name': 'foo',
    'value': 0,
    'moment': new Date('2017-01-09T19:15:06.556Z'),
    'deep.one': 5,
    'deep': {
      tow: false
    },
    'many': [1, 'baz']
  }

  t.deepEqual(
    buildFilter(filter),
    [
      'deep.one=5',
      'deep.tow=false',
      'many=1',
      'many=baz',
      'moment=2017-01-09 22:15:06.556',
      'name=foo',
      'value=0'
    ].join(';')
  )

  t.end()
})

test('buildFilter with Mongo query comparison selectors', t => {
  const filter = {
    name: {
      $eq: 'foo'
    },
    start: {
      $st: 'prfx'
    },
    end: {
      $et: 'psfx'
    },
    cont: {
      $contains: 'str'
    },
    value: {
      $gt: 5
    },
    num: {
      $gte: 5,
      $lt: 10
    },
    moment: {
      $lte: new Date('2017-01-09T19:15:06.556Z')
    },
    deep: {
      tow: {
        $ne: 'bar'
      }
    },
    many: {
      $exists: true,
      $in: [1, 1, 'baz']
    },
    notMany: {
      $nin: [3, 6],
      $gt: 0
    },
    empty: {
      $exists: false
    }
  }

  t.deepEqual(
    buildFilter(filter),
    [
      'cont~str',
      'deep.tow!=bar',
      'empty=',
      'end=~psfx',
      'many!=',
      'many=1',
      'many=1',
      'many=baz',
      'moment<=2017-01-09 22:15:06.556',
      'name=foo',
      'notMany!=3',
      'notMany!=6',
      'notMany>0',
      'num<10',
      'num>=5',
      'start~=prfx',
      'value>5'
    ].join(';')
  )

  t.end()
})

test('buildFilter with Mongo query logical selectors', t => {
  const filter = {
    name: {
      $and: [{ $eq: 'foo' }, { $eq: 'bar' }]
    },
    value: {
      $not: {
        $eq: 10,
        $in: [5, 6]
      }
    },
    fantom: {
      $not: {
        $exists: true
      }
    }
  }

  t.deepEqual(
    buildFilter(filter),
    [
      'fantom=',
      'name=bar',
      'name=foo',
      'value!=10',
      'value!=5',
      'value!=6'
    ].join(';')
  )

  t.end()
})

test('buildFilter with $and query selectors', t => {
  const filter1 = {
    name: {
      $and: [
        { $eq: 'foo' },
        {
          $not: {
            $eq: 10,
            $in: [5, 6]
          }
        }
      ]
    }
  }
  const filter1Str = buildFilter(filter1)

  const filter2 = {
    name: {
      $eq: 'foo',
      $not: {
        $eq: 10,
        $in: [5, 6]
      }
    }
  }
  const filter2Str = buildFilter(filter2)

  t.equal(filter1Str, filter2Str)

  t.end()
})

test('buildFilter with query selectors combined with sub fields', t => {
  const filter = {
    id: 5,
    name: {
      $gt: 15,
      $eq: 'foo',
      $lte: undefined,
      sub: 'bar',
      empty: undefined
    },
    updated: {
      $gte: undefined
    },
    empty: undefined
  }

  t.deepEqual(buildFilter(filter), 'id=5;name.sub=bar;name=foo;name>15')

  t.end()
})

test('buildFilter errors', t => {
  t.throws(() => {
    buildFilter()
  }, /Поле filter должно быть объектом/)

  t.throws(() => {
    buildFilter({ foo: Symbol('foo') })
  }, /Некорректное значение поля "foo" в фильтре/)

  t.throws(() => {
    buildFilter({ foo: { $eq: { a: 1 } } })
  }, /\$eq: значение должно быть строкой, числом, датой или null/)

  t.throws(() => {
    buildFilter({ foo: { $in: { a: 1 } } })
  }, /\$in: значение селектора foo должно быть массивом/)

  t.throws(() => {
    buildFilter({ foo: { $and: { a: 1 } } })
  }, /\$and: значение селектора должно быть массивом/)

  t.throws(() => {
    buildFilter({ foo: { $not: 3 } })
  }, /\$not: значение селектора должно быть объектом/)

  t.throws(() => {
    buildFilter({ foo: { $not: { $st: 'start' } } })
  }, /\$st не поддерживает селектор отрицания \$not/)

  t.throws(() => {
    buildFilter({ foo: { $not: { $et: 'start' } } })
  }, /\$et не поддерживает селектор отрицания \$not/)

  t.throws(() => {
    buildFilter({ foo: { $not: { $contains: 'start' } } })
  }, /\$contains не поддерживает селектор отрицания \$not/)

  t.throws(() => {
    buildFilter({ foo: { $exists: 'boo' } })
  }, /\$exists: значение селектора должно быть логическим/)

  t.throws(() => {
    buildFilter({ foo: { $foo: 'boo' } })
  }, /Неизвестный селектор "\$foo"/)

  t.doesNotThrow(() => {
    buildFilter({ $foo: 'boo' })
  }, 'should not test correct selectors for first level fields')

  t.end()
})
