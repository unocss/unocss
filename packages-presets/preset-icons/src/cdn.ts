import type { UniversalIconLoader } from '@iconify/utils'
import { $fetch } from 'ofetch'
import { createCDNFetchLoader } from './core'

export function createCDNLoader(
  cdnBase: string,
): UniversalIconLoader {
  return createCDNFetchLoader($fetch, cdnBase)
}
