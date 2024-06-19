import type { Rule, UnoGenerator, Variant } from '@unocss/core'
import { notNull, uniq } from '@unocss/core'
import { watchAtMost } from '@vueuse/core'
import Fuse from 'fuse.js'
import { createAutocomplete } from '@unocss/autocomplete'
import type { Ref } from 'vue'
import { computed, shallowReactive, toRaw } from 'vue'
import type { DocItem, GuideItem, ResultItem, RuleItem } from './types'
import { extractColors, formatCSS, sampleArray } from './utils'

export interface SearchState {
  uno: UnoGenerator
  docs: Ref<DocItem[]>
  guides: GuideItem[]
  limit?: number
}

export function createSearch(
  { uno, docs, guides, limit = 25 }: SearchState,
) {
  const ac = createAutocomplete(uno)
  const matchedMap = shallowReactive(new Map<string, RuleItem>())
  const featuresMap = shallowReactive(new Map<string, Set<RuleItem>>())

  let fuseCollection: ResultItem[] = []

  const fuse = new Fuse<ResultItem>(
    fuseCollection,
    {
      keys: [
        {
          name: 'class',
          weight: 0.5,
        },
        {
          name: 'body',
          weight: 0.4,
        },
        {
          name: 'title',
          weight: 0.3,
        },
        {
          name: 'keywords',
          weight: 0.3,
        },
      ],
      isCaseSensitive: false,
      ignoreLocation: true,
      includeScore: true,
    },
  )
  const docsFuse = computed(() => new Fuse<ResultItem>(docs.value, { keys: ['title', 'summary'], isCaseSensitive: false }))
  const guideFuse = new Fuse<ResultItem>(guides, { keys: ['title'], isCaseSensitive: false })

  const az09 = Array.from('abcdefghijklmnopqrstuvwxyz01234567890')

  uno.events.on('config', reset)

  let _fusePrepare: Promise<void> | undefined
  async function search(input: string) {
    input = input.trim()
    if (!input)
      return []

    const timeStart = performance.now()
    _fusePrepare = _fusePrepare || prepareFuse()
    await _fusePrepare

    // mdn
    if (input.startsWith('mdn:') || input.startsWith('doc:')) {
      input = input.slice(4).trim()
      if (!input)
        return docs.value.slice(0, limit)
      return docsFuse.value.search(input, { limit }).map(i => i.item)
    }

    // guide
    if (input.startsWith('guide:')) {
      input = input.slice(6).trim()
      if (!input)
        return guides.slice(0, limit)
      return guideFuse.search(input, { limit }).map(i => i.item)
    }

    // random
    if (input.startsWith('rand:') || input.startsWith('random:'))
      return sampleArray(fuseCollection, limit)

    const parts = input.split(/\s/g).filter(notNull)
    const extract = await generateForMultiple(parts)

    await suggestMultiple([
      ...parts,
      ...parts.map(i => `${i}-`),
      ...parts.flatMap(i => az09.map(a => `${i}-${a}`)),
    ]).then(r => generateForMultiple(r))

    const searchResult = uniq([
      ...fuse.search(input, { limit: limit * 2 }),
      ...parts.flatMap(i => fuse.search(i, { limit: limit * 2 })),
    ]
      .filter(i => i.score! <= 0.5)
      .sort((a, b) => a.score! - b.score!)
      .map(i => i.item))
      .slice(0, limit)

    const result = uniq([
      ...extract,
      ...searchResult,
    ].filter(notNull))

    const duration = performance.now() - timeStart
    // eslint-disable-next-line no-console
    console.log('Search:', input, 'Duration:', duration, 'ms', 'Results:', result.length, '/', fuseCollection.length)
    return result
  }

  async function suggestMultiple(str: string[]) {
    return uniq((await Promise.all(str.map(i => ac.suggest(i)))).flat())
  }

  async function generateForMultiple(str: string[]) {
    return uniq(await Promise.all(str.map(i => generateFor(i)))).filter(notNull)
  }

  async function prepareFuse() {
    await Promise.all(Array.from(await enumerateAutocomplete())
      .slice(0, 500)
      .map(async i => await generateFor(i)))
  }

  async function enumerateAutocomplete() {
    const matched = new Set<string>()
    const a2z = Array.from('abcdefghijklmnopqrstuvwxyz')
    const a2zd = [...a2z, '-']

    const keys = a2z.flatMap(i => [
      i,
      ...a2zd.map(j => `${i}${j}`),
    ])

    await Promise.all(keys.map(key => ac
      .suggest(key)
      .then(i => i.forEach(j => matched.add(j)))))

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
    const css = await formatCSS(generate.css)

    // props
    const features = getFeatureUsage(css)

    matchedMap.set(input, {
      type: 'rule',
      class: input,
      body: last[2].replace(/([:;])/g, '$1 '),
      // context: last[5],
      css,
      colors: extractColors(css),
      features,
      layers: generate.layers.filter(i => i !== 'default'),
      urls: getUrls(css),
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

  function generateFor(input: string) {
    if (!_generatePromiseMap.has(input))
      _generatePromiseMap.set(input, _generateFor(input).catch(e => console.error(e)) as any)
    return _generatePromiseMap.get(input)
  }

  function getPresetOfRule(rule?: Rule) {
    if (!rule)
      return
    const r = toRaw(rule)
    return uno.config.presets?.flat().find(i => i.rules?.find(i => i === r || i === rule))
  }

  function getPresetOfVariant(variant?: Variant) {
    if (!variant)
      return
    const v = toRaw(variant)
    return uno.config.presets?.flat().find(i => i.variants?.find(i => i === v || i === variant))
  }

  function getFeatureUsage(css: string) {
    const props = uniq([...css.matchAll(/^\s+(\w[\w-]+):/gm)].map(i => i[1]))
    const functions = uniq([...css.matchAll(/\b(\w+)\(/g)].map(i => `${i[1]}()`))
    const pseudo = uniq([...css.matchAll(/:([\w-]+)/g)].map(i => `:${i[1]}`))
    return [...props, ...functions, ...pseudo]
      .filter(i => docs.value.find(s => s.title === i))
  }

  function getUrls(css: string) {
    return uniq([...css.matchAll(/\burl\(([^)]+)\)/g)]
      .map(i => i[1]))
      .map(i => /^(['"]).*\1$/.test(i) ? i.slice(1, -1) : i)
  }

  function getUtilsOfFeature(name: string) {
    return [...(featuresMap.get(name) || [])]
  }

  function getAliasOf(item: RuleItem) {
    return [...matchedMap.values()].filter(i => i.body === item.body && i.class !== item.class)
  }

  function getItemId(item: ResultItem) {
    if (item.type !== 'rule')
      return `${item.type}:${item.title}`
    return item.class
  }

  function getSameRules(item: RuleItem) {
    if (!item.context?.rules?.length)
      return []
    const raw = toRaw(item)
    return [...matchedMap.values()]
      .filter((i) => {
        if (raw === toRaw(i))
          return false
        if (i.context?.rules?.length !== item.context?.rules?.length)
          return false
        return i.context?.rules?.every((j, k) => j === item.context?.rules?.[k])
      })
      .sort((a, b) => a.class.localeCompare(b.class))
  }

  function reset() {
    matchedMap.clear()
    featuresMap.clear()
    ac.reset()
    _fusePrepare = undefined
    _generatePromiseMap.clear()
    fuseCollection = [...guides, ...docs.value]
    fuse.setCollection(fuseCollection)
  }

  function getSearchCount() {
    return fuseCollection.length
  }

  function getInfo() {
    return {
      version: uno.version,
      presetsCount: uno.config.presets.length,
      rulesCount: uno.config.rulesSize,
      variantsCount: uno.config.variants.length,
      shortcutsCount: uno.config.shortcuts.length,
      searchCount: getSearchCount(),
    }
  }

  function getThemeColors() {
    return (uno.config.theme as any).colors || {}
  }

  // docs is lazy loaded
  watchAtMost(
    () => docs.value,
    () => {
      fuseCollection = [...guides, ...docs.value]
      fuse.setCollection(fuseCollection)
    },
    { count: 1 },
  )

  return {
    uno,
    reset,
    search,
    fuse,
    generateFor,
    getPresetOfRule,
    getPresetOfVariant,
    getUtilsOfFeature,
    getAliasOf,
    getItemId,
    getSameRules,
    getSearchCount,
    getInfo,
    getThemeColors,
  }
}

export type SearchObject = ReturnType<typeof createSearch>
