import { createValueHandler } from '@unocss/rule-utils'
import * as valueHandlers from './handlers'

export const handler = createValueHandler(valueHandlers)
export const h = handler

export { valueHandlers }
