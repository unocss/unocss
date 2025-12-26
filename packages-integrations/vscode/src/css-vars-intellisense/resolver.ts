import type { UnoGenerator } from '@unocss/core'
import type { AtRule, Declaration, Rule as PostcssRule, Root } from 'postcss'
import type { ColorInfo, ResolvedValues } from './types'
import { calc } from '@csstools/css-calc'
import { formatHex, parse } from 'culori'
import postcss from 'postcss'
import { log } from '../log'
import { getColorComment, getRemToPxComment, isUnoColorVariable, unoVarPrefix } from './utils'
import 'culori/fn'

const atRuleProperty = 'property'
const declInitialValue = 'initial-value'
const varRegex = /var\((--[^,)]+)(?:,([^)]*))?\)/g
const unoColorVarRegex = /var\((--colors-[^)]+)\)/

const colorProperties = [
  'color',
  'background-color',
  'border-color',
  'text-decoration-color',
  'accent-color',
  'caret-color',
  'fill',
  'stroke',
  'outline-color',
]

const propertyToOpacityVar = new Map<string, string>(
  colorProperties.map(prop => [prop, `--un-${prop.split('-')[0]}-opacity`]),
)

/**
 * The core logic for resolving UnoCSS utilities.
 * It takes a utility string and deconstructs it into its final computed CSS,
 * commented original CSS, and other metadata by leveraging PostCSS.
 */
export class ValueResolver {
  private flatTheme: Map<string, string>

  constructor(private uno: UnoGenerator, private remToPxRatio: number) {
    this.flatTheme = this.flattenTheme(this.uno.config.theme)
  }

  /**
   * Resolves a utility string into detailed information for IntelliSense.
   */
  async resolve(util: string): Promise<ResolvedValues | null> {
    const shortcutExpansion = await this.findShortcutExpansion(util)

    const result = await this.uno.generate(new Set([util]), { preflights: false, safelist: false, minify: false })
    if (!result.css)
      return null

    let root: Root
    try {
      root = postcss.parse(result.css)
    }
    catch (e) {
      log.appendLine(`[Error] PostCSS parsing error for util: ${util}: ${e}`)
      return null
    }

    const { propertyCss, defaultVars } = this.extractAtProperties(root)

    const { resolvedThemeValue, resolveValue } = this.createValueResolver(defaultVars)

    const { colorInfo, colorProperty } = this.findColorInfo(root, resolveValue)
    const themeValue = resolvedThemeValue.value

    const commentedCss = this.buildCommentedCss(root.clone(), resolveValue, { colorInfo, themeValue })
    const computedCss = this.buildComputedCss(root, resolveValue, { colorInfo })

    if (colorInfo)
      colorInfo.original = themeValue

    return {
      computedCss,
      commentedCss,
      propertyCss,
      themeValue,
      colorInfo,
      colorProperty,
      shortcutExpansion,
    }
  }

  /**
   * Flattens the nested theme object into a single-level map for easier lookups.
   * e.g., { colors: { red: { 500: '#ef4444' } } } => Map({ 'colors.red.500': '#ef4444' })
   */
  private flattenTheme(theme: object): Map<string, string> {
    const flatMap = new Map<string, string>()
    function recurse(obj: any, path: string[]) {
      for (const [key, value] of Object.entries(obj)) {
        const newPath = [...path, key]
        if (typeof value === 'object' && value !== null)
          recurse(value, newPath)
        else
          flatMap.set(newPath.join('.'), String(value))
      }
    }
    recurse(theme, [])
    return flatMap
  }

  /**
   * Checks if a utility is a shortcut and returns its definition.
   */
  private async findShortcutExpansion(util: string): Promise<string | null> {
    const token = await this.uno.parseToken(util)
    if (token && token[0]?.[5]?.shortcuts?.[0]) {
      const shortcut = token[0][5].shortcuts[0]
      if (typeof shortcut[0] === 'string') {
        const definition = shortcut[1]
        if (typeof definition === 'string')
          return definition
        if (Array.isArray(definition))
          return definition.filter(item => typeof item === 'string').join(' ')
      }
      else {
        return `Dynamic Shortcut: ${shortcut[0].toString()}`
      }
    }
    return null
  }

  /**
   * Parses the CSS to find and extract `@property` rules.
   * These are removed from the main AST and their default values are stored for variable resolution.
   */
  private extractAtProperties(root: Root): { propertyCss: string | null, defaultVars: Map<string, string> } {
    const defaultVars = new Map<string, string>()
    const propertyNodes: AtRule[] = []
    root.walkAtRules(atRuleProperty, (atRule) => {
      propertyNodes.push(atRule.clone())
      const varName = atRule.params
      atRule.walkDecls(declInitialValue, (decl) => {
        defaultVars.set(varName, decl.value)
      })
      atRule.remove()
    })
    const propertyCss = propertyNodes.length > 0 ? propertyNodes.map(n => n.toString()).join('\n\n') : null
    return { propertyCss, defaultVars }
  }

  private getThemeValue(path: string): string | undefined {
    return this.flatTheme.get(path) ?? this.flatTheme.get(`${path}.DEFAULT`)
  }

