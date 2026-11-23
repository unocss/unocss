import type { ResolvedConfig, UnoGenerator } from '@unocss/core'
import type { ChildNode, Container } from 'postcss'
import postcss from 'postcss'

type CssVariables = Map<string, string>

interface VariableTable {
  variables: CssVariables
  missing: Set<string>
}

const rootSelectors = new Set([':root', ':host'])
const varNameRE = /var\(\s*(--[\w-]+)/g
const remRE = /^(-?(?:\d+(?:\.\d+)?|\.\d+))rem$/
const numberRE = /^(-?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?)([a-z%]*)/i

const tables = new WeakMap<ResolvedConfig, VariableTable>()

export function getVariableNames(css: string): string[] {
  return Array.from(css.matchAll(varNameRE), m => m[1])
}

/**
 * Custom properties that apply to every element: declarations in top-level `:root`/`:host` rules,
 * then `@property` initial values. Declarations under a condition (`.dark :root`, `@media`) are
 * not unconditional, so they are skipped.
 */
function collectRootVariables(css: string): CssVariables {
  const declared: CssVariables = new Map()
  const initial: CssVariables = new Map()
  postcss.parse(css).each((node) => {
    if (node.type === 'rule' && node.selectors.every(s => rootSelectors.has(s.trim())))
      collectDeclarations(node, declared)
    else if (node.type === 'atrule' && node.name === 'property' && node.params.trim().startsWith('--'))
      node.walkDecls('initial-value', decl => void initial.set(node.params.trim(), decl.value.trim()))
  })
  return new Map([...initial, ...declared])
}

function collectDeclarations(node: Container, into: CssVariables) {
  node.each((child: ChildNode) => {
    if (child.type === 'decl' && child.prop.startsWith('--'))
      into.set(child.prop, child.value.trim())
  })
}

/**
 * The root variables of the generator's current config. Preflights run again only when a requested
 * name was neither in the table nor already missing after the last run, so an on-demand theme
 * variable is picked up once and an unknown name does not rerun them on every request.
 */
export async function getRootVariables(uno: UnoGenerator, names: Iterable<string>): Promise<CssVariables> {
  let table = tables.get(uno.config)
  const unseen = [...names].filter(name => !table?.variables.has(name) && !table?.missing.has(name))
  if (!table || unseen.length) {
    const { css } = await uno.generate(new Set(), { preflights: true, safelist: false })
    table = { variables: collectRootVariables(css), missing: new Set(table?.missing) }
    tables.set(uno.config, table)
  }
  for (const name of unseen) {
    if (!table.variables.has(name))
      table.missing.add(name)
  }
  return table.variables
}

function closingParen(value: string, open: number) {
  let depth = 0
  for (let i = open; i < value.length; i++) {
    if (value[i] === '(')
      depth++
    else if (value[i] === ')' && --depth === 0)
      return i
  }
  return -1
}

function splitTopLevel(value: string) {
  const parts: string[] = []
  let depth = 0
  let start = 0
  for (let i = 0; i < value.length; i++) {
    if (value[i] === '(') {
      depth++
    }
    else if (value[i] === ')') {
      depth--
    }
    else if (value[i] === ',' && depth === 0) {
      parts.push(value.slice(start, i).trim())
      start = i + 1
    }
  }
  parts.push(value.slice(start).trim())
  return parts
}

function substituteVars(value: string, variables: CssVariables, resolving: Set<string>): string | undefined {
  let output = ''
  let index = 0
  while (true) {
    const start = value.indexOf('var(', index)
    if (start === -1)
      return output + value.slice(index)
    const end = closingParen(value, start + 3)
    if (end === -1)
      return
    const [name, ...rest] = splitTopLevel(value.slice(start + 4, end))
    const fallback = rest.length ? rest.join(', ') : undefined
    let resolved: string | undefined
    const own = variables.get(name)
    if (own != null && !resolving.has(name)) {
      resolving.add(name)
      resolved = substituteVars(own, variables, resolving)
      resolving.delete(name)
    }
    if (resolved == null && fallback != null)
      resolved = substituteVars(fallback, variables, resolving)
    if (resolved == null)
      return
    output += value.slice(index, start) + resolved
    index = end + 1
  }
}

interface Dimension { value: number, unit: string }

function evaluateMath(expression: string): Dimension | undefined {
  const source = expression.replaceAll('calc(', '(')
  let index = 0
  function skip() {
    while (source[index] === ' ')
      index++
  }
  function factor(): Dimension | undefined {
    skip()
    if (source[index] === '(') {
      index++
      const result = sum()
      skip()
      if (source[index++] !== ')')
        return
      return result
    }
    if (source[index] === '-' && source[index + 1] === '(') {
      index++
      const result = factor()
      return result && { value: -result.value, unit: result.unit }
    }
    const match = source.slice(index).match(numberRE)
    if (!match)
      return
    index += match[0].length
    return { value: Number(match[1]), unit: match[2] }
  }
  function product(): Dimension | undefined {
    let left = factor()
    while (left) {
      skip()
      const op = source[index]
      if (op !== '*' && op !== '/')
        return left
      index++
      const right = factor()
      if (!right || (op === '*' && left.unit && right.unit) || (op === '/' && right.unit) || (op === '/' && right.value === 0))
        return
      left = op === '*'
        ? { value: left.value * right.value, unit: left.unit || right.unit }
        : { value: left.value / right.value, unit: left.unit }
    }
  }
  function sum(): Dimension | undefined {
    let left = product()
    while (left) {
      skip()
      const op = source[index]
      if (op !== '+' && op !== '-')
        return left
      index++
      const right = product()
      if (!right)
        return
      if (left.unit !== right.unit)
        return
      left = { value: op === '+' ? left.value + right.value : left.value - right.value, unit: left.unit }
    }
  }
  const result = sum()
  skip()
  return index === source.length ? result : undefined
}

function formatNumber(value: number) {
  return `${Number(value.toFixed(4))}`
}

function simplifyCalc(value: string): string {
  let output = ''
  let index = 0
  while (true) {
    const start = value.indexOf('calc(', index)
    if (start === -1)
      return output + value.slice(index)
    const end = closingParen(value, start + 4)
    if (end === -1)
      return output + value.slice(index)
    const result = evaluateMath(value.slice(start, end + 1))
    output += value.slice(index, start) + (result ? `${formatNumber(result.value)}${result.unit}` : `calc(${simplifyCalc(value.slice(start + 5, end))})`)
    index = end + 1
  }
}

function simplifyColorMix(value: string): string {
  const start = value.indexOf('color-mix(')
  if (start === -1)
    return value
  const end = closingParen(value, start + 9)
  if (end === -1)
    return value
  const [, color, other] = splitTopLevel(value.slice(start + 10, end))
  const opaque = other === 'transparent' && /\s100%$/.test(color ?? '') ? color!.slice(0, -4).trimEnd() : undefined
  return value.slice(0, start) + (opaque ?? value.slice(start, end + 1)) + simplifyColorMix(value.slice(end + 1))
}

/**
 * The value of `value` after substituting `variables` and evaluating `calc()`, or `undefined` when a
 * variable has no value (an unknown name without a fallback, or a cycle).
 */
function resolveCssValue(value: string, variables: CssVariables): string | undefined {
  const substituted = substituteVars(value, variables, new Set())
  return substituted == null ? undefined : simplifyColorMix(simplifyCalc(substituted)).trim()
}

function formatComment(resolved: string, remToPxRatio: number) {
  const rem = resolved.match(remRE)
  return rem && remToPxRatio >= 1 ? `${resolved} = ${formatNumber(Number(rem[1]) * remToPxRatio)}px` : resolved
}

/**
 * Adds a `/* resolved value *\/` comment after each declaration of `css` that reads a CSS variable.
 * A rule's own custom properties take precedence over root variables, and the `:root` and `@property`
 * rules in `css` itself over the ones of the generator's preflights.
 */
export async function addCssVariableComments(uno: UnoGenerator, css: string, remToPxRatio: number): Promise<string> {
  if (!css.includes('var('))
    return css
  const root = postcss.parse(css)
  const roots = new Map([
    ...await getRootVariables(uno, getVariableNames(css)),
    ...collectRootVariables(css),
  ])
  root.walkRules((rule) => {
    const variables = new Map(roots)
    collectDeclarations(rule, variables)
    rule.each((node) => {
      if (node.type !== 'decl' || !node.value.includes('var('))
        return
      const resolved = resolveCssValue(node.value, variables)
      if (resolved && resolved !== node.value.trim())
        node.after(postcss.comment({ text: formatComment(resolved, remToPxRatio), raws: { before: ' ' } }))
    })
  })
  return root.toString()
}
