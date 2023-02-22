import { evaluateUserConfig } from '@unocss/shared-docs'
import type { UserConfig } from '@unocss/core'

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
