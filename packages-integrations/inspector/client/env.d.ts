declare module '*.vue' {
  import type { DefineComponent } from 'vue'

  const component: DefineComponent
  export default component
}

interface ImportMetaEnv {
  /** Absolute base URL of the standalone client dev server's RPC backend. */
  readonly VITE_INSPECTOR_RPC_BASE?: string
  /** Serialized devframe connection descriptor for that backend. */
  readonly VITE_INSPECTOR_RPC_META?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
