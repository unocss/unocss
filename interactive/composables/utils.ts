import type { RuleItem } from '~/types'
import { mdnIndex } from '~/data/mdn-index'

export function getDocs(item: RuleItem) {
  return item.features?.map(i => mdnIndex.value.find(s => s.title === i)!) || []
}
