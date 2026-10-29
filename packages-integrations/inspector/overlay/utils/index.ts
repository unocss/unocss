// @unocss-includes

export function round(num: number) {
  return num.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')
}

export const pxToRem = (px: number) => Number.parseFloat(round(px / 16))
export const remToPx = (rem: number) => Number.parseFloat(round(rem * 16))

export function getElementColor(tagName: string) {
  switch (tagName.toLowerCase()) {
    case 'div': return 'text-white:60'
    case 'span': return 'text-purple'
    case 'p': return 'text-yellow'
    case 'a': return 'text-purple'
    case 'img': return 'text-pink'
    case 'button': return 'text-red'
    case 'ul':
    case 'ol': return 'text-indigo'
    case 'li': return 'text-teal'
    case 'header':
    case 'footer': return 'text-gray'
    case 'section':
    case 'article': return 'text-cyan'
    case 'nav': return 'text-lime'
    case 'input':
    case 'textarea':
    case 'select': return 'text-amber'
    default: return 'text-white/50'
  }
}
