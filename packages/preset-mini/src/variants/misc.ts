import type { Variant } from '@unocss/core'

export const variantSelector: Variant = {
  name: 'selector',
  match(matcher) {
    const match = matcher.match(/^selector-\[(.+?)\][:-]/)
    if (match) {
      return {
        matcher: matcher.slice(match[0].length),
        selector: () => match[1],
      }
    }
  },
}

export const variantLayer: Variant = {
  name: 'layer',
  match(matcher) {
    const match = matcher.match(/^layer-([_\d\w]+)[:-]/)
    if (match) {
      return {
        matcher: matcher.slice(match[0].length),
        layer: match[1],
      }
    }
  },
}

export const variantScope: Variant = {
  name: 'scope',
  match(matcher) {
    const match = matcher.match(/^scope-([_\d\w]+)[:-]/)
    if (match) {
      return {
        matcher: matcher.slice(match[0].length),
        selector: s => `.${match[1]} $$ ${s}`,
      }
    }
  },
}

export const variantImportant: Variant = {
  name: 'important',
  match(matcher) {
    const match = matcher.match(/^(important[:-]|!)/)
    if (match) {
      return {
        matcher: matcher.slice(match[0].length),
        body: (body) => {
          body.forEach((v) => {
            if (v[1])
              v[1] += ' !important'
          })
          return body
        },
      }
    }
  },
  autocomplete: '(important)',
}

const numberRE = /[0-9.]+(?:[a-z]+|%)?/
export const variantNegative: Variant = {
  name: 'negative',
  match(matcher) {
    if (!matcher.startsWith('-') || !matcher.match(/\d|-px|-full/))
      return

    return {
      matcher: matcher.slice(1),
      body: (body) => {
        let changed = false
        body.forEach((v) => {
          const value = v[1]?.toString()
          if (!value || v[0].startsWith('--un-scale') || value === '0')
            return
          if (numberRE.test(value)) {
            v[1] = value.replace(numberRE, i => `-${i}`)
            changed = true
          }
        })
        if (changed)
          return body
      },
    }
  },
}
