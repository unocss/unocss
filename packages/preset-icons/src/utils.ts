export const isNode = typeof process < 'u' && typeof process.stdout < 'u'

const warned = new Set<string>()

export function warnOnce(msg: string) {
  if (warned.has(msg))
    return
  console.warn(msg)
  warned.add(msg)
}

// https://bl.ocks.org/jennyknuth/222825e315d45a738ed9d6e04c7a88d0
export function encodeSvg(svg: string) {
  return svg.replace('<svg', (~svg.indexOf('xmlns') ? '<svg' : '<svg xmlns="http://www.w3.org/2000/svg"'))
    .replace(/"/g, '\'')
    .replace(/%/g, '%25')
    .replace(/#/g, '%23')
    .replace(/{/g, '%7B')
    .replace(/}/g, '%7D')
    .replace(/</g, '%3C')
    .replace(/>/g, '%3E')
}
