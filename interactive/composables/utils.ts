import type { RuleItem } from '~/types'
import { mdnIndex } from '~/data/mdn-index'

export function getDocs(item: RuleItem) {
  return item.features?.map(i => mdnIndex.find(s => s.title === i)!) || []
}
