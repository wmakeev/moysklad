import Moysklad from '..'

const msDate: string = Moysklad.getTimeString(new Date())
const msParsedDate: Date = Moysklad.parseTimeString(msDate)

const ms = Moysklad({
  endpoint: 'https://online.moysklad.ru/api',
  api: 'remap',
  apiVersion: '1.2',
  fetch: 'any',
  login: 'login',
  password: 'password'
})

ms.GET('path/to/doc', {
  filter: {
    foo: 'bar',
    moment: {
      $eq: msParsedDate
    }
  },
  order: 'foo'
})

ms.GET(
  'path/to/doc',
  {
    order: ['foo', ['bar', 'baz'], ['qux']]
  },
  {
    millisecond: true
  }
)

const filter: Moysklad.QueryFilter = {
  foo: 'bar',
  quz: {
    $gte: 10
  }
}

ms.POST('foo/bar', 'any', {
  filter: {
    ...filter,
    foo: 'bar'
  }
})
