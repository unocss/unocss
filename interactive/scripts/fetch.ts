import type { DocItem } from '../app/types'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'fs-extra'
import { $fetch } from 'ofetch'
import pLimit from 'p-limit'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const MDN = 'https://developer.mozilla.org'
const LANG = 'en-US'

const searchIndex = (await $fetch<DocItem[]>(`${MDN}/${LANG}/search-index.json`))
  .filter(i => i.url.match(/\/css\//gi) && !i.url.match(/learn/gi) && !i.url.match(/-(moz|webkit)-/) && !i.url.match('_'))

const limit = pLimit(10)
await Promise.all(
  searchIndex.map(i => limit(async () => {
    const data = await $fetch<any>(`${MDN}${i.url}/index.json`)
    i.summary = data?.doc?.summary
    i.title = i.title.replace(/\s+\(.*\)$/, '')
    i.url = MDN + i.url

    console.log(`got ${i.url}`)
  })),
)

await fs.writeJSON(path.join(__dirname, '../app/data/mdn-index.json'), searchIndex, { spaces: 2 })

export {}
