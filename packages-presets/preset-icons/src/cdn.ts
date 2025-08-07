import type { UniversalIconLoader } from '@iconify/utils'
import { createCDNFetchLoader } from './core'

export async function createCDNLoader(
  cdnBase: string,
): Promise<UniversalIconLoader> {
  const { $fetch } = await import('ofetch')
  return createCDNFetchLoader($fetch, cdnBase)
}
