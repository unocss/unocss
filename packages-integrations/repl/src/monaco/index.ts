import * as monaco from 'monaco-editor'
import UnoMonaco from './UnoMonaco.vue'

export { monaco }
export type { UnoProviderSource } from './setup'
export { createConfigProviderSource, ensureMonacoSetup, registerUnoProviders } from './setup'
export { UnoMonaco }
export default UnoMonaco
