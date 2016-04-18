/*
 * moysklad
 * [object Object]
 *
 * Copyright (c) 2015, Vitaliy V. Makeev
 * Licensed under MIT.
 */

import stampit from 'stampit'

import actions from './actions'
import actionCreators from './action-creators'
import methods from './methods'

import { corePlugin, mediatorPlugin } from './plugins'

export let Client = stampit()
  .methods(methods)
  .refs({ actionCreators })
  .init(corePlugin({ name: 'moysklad' }))
  .init(mediatorPlugin())

export let CspClient = Client()
  .init(({ instance }) => {
    instance.forward({
      [actions.LOAD]: 'xmlClient/load'
    })
  })

export function createCspClient () {
  let cspClient = CspClient()
  return cspClient()
}
