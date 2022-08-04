import { cssIdRE } from '@unocss/core'

export function getPath(id: string) {
  return id.replace(/\?.*$/, '')
}

export function isCssId(id: string) {
  return cssIdRE.test(id)
}
