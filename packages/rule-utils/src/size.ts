export const cssMathFnRE = /^(?:calc|clamp|min|max)\s*\(.*\)/

export function isSize(str: string) {
  if (str[0] === '[' && str.slice(-1) === ']')
    str = str.slice(1, -1)
  return cssMathFnRE.test(str) || /^[0-9]+(?:px|rem|em|vw|vh|%)$/.test(str)
}
