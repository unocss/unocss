/// <reference types="vite/client" />
/// <reference types="vue/ref-macros" />
/// <reference types="@quasar/app-vite" />

// Mocks all files ending in `.vue` showing them as plain Vue instances
declare module '*.vue' {
  import type { DefineComponent } from 'vue'

  const component: DefineComponent<{}, {}, any>
  export default component
}
