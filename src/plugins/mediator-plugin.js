'use strict'

export default function mediatorPlugin (options) {
  return ({ instance }) => {
    let emit = () => {
    }
    let send = () => {
    }
    let on = () => {
    }
    let pipe = () => {
    }
    let forward = () => {
    }

    return {...instance, emit, send, on, pipe, forward}
  }
}
