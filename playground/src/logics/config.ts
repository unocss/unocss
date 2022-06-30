import { evaluateUserConfig } from '@unocss/shared-docs'
import { defaultConfigRaw } from '../defaults'

export const defaultConfig = await evaluateUserConfig(defaultConfigRaw)
