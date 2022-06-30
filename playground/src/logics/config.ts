import { evaluateUserConfig } from '@unocss/shared-docs'
import type { UserConfig } from '@unocss/core'
import { defaultConfigRaw } from '../defaults'

export const defaultConfig = ref<UserConfig | undefined>()

export async function load() {
  try {
    defaultConfig.value = await evaluateUserConfig(defaultConfigRaw)
  }
  catch (e) {
    console.error(e)
  }
}

load()
