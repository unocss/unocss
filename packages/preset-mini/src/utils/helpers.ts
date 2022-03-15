import { SuggestionBuilder } from '@unocss/core'
import type { Theme } from '../theme'

export class MiniSuggestionBuilder extends SuggestionBuilder<Theme> {
  withColor(): this {
    if (this.notNeeded()) return this

    // if theme has no colors, then it's invalid
    if (!this.context.theme.colors) {
      this.invalid = true
      return this
    }

    const colors = Object.keys(this.context.theme.colors)
    const colorsWithTrailing = []
    for (const color of colors) {
      const property = this.context.theme.colors[color]
      // the color doesn't support opacity
      if (typeof property === 'string') {
        colorsWithTrailing.push(color)
        continue
      }
      // the color has a default opacity
      if (property.DEFAULT)
        colorsWithTrailing.push(color)
      colorsWithTrailing.push(`${color}-`)
    }

    // if no input is given, then suggest all colors
    if (!this.input) {
      this.setSuggestions(colorsWithTrailing)
      return this
    }

    // match color name
    const matchedColorName = colors.find(i => this.input.startsWith(`${i}-`))

    // if no color name is found, then suggest full color names
    if (!matchedColorName) {
      const matchedColorNames = colorsWithTrailing.filter(i => i.startsWith(this.input))
      this.setSuggestions(matchedColorNames)
      return this
    }

    // if a full color name is found, then match opacity
    const opacities = this.context.theme.colors[matchedColorName]
    const suggestableOpacities = typeof opacities === 'object' ? Object.keys(opacities).filter(i => !isNaN(Number(i))) : undefined
    // if the color doesn't accept a opacity, then mark as invalid
    if (!suggestableOpacities) {
      this.invalid = true
      return this
    }

    this.input = this.input.slice(matchedColorName.length + 1)
    this.prepend += `${matchedColorName}-`

    const opacity = this.input
    // if the opacity is not a number, then mark as invalid
    if (isNaN(Number(opacity)))
      this.invalid = true
    // if opacity is given, then suggest opacities starting with it
    else if (opacity)
      this.setSuggestions(suggestableOpacities.filter(i => i.startsWith(opacity)))
    // if no opacity is given, then suggest all opacities
    else
      this.setSuggestions(suggestableOpacities)

    return this
  }
}
