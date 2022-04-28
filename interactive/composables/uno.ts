import prettier from 'prettier/standalone'
import parserCSS from 'prettier/parser-postcss'
import type { RuleItem } from '~/types'

export async function enumerateAutocomplete() {
  const matched = new Set<string>()
  const a2z = Array.from('abcdefghijklmnopqrstuvwxyz')
  const a2zd = [...a2z, '-']

  const keys = a2z.flatMap(i => [
    i,
    ...a2zd.map(j => `${i}${j}`),
  ])

  await Promise.all(keys.map(key =>
    ac
      .suggest(key)
      .then(i => i.forEach(j => matched.add(j))),
  ))

  return matched
}

const _generatePromiseMap = new Map<string, Promise<RuleItem | undefined>>()

async function _generateFor(input: string) {
  if (matchedMap.has(input))
    return matchedMap.get(input)

  const token = await uno.parseToken(input)
  if (!token?.length)
    return

  const last = token[token.length - 1]!

  const generate = await uno.generate(new Set([input]), { preflights: false, minify: true })

  const css = prettier.format(
    generate.css,
    {
      parser: 'css',
      plugins: [parserCSS],
      printWidth: Infinity,
    },
  )

  // props
  const features = getFeatureUsage(css)

  matchedMap.set(input, {
    type: 'rule',
    class: input,
    body: last[2].replace(/([:;])/g, '$1 '),
    context: last[5],
    css,
    colors: extractColors(css),
    features,
    layers: generate.layers.filter(i => i !== 'default'),
  })

  const item = matchedMap.get(input)!

  features.forEach((i) => {
    if (!featuresMap.has(i))
      featuresMap.set(i, new Set())
    featuresMap.get(i)!.add(item)
  })

  if (!fuseCollection.includes(item))
    fuse.add(item)

  return item
}

export function generateFor(input: string) {
  if (!_generatePromiseMap.has(input))
    _generatePromiseMap.set(input, _generateFor(input).catch(e => console.error(e)) as any)
  return _generatePromiseMap.get(input)
}

export function getPresetName(item: RuleItem) {
  const rules = item.context?.rules
  if (!rules?.length)
    return
  return uno.config.presets?.flat().find(i => i.rules?.find(i => rules.includes(i)))?.name
}