  /**
   * Creates a closure function to recursively resolve CSS `var()` functions.
   * It uses a three-level priority: local rule variables > theme variables > @property defaults.
   */
  private createValueResolver(defaultVars: Map<string, string>) {
    const resolvedThemeValue = { value: null as string | null }
    const MAX_RECURSION = 20

    const resolveValue = (value: string, decl: Declaration): string => {
      const parent = decl.parent as PostcssRule
      const ruleVars = new Map<string, string>()
      parent.walkDecls(/^--/, (d) => {
        ruleVars.set(d.prop, d.value)
      })

      const resolve = (val: string, level = 0): string => {
        if (level > MAX_RECURSION || !val.includes('var('))
          return val
        const replaced = val.replace(varRegex, (match, varName, fallback) => {
          const name = varName.trim()
          if (ruleVars.has(name))
            return ruleVars.get(name)!

          let path = name.replace(new RegExp(`^${unoVarPrefix}`), '').replace(/-/g, '.')
          let tv = this.getThemeValue(path)
          if (tv !== undefined) {
            if (!resolvedThemeValue.value)
              resolvedThemeValue.value = tv
            return tv
          }

          path = name.replace(/^--/, '').replace(/-/g, '.')
          tv = this.getThemeValue(path)
          if (tv !== undefined) {
            if (!resolvedThemeValue.value)
              resolvedThemeValue.value = tv
            return tv
          }

          if (defaultVars.has(name))
            return defaultVars.get(name)!

          if (fallback !== undefined)
            return fallback.trim()

          return match
        })
        return replaced !== val ? resolve(replaced, level + 1) : val
      }
      return resolve(value)
    }
    return { resolvedThemeValue, resolveValue }
  }

  /**
   * Traverses the CSS AST to find the first declaration that defines a color.
   * It resolves the color's value and returns detailed information about it.
   */
  private findColorInfo(root: Root, resolveValue: (value: string, decl: Declaration) => string): { colorInfo: ColorInfo | null, colorProperty: string | null } {
    let colorInfo: ColorInfo | null = null
    let colorProperty: string | null = null

    root.walkDecls((decl) => {
      if (colorInfo)
        return

      const isDirectColorProp = colorProperties.includes(decl.prop)
      const isColorVar = isUnoColorVariable(decl.prop)

      if (!isDirectColorProp && !isColorVar)
        return

      colorProperty = decl.prop

      const opacityVarName = isColorVar
        ? decl.prop.replace('-color', '-opacity')
        : propertyToOpacityVar.get(decl.prop)

      let opacityValue: string | undefined
      if (opacityVarName) {
        (decl.parent as PostcssRule).walkDecls(opacityVarName, (d) => {
          opacityValue = d.value
        })
      }

      const valueToParse = decl.value
      const baseColorVarMatch = valueToParse.match(unoColorVarRegex)

      if (!baseColorVarMatch)
        return

      const baseColor = resolveValue(baseColorVarMatch[0], decl)
      const opacity = opacityValue ? Number.parseFloat(resolveValue(opacityValue, decl)) : 1

      try {
        const color = parse(baseColor)
        if (color) {
          color.alpha = (color.alpha ?? 1) * opacity
          colorInfo = { original: null, hex: formatHex(color), alpha: color.alpha } // themeValue is resolved later
        }
      }
      catch {}
    })
    return { colorInfo, colorProperty }
  }

  /**
   * Clones the CSS AST and enriches it with helpful comments (rem to px, color values).
   * This version is used for the main body of the tooltips.
   */
  private buildCommentedCss(
    root: Root,
    resolveValue: (value: string, decl: Declaration) => string,
    context: { colorInfo: ColorInfo | null, themeValue: string | null },
  ): string {
    root.walkComments((comment) => {
      if (/layer: properties/.test(comment.text))
        comment.remove()
    })

    root.walkAtRules('media', (rule) => {
      if (this.remToPxRatio <= 0)
        return
      rule.params = rule.params.replace(
        /\b(-?[\d.]+)rem\b/g,
        (match: string, remValueStr: string) => {
          const remValue = Number.parseFloat(remValueStr)
          const px = remValue * this.remToPxRatio
          return `${match} /* ${Number.parseFloat(px.toFixed(2))}px */`
        },
      )
    })

    root.walkDecls((decl) => {
      const isColorVar = isUnoColorVariable(decl.prop)
      if (decl.prop.startsWith(unoVarPrefix) && !isColorVar)
        return

      const resolved = resolveValue(decl.value, decl)
      const calculated = calc(resolved) || resolved
      const finalColor = context.colorInfo ? context.colorInfo.hex : calculated
      const remComment = getRemToPxComment(calculated, this.remToPxRatio, 'detailed')

      let valueComment: string | null = null
      if (colorProperties.includes(decl.prop) || isColorVar) {
        valueComment = getColorComment(finalColor, context.themeValue)
      }
      else if (decl.value.includes('var(') && decl.value !== calculated && !remComment) {
        if (!calculated.includes('(') && !calculated.includes(',') && calculated.length < 20)
          valueComment = `/* ${calculated} */`
      }

      const comments = [remComment, valueComment].filter(Boolean).join(' ')
      if (comments)
        decl.value = `${decl.value} ${comments}`
    })
    return root.toString()
  }

  /**
   * Builds a string of the final, fully computed CSS declarations.
   * This is used for the `detail` line in the completion tooltip.
   */
  private buildComputedCss(
    root: Root,
    resolveValue: (value: string, decl: Declaration) => string,
    context: { colorInfo: ColorInfo | null },
  ): string {
    const computedDeclarations: string[] = []
    let mainRule: PostcssRule | undefined
    root.walkRules((rule) => {
      if (!mainRule)
        mainRule = rule
    })

    if (mainRule) {
      mainRule.walkDecls((decl) => {
        if (decl.prop.startsWith('--'))
          return

        let value = resolveValue(decl.value, decl)
        if (value.includes('color-mix'))
          value = context.colorInfo?.hex ?? value

        try {
          value = calc(value) || value
        }
        catch {}

        const comment = getRemToPxComment(value, this.remToPxRatio, 'simple')
        computedDeclarations.push(`${decl.prop}: ${value}${comment ? ` ${comment}` : ''};`)
      })
    }
    return computedDeclarations.join('\n')
  }
}
