import { evaluateUserConfig } from '@unocss/shared-docs'
import type { UserConfig } from '@unocss/core'
import { unocssBundle } from '../../../packages/shared-docs/src/unocss-bundle'
import { bundlePackages } from '../../../packages/shared-docs/src/packages'

export const defaultConfig = ref<UserConfig | undefined>()

const bundle = (selectedVersion.value === 'latest' || !selectedVersion.value)
  ? unocssBundle
  : new Map(
    bundlePackages.map(p => [p, () => import(/* @vite-ignore */ `https://esm.sh/${p}@${selectedVersion.value}`)]),
  )

export async function load() {
  try {
    defaultConfig.value = await evaluateUserConfig(defaultConfigRaw, bundle)
  }
  catch (e) {
    console.error(e)
  }
}

load()
