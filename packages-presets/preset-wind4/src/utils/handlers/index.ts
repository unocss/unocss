import type { Theme } from '../../theme'
import { createValueHandler } from '@unocss/rule-utils'
import * as valueHandlers from './handlers'

export const handler = createValueHandler<string, Theme>(valueHandlers)
export const h = handler

export { valueHandlers }
