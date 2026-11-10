import type { ThemeInput } from '../context'
import { createValueHandler } from '@unocss/rule-utils'
import * as valueHandlers from './handlers'

export const handler = createValueHandler<string, ThemeInput>(valueHandlers)
export const h = handler

export { valueHandlers }
