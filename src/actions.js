export let createMediatorAction = method => channel => payload => {
  let action = { type: 'EVENT', method, channel, payload }
  if (payload instanceof Error) {
    action.error = true
  }
  return action
}

export const EMIT = 'EMIT'
export let createEmitAction = createMediatorAction(EMIT)

export const SEND = 'SEND'
export let createSendAction = createMediatorAction(SEND)


/** Загрузка по идентификатору */
export const LOAD = 'LOAD'
export let load = createSendAction(LOAD)

/** Загрузка коллекции по фильтру */
export const LOAD_BATCH = 'LOAD_BATCH'
export let loadBatch = createSendAction(LOAD_BATCH)

