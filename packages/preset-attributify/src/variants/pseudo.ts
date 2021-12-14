import type { CSSEntries, VariantObject } from '@unocss/core'
import { CONTROL_BYPASS_PSEUDO_CLASS, PseudoClasses } from '@unocss/preset-mini/variants'

const PseudoClassesStr = Object.keys(PseudoClasses).join('|')
const PseudoClassesGroupRE = new RegExp(`^group-(${PseudoClassesStr})[:-]`)
const PseudoClassesPeerRE = new RegExp(`^peer-(${PseudoClassesStr})[:-]`)

function shouldAdd(entires: CSSEntries) {
  return !entires.find(i => i[0] === CONTROL_BYPASS_PSEUDO_CLASS) || undefined
}

export const variantPseudoClasses: VariantObject = {
  match: (input: string) => {
    let match = input.match(PseudoClassesGroupRE)
    if (match) {
      const pseudo = PseudoClasses[match[1]] || match[1]
      return {
        matcher: input.slice(match[1].length + 7),
        selector: (s, body) => shouldAdd(body) && s.includes('.group:')
          ? s.replace(/\.group:/, `[group=""]:${pseudo}:`)
          : `[group=""]:${pseudo} ${s}`,
      }
    }

    match = input.match(PseudoClassesPeerRE)
    if (match) {
      const pseudo = PseudoClasses[match[1]] || match[1]
      return {
        matcher: input.slice(match[1].length + 6),
        selector: (s, body) => shouldAdd(body) && s.includes('.peer:')
          ? s.replace(/\.peer:/, `[peer=""]:${pseudo}:`)
          : `[peer=""]:${pseudo} ~ ${s}`,
      }
    }
  },
  multiPass: true,
}
