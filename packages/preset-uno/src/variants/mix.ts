import type { CSSColorValue, Variant } from '@unocss/core'
import { colorToString, parseCssColor } from '@unocss/preset-mini/utils'

const mixComponent = (v1: string | number, v2: string | number, w: string | number) => `calc(${v2} + (${v1} - ${v2}) * ${w} / 100)`

/**
 * Returns RGB color from a mixture of color1 and color2. Support RGB color values.
 * https://sass-lang.com/documentation/modules/color#mix
 *
 * @param {string | CSSColorValue} color1
 * @param {string | CSSColorValue} color2
 * @param {string | number} weight - How many of color2 will be used to mix into color1. Value of 0 will resulting in color2, value of 100 color1.
 * @return {CSSColorValue | undefined}
 */
const mixColor = (color1: string | CSSColorValue, color2: string | CSSColorValue, weight: string | number): CSSColorValue | undefined => {
  const colors = [color1, color2]
  const cssColors: CSSColorValue[] = []
  for (let c = 0; c < 2; ++c) {
    const color = (typeof colors[c] === 'string' ? parseCssColor(colors[c] as string) : colors[c]) as CSSColorValue | undefined
    if (!color || !['rgb', 'rgba'].includes(color.type))
      return
    cssColors.push(color)
  }

  const newComponents = []
  for (let x = 0; x < 3; ++x)
    newComponents.push(mixComponent(cssColors[0].components[x], cssColors[1].components[x], weight))

  return {
    type: 'rgb',
    components: newComponents,
    alpha: mixComponent(cssColors[0].alpha ?? 1, cssColors[1].alpha ?? 1, weight),
  }
}

/**
 * Mix color with white. @see {@link mixColor}
 */
const tint = (color: string | CSSColorValue, weight: string | number) => mixColor('#fff', color, weight)

/**
 * Mix color with black. @see {@link mixColor}
 */
const shade = (color: string | CSSColorValue, weight: string | number) => mixColor('#000', color, weight)

/**
 * Mix color with black or white, according to weight. @see {@link mixColor}
 */
const shift = (color: string | CSSColorValue, weight: string | number) => {
  const num = parseFloat(`${weight}`)
  if (!Number.isNaN(num))
    return num > 0 ? shade(color, weight) : tint(color, -num)
}

const fns: Record<string, (color: string | CSSColorValue, weight: string | number) => CSSColorValue | undefined> = { tint, shade, shift }

/**
 * Shade the color if the weight is positive, tint the color otherwise.
 * Shading mixes the color with black, Tinting mixes the color with white.
 * @see {@link mixColor}
 */
export const variantColorMix: Variant = (matcher) => {
  const m = matcher.match(/^mix-(tint|shade|shift)-(-?\d{1,3})[-:]/)
  if (m) {
    return {
      matcher: matcher.slice(m[0].length),
      body: (body) => {
        body.forEach((v) => {
          if (v[1]) {
            const color = parseCssColor(`${v[1]}`)
            if (color) {
              const mixed = fns[m[1]](color, m[2])
              if (mixed)
                v[1] = colorToString(mixed)
            }
          }
        })
        return body
      },
    }
  }
}
