'use strict'

export default function corePlugin (options) {
  return ({ instance }) => {

    let dispatch = () => {}
    let register = () => {}

    return { ...instance, register }
  }
}
