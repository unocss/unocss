export const numberWithUnitRE = /^(-?\d*(?:\.\d+)?)(px|pt|pc|%|r?(?:em|ex|lh|cap|ch|ic)|(?:[sld]?v|cq)(?:[whib]|min|max)|in|cm|mm|rpx)?$/i
export const numberRE = /^(-?\d*(?:\.\d+)?)$/
export const unitOnlyRE = /^(px|[sld]?v[wh])$/i
export const unitOnlyMap: Record<string, number> = {
  px: 1,
  vw: 100,
  vh: 100,
  svw: 100,
  svh: 100,
  dvw: 100,
  dvh: 100,
  lvh: 100,
  lvw: 100,
}
export const bracketTypeRe = /^\[(color|length|size|position|quoted|string):/i
export const splitComma = /,(?![^()]*\))/g
