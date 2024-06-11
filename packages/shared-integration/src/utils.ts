import { cssIdRE } from '@unocss/core'

export function getPath(id: string) {
  return id.replace(/\?.*$/, '')
}

export function isCssId(id: string) {
  return cssIdRE.test(id)
}

export function hash(str: string) {
  let i
  let l
  let hval = 0x811C9DC5

  for (i = 0, l = str.length; i < l; i++) {
    hval ^= str.charCodeAt(i)
    hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24)
  }
  return (`00000${(hval >>> 0).toString(36)}`).slice(-6)
}

export function transformSkipCode(code: string, map: Map<string, string>, SKIP_RULES_RE: RegExp, keyFlag: string) {
  for (const item of Array.from(code.matchAll(SKIP_RULES_RE))) {
    if (item != null) {
      const matched = item[0]
      const withHashKey = `${keyFlag}${hash(matched)}`
      map.set(withHashKey, matched)
      code = code.replace(matched, withHashKey)
    }
  }

  return code
}

export function restoreSkipCode(code: string, map: Map<string, string>) {
  for (const [withHashKey, matched] of map.entries())
    code = code.replaceAll(withHashKey, matched)

  return code
}
