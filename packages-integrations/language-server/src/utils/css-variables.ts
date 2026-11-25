import type { ResolvedConfig, UnoGenerator } from '@unocss/core'
import type { AtRule, ChildNode, Container, Root } from 'postcss'
import postcss from 'postcss'

type CssVariables = Map<string, string>

interface VariableTable {
  variables: CssVariables
  missing: Set<string>
  loaded: boolean
  refresh?: Promise<void>
}

const rootSelectors = new Set([':root', ':host'])
const varNameRE = /var\(\s*(--(?:[\w-]|\\.)+)/g
const remRE = /^(-?(?:\d+(?:\.\d+)?|\.\d+))rem$/
const numberRE = /^(-?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?)([a-z%]*)/i
// a resolved value longer than this is not useful in a hover, and chained variables can grow it exponentially
const maxValueLength = 200

const tables = new WeakMap<ResolvedConfig, VariableTable>()

export function getVariableNames(css: string): string[] {
  return Array.from(css.matchAll(varNameRE), m => m[1])
}

/**
 * Custom properties that apply to every element, from top-level `:root`/`:host` rules (also inside
 * `@layer`) and `@property` initial values, ranked like the cascade: important over normal, and
 * unlayered over layered with later layers winning (the reverse for important declarations).
 * Declarations under a condition (`.dark :root`, `@media`, `@supports`) are skipped.
 */
function collectRootVariables(css: string): CssVariables {
  const root = postcss.parse(css)
  const layerName = (node: AtRule, name: string) => {
    for (let parent = node.parent; parent && parent.type === 'atrule'; parent = parent.parent) {
      if ((parent as AtRule).name === 'layer')
        name = `${(parent as AtRule).params.trim()}.${name}`
    }
    return name
  }
  const layers: string[] = []
  root.walkAtRules('layer', (node) => {
    for (const name of node.params.split(',').map(n => layerName(node, n.trim()))) {
      if (!layers.includes(name))
        layers.push(name)
    }
  })

  const ranked = new Map<string, { value: string, rank: number }>()
  const initial: CssVariables = new Map()
  const visit = (container: Container, layer: string | undefined) => {
    const layerIndex = layer == null ? layers.length + 1 : layers.indexOf(layer) + 1
    container.each((node) => {
      if (node.type === 'rule' && node.selectors.every(s => rootSelectors.has(s.trim()))) {
        node.each((child) => {
          if (child.type !== 'decl' || !child.prop.startsWith('--'))
            return
          const rank = child.important ? 2 * (layers.length + 2) - layerIndex : layerIndex
          const current = ranked.get(child.prop)
          if (!current || rank >= current.rank)
            ranked.set(child.prop, { value: child.value.trim(), rank })
        })
      }
      else if (node.type === 'atrule' && node.name === 'layer' && node.nodes) {
        visit(node, layerName(node, node.params.trim()))
      }
      else if (node.type === 'atrule' && node.name === 'property' && node.params.trim().startsWith('--')) {
        node.walkDecls('initial-value', decl => void initial.set(node.params.trim(), decl.value.trim()))
      }
    })
  }
  visit(root, undefined)
  return new Map([...initial, ...Array.from(ranked, ([name, { value }]) => [name, value] as const)])
}

/**
 * The root variables of the generator's current config. Preflights run again only when a requested
 * name was neither in the table nor already missing, and concurrent requests share one run. A
 * preflight that throws or returns CSS that does not parse leaves the table empty.
 */
export async function getRootVariables(uno: UnoGenerator, names: Iterable<string>): Promise<CssVariables> {
  const config = uno.config
  let table = tables.get(config)
  if (!table) {
    table = { variables: new Map(), missing: new Set(), loaded: false }
    tables.set(config, table)
  }
  const requested = [...names]
  while (true) {
    if (table.refresh) {
      await table.refresh
      continue
    }
    const unseen = requested.filter(name => !table.variables.has(name) && !table.missing.has(name))
    if (table.loaded && !unseen.length)
      return table.variables
    const current = table
    current.refresh = (async () => {
      try {
        const { css } = await uno.generate(new Set(), { preflights: true, safelist: false })
        current.variables = collectRootVariables(css)
      }
      catch {}
      current.loaded = true
      for (const name of unseen) {
        if (!current.variables.has(name))
          current.missing.add(name)
      }
    })().finally(() => current.refresh = undefined)
  }
}

interface VarReference {
  start: number
  end: number
  name: string
  fallback?: string
}

/** The end index (exclusive) of the quoted string or escape at `index`, or `index + 1`. */
function skipToken(value: string, index: number) {
  const char = value[index]
  if (char === '\\')
    return index + 2
  if (char !== '"' && char !== '\'')
    return index + 1
  for (let i = index + 1; i < value.length; i++) {
    if (value[i] === '\\')
      i++
    else if (value[i] === char)
      return i + 1
  }
  return value.length
}

/** The index of the `)` that closes the `(` at `open`, outside strings, or `-1`. */
function closingParen(value: string, open: number) {
  let depth = 0
  for (let i = open; i < value.length; i = skipToken(value, i)) {
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
  for (let i = 0; i < value.length; i = skipToken(value, i)) {
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

/** Each whitespace run outside strings as one space. */
function collapseWhitespace(value: string) {
  let output = ''
  for (let i = 0; i < value.length;) {
    const next = skipToken(value, i)
    output += /\s/.test(value[i]) ? (output.endsWith(' ') ? '' : ' ') : value.slice(i, next)
    i = next
  }
  return output.trim()
}

/** The top-level `var()` references of `value`; the ones in fallbacks are found by recursion. */
function findVarReferences(value: string): VarReference[] | undefined {
  const references: VarReference[] = []
  for (let i = 0; i < value.length; i = skipToken(value, i)) {
    if (!value.startsWith('var(', i) || /[\w-]/.test(value[i - 1] ?? ''))
      continue
    const end = closingParen(value, i + 3)
    if (end === -1)
      return
    const [name, ...rest] = splitTopLevel(value.slice(i + 4, end))
    references.push({ start: i, end: end + 1, name, fallback: rest.length ? rest.join(', ') : undefined })
    i = end
  }
  return references
}

function referencedNames(value: string): string[] {
  return (findVarReferences(value) ?? []).flatMap(ref => [ref.name, ...(ref.fallback ? referencedNames(ref.fallback) : [])])
}

/**
 * The names in a dependency cycle. Per CSS, every custom property in a cycle (references in
 * fallbacks included) has no value.
 */
function findCycles(variables: CssVariables): Set<string> {
  const cyclic = new Set<string>()
  const index = new Map<string, number>()
  const low = new Map<string, number>()
  const stack: string[] = []
  const visit = (name: string) => {
    index.set(name, index.size)
    low.set(name, index.get(name)!)
    stack.push(name)
    const dependencies = referencedNames(variables.get(name)!).filter(d => variables.has(d))
    for (const dependency of dependencies) {
      if (!index.has(dependency)) {
        visit(dependency)
        low.set(name, Math.min(low.get(name)!, low.get(dependency)!))
      }
      else if (stack.includes(dependency)) {
        low.set(name, Math.min(low.get(name)!, index.get(dependency)!))
      }
    }
    if (low.get(name) === index.get(name)) {
      const component = stack.splice(stack.indexOf(name))
      if (component.length > 1 || dependencies.includes(name))
        component.forEach(n => cyclic.add(n))
    }
  }
  for (const name of variables.keys()) {
    if (!index.has(name))
      visit(name)
  }
  return cyclic
}

class Substitution {
  private readonly cyclic: Set<string>
  private readonly resolved = new Map<string, string | undefined>()

  constructor(private readonly variables: CssVariables) {
    this.cyclic = findCycles(variables)
  }

  private variable(name: string) {
    if (!this.resolved.has(name)) {
      const value = this.variables.get(name)
      this.resolved.set(name, value == null || this.cyclic.has(name) ? undefined : this.value(value))
    }
    return this.resolved.get(name)
  }

  value(value: string): string | undefined {
    const references = findVarReferences(value)
    if (!references)
      return
    let output = ''
    let index = 0
    for (const { start, end, name, fallback } of references) {
      const substituted = this.variable(name) ?? (fallback == null ? undefined : this.value(fallback))
      if (substituted == null)
        return
      output += value.slice(index, start) + substituted
      if (output.length > maxValueLength)
        return
      index = end
    }
    output += value.slice(index)
    return output.length > maxValueLength ? undefined : output
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
      if (!right || left.unit !== right.unit)
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
  for (let i = 0; i < value.length; i = skipToken(value, i)) {
    if (!value.startsWith('calc(', i))
      continue
    const end = closingParen(value, i + 4)
    if (end === -1)
      break
    const result = evaluateMath(value.slice(i, end + 1))
    output += value.slice(index, i) + (result ? `${formatNumber(result.value)}${result.unit}` : `calc(${simplifyCalc(value.slice(i + 5, end))})`)
    index = end + 1
    i = end
  }
  return output + value.slice(index)
}

function simplifyColorMix(value: string): string {
  let output = ''
  let index = 0
  for (let i = 0; i < value.length; i = skipToken(value, i)) {
    if (!value.startsWith('color-mix(', i))
      continue
    const end = closingParen(value, i + 9)
    if (end === -1)
      break
    const [, color = '', other] = splitTopLevel(value.slice(i + 10, end))
    const opaque = other === 'transparent' && /\s100%$/.test(color) ? color.slice(0, -4).trimEnd() : undefined
    output += value.slice(index, i) + (opaque ?? value.slice(i, end + 1))
    index = end + 1
    i = end
  }
  return output + value.slice(index)
}

function formatComment(resolved: string, remToPxRatio: number) {
  const rem = resolved.match(remRE)
  return rem && remToPxRatio >= 1 ? `${resolved} = ${formatNumber(Number(rem[1]) * remToPxRatio)}px` : resolved
}

/**
 * Adds a `/* resolved value *\/` comment after each declaration of `css` that reads a CSS variable.
 * A rule's own custom properties take precedence over root variables, and the `:root` and `@property`
 * rules in `css` itself over the ones of the generator's preflights. When `css` does not parse, it is
 * returned unchanged.
 */
export async function addCssVariableComments(uno: UnoGenerator, css: string, remToPxRatio: number): Promise<string> {
  if (!css.includes('var('))
    return css
  let root: Root
  let local: CssVariables
  try {
    root = postcss.parse(css)
    local = collectRootVariables(css)
  }
  catch {
    return css
  }
  const roots = new Map([...await getRootVariables(uno, getVariableNames(css)), ...local])
  root.walkRules((rule) => {
    const variables = new Map(roots)
    rule.each((child: ChildNode) => {
      if (child.type === 'decl' && child.prop.startsWith('--'))
        variables.set(child.prop, child.value.trim())
    })
    const substitution = new Substitution(variables)
    rule.each((node) => {
      if (node.type !== 'decl' || !node.value.includes('var('))
        return
      const value = collapseWhitespace(node.value)
      const substituted = substitution.value(value)
      const resolved = substituted == null ? undefined : simplifyColorMix(simplifyCalc(collapseWhitespace(substituted)))
      if (resolved && resolved !== value)
        node.after(postcss.comment({ text: formatComment(resolved, remToPxRatio), raws: { before: ' ' } }))
    })
  })
  return root.toString()
}
