'use strict'

import have from 'have'
import csp, { promiseChan, chan, putAsync } from 'js-csp'

have = have.with({
  'query': query => query instanceof Object && query.toJSON,
  'Str'  : str => typeof str === 'string' && !!str,
  'type' : type => typeof type === 'function' && !!type.TYPE_NAME,
  'id'   : id => typeof id === 'string' && id.length === 36
})

/**
 * @returns {Promise}
 */
export default function load() {
  let args = have.strict(arguments, [
    { type    : 'type', id   : 'id'              , options: 'opt obj' },
    { typeName: 'Str' , id   : 'id'              , options: 'opt obj' },
    { type    : 'type', query: 'opt obj or query', options: 'opt obj' },
    { typeName: 'Str' , query: 'opt obj or query', options: 'opt obj' },
    {                   query: 'obj or query'    , options: 'opt obj' }
  ])

  let { load, loadBatch } = this.actions
  let { type, typeName, id, query, options } = args

  let action, resultCh
  if (id) {
    resultCh = promiseChan()
    action = load({ typeName: typeName || type.TYPE_NAME, id, options })
  } else {
    resultCh = chan()
    typeName = type ? type.TYPE_NAME : typeName
    if (query && !query.toJSON) { query = createQuery(query) } // TODO createQuery
    action = loadBatch({
      typeName,
      query: query ? query.toJSON() : {},
      options
    })
  }

  dispatch(action)
    .then(dataCh => csp.operations.pipe(dataCh, resultCh))
    .catch(err => putAsync(resultCh, err))

  return resultCh
}
