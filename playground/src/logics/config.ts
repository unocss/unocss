import type { UserConfig } from 'unocss'
import { createConfig } from '../../unocss.config.client'

export const defaultConfig = computed(() => createConfig({ dev: true }) as UserConfig<any>)
