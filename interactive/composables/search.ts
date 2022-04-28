import { notNull, uniq } from '@unocss/core'
import Fuse from 'fuse.js'
import { mdnIndex } from '~/data/mdn-index'
import type { ResultItem } from '~/types'
import { guideIndex } from '~/data/guides'

const RESULT_AMOUNT = 50
const az09 = Array.from('abcdefghijklmnopqrstuvwxyz01234567890')

export const fuseCollection: ResultItem[] = [
  ...guideIndex,
  ...mdnIndex,
]

export const fuse = new Fuse<ResultItem>(
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
const mdnFuse = new Fuse<ResultItem>(mdnIndex, { keys: ['title', 'summary'], isCaseSensitive: false })
const guideFuse = new Fuse<ResultItem>(guideIndex, { keys: ['title'], isCaseSensitive: false })

let prepare: Promise<void> | undefined

export async function search(input: string) {
  prepare = prepare || prepareFuse()
  await prepare

  input = input.trim()

  // mdn
  if (input.match(/^(mdn|doc):/)) {
    input = input.slice(4).trim()
    if (!input)
      return mdnIndex.slice(0, RESULT_AMOUNT)
    return mdnFuse.search(input, { limit: RESULT_AMOUNT }).map(i => i.item)
  }

  // guide
  if (input.match(/^guide:/)) {
    input = input.slice(6).trim()
    if (!input)
      return guideIndex.slice(0, RESULT_AMOUNT)
    return guideFuse.search(input, { limit: RESULT_AMOUNT }).map(i => i.item)
  }

  // random
  if (input.match(/^rand(om)?:/))
    return sampleArray(fuseCollection, RESULT_AMOUNT)

  const parts = input.split(/\s/g).filter(notNull)
  const extact = await generateForMultiple(parts)

  await suggestMultiple([
    ...parts,
    ...parts.map(i => `${i}-`),
    ...parts.flatMap(i => az09.map(a => `${i}-${a}`)),
  ]).then(r => generateForMultiple(r))

  const searchResult = uniq([
    ...fuse.search(input, { limit: RESULT_AMOUNT * 2 }),
    ...parts.flatMap(i => fuse.search(i, { limit: RESULT_AMOUNT * 2 })),
  ]
    .filter(i => i.score! <= 0.5)
    .sort((a, b) => a.score! - b.score!)
    .map(i => i.item))
    .slice(0, RESULT_AMOUNT)

  return uniq([
    ...extact,
    ...searchResult,
  ].filter(notNull))
}

async function suggestMultiple(str: string[]) {
  return uniq((await Promise.all(str.map(i => ac.suggest(i)))).flat())
}

async function generateForMultiple(str: string[]) {
  return uniq(await Promise.all(str.map(i => generateFor(i)))).filter(notNull)
}

async function prepareFuse() {
  await Promise.all(Array.from(await enumerateAutocomplete())
    .map(async i => await generateFor(i)))
}
