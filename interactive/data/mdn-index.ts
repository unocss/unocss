import type { DocItem } from '../types'
import index from './mdn-index.json'

export const mdnIndex = (index as DocItem[])
  .map((i) => {
    i.type = 'mdn'
    return i
  })
