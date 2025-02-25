import type { Rule } from '@unocss/core'
import { h } from '@unocss/preset-mini/utils'

const variablesAbbrMap: Record<string, string> = {
  'bg-blend': 'background-blend-mode',
  'bg-clip': '-webkit-background-clip',
  'bg-gradient': 'linear-gradient',
  'bg-image': 'background-image',
  'bg-origin': 'background-origin',
  'bg-position': 'background-position',
  'bg-repeat': 'background-repeat',
  'bg-size': 'background-size',
  'mix-blend': 'mix-blend-mode',
  'object': 'object-fit',
  'object-position': 'object-position',
  'write': 'writing-mode',
  'write-orient': 'text-orientation',
}

export const cssVariables: Rule[] = [
  [/^(.+?)-(\$.+)$/, ([, name, varname]) => {
    const prop = variablesAbbrMap[name]
    if (prop)
      return { [prop]: h.cssvar(varname) }
  }],
]
