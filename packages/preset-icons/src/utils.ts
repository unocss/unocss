export const isNode = typeof process < 'u' && typeof process.stdout < 'u'

const svgCharRe = [
    [/"/g, '\''],
    [/%/g, '%25'],
    [/#/g, '%23'],
    [/{/g, '%7B'],
    [/}/g, '%7D'],
    [/</g, '%3C'],
    [/>/g, '%3E'],
]
// https://bl.ocks.org/jennyknuth/222825e315d45a738ed9d6e04c7a88d0
export function encodeSvg(svg: string) {
  return svgCharRe.reduce(
    (str, [regexp, replacement]) => str.replace(regexp, replacement),
    svg.replace('<svg', (~svg.indexOf('xmlns') ? '<svg' : '<svg xmlns="http://www.w3.org/2000/svg"'))
  )
}
