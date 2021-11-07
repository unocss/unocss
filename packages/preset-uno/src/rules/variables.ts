import { Rule } from '@unocss/core'

const variablesAbbrMap: Record<string, string> = {
  'w': 'width',
  'h': 'height',
  'max-w': 'max-width',
  'max-h': 'max-height',
  'visible': 'visibility',
  'select': 'user-select',
  'vertical': 'vertical-align',
  'backface': 'backface-visibility',
  'whitespace': 'white-space',
  'break': 'word-break',
  'color': 'color',
  'case': 'text-transform',
  'write': 'writing-mode',
  'write-orient': 'text-orientation',
  'origin': 'transform-origin',
  'bg': 'background-color',
  'bg-blend': 'background-blend-mode',
  'bg-clip': '-webkit-background-clip',
  'bg-gradient': 'linear-gradient',
  'bg-origin-border': 'background-origin',
  'bg-position': 'background-position',
  'bg-repeat': 'background-repeat',
  'bg-size': 'background-size',
  'bg-opacity': 'background-opacity',
  'tab': 'tab-size',
  'underline': 'text-decoration-thickness',
  'underline-offset': 'text-underline-offset',
  'indent': 'text-indent',
  'text': 'color',
  'grid-cols': 'grid-template-columns',
  'grid-rows': 'grid-template-rows',
  'auto-flow': 'grid-auto-flow',
  'row-start': 'grid-row-start',
  'row-end': 'grid-row-end',
  'justify': 'justify-content',
  'content': 'align-content',
  'items': 'align-items',
  'self': 'align-self',
  'object': 'object-fit',
  'mix-blend': 'mix-blend-mode',
  'animate-speed': 'animation-speed',
}

export const cssVariables: Rule[] = [[
  /^(.+)-\$(.+)$/, ([, name, varname]) => {
    const prop = variablesAbbrMap[name]
    if (prop) {
      return {
        [prop]: `var(--${varname})`,
      }
    }
  },
]]
