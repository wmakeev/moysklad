'use strict'

function createError (responseError, errors) {
  let error = new Error(responseError.error)
  if (responseError.code) { error.code = responseError.code }
  if (responseError.moreInfo) { error.moreInfo = responseError.moreInfo }
  if (errors && errors.length > 1) { error.errors = errors }
  return error
}

module.exports = function getResponseError (resp) {
  if (!resp) {
    return null
  } else if (resp.errors) {
    return createError(resp.errors[0], resp.errors)
  } else if (resp instanceof Array) {
    // Учитывается только первая ошибка
    let errorItem = resp.find(item => item.errors)
    return errorItem ? createError(errorItem.errors[0], errorItem.errors) : null
  } else {
    return null
  }
}
