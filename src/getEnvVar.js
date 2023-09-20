'use strict'

/* global window */

/**
 * Получить значение переменной окружения
 * @param {string} key Наименоване переменной окружения
 * @param {string} defaultValue Наименоване переменной окружения
 * @returns {string | null} Значение переменной окружения
 */
function getEnvVar(key, defaultValue) {
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key]
  } else if (typeof window !== 'undefined' && window[key]) {
    return window[key]
  } else if (typeof global !== 'undefined' && global[key]) {
    return global[key]
  } else {
    return defaultValue !== undefined ? defaultValue : null
  }
}

module.exports = getEnvVar
