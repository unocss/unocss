import { notNull, uniq } from '@unocss/core'
import Fuse from 'fuse.js'
import { mdnIndex } from '~/data/mdn-index'
import type { ResultItem } from '~/types'
import { guideIndex } from '~~/data/guides'

const RESULT_AMOUNT = 20

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

  const extact = await generateFor(input)
  await Promise.all([
    ...await ac.suggest(input),
    ...await ac.suggest(`${input}-`),
  ].map(i => generateFor(i)))

  const searchResult = fuse.search(input, { limit: RESULT_AMOUNT })
    .filter(i => i.score! <= 0.5)
    .map(i => i.item)

  return uniq([
    extact,
    ...searchResult,
  ].filter(notNull))
}

async function prepareFuse() {
  await Promise.all(Array.from(await enumerateAutocomplete())
    .map(async i => await generateFor(i)))
}
