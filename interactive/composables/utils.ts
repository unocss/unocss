import { mdnIndex } from '~/data/mdn-index'
import type { RuleItem } from '~/types'

export function getDocs(item: RuleItem) {
  return item.features?.map(i => mdnIndex.value.find(s => s.title === i)!) || []
}
