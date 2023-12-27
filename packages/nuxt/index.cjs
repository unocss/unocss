'use strict'

Object.defineProperty(exports, '__esModule', { value: true })

// CommonJS proxy to bypass jiti transforms from nuxt 2 and using native ESM
exports.default = function (...args) {
  return import('./dist/index.mjs').then(m => m.default.call(this, ...args))
}

exports.default.meta = require('./package.json')
