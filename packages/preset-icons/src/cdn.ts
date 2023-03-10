import type { UniversalIconLoader } from '@iconify/utils/lib/loader/types'
import { $fetch } from 'ofetch'
import { createCDNFetchLoader } from './core'

export function createCDNLoader(cdnBase: string): UniversalIconLoader {
  return createCDNFetchLoader($fetch, cdnBase)
}
