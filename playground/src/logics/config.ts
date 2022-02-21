import type { UserConfig } from 'unocss'
import { createConfig } from '../../unocss.config'
import { options } from './url'

export const defaultConfig = computed(() =>
  createConfig({
    strict: !!options.value.strict,
    dev: true,
  }) as UserConfig<any>,
)
