'use strict';

function createError(responseError, errors) {
  let error = new Error(responseError.error);
  if (responseError.code) {
    error.code = responseError.code;
  }
  if (responseError.moreInfo) {
    error.moreInfo = responseError.moreInfo;
  }
  if (errors) {
    error.errors = errors;
  }
  return error;
}

module.exports = function getResponseError(resp) {
  if (!resp) {
    return null;
  } else if (resp.errors) {
    return createError(resp.errors[0], resp.errors);
  } else if (resp.error) {
    return createError(resp);
  } else {
    return null;
  }
};
//# sourceMappingURL=getResponseError.js.map