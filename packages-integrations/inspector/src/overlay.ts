import type { Plugin } from 'vite'

export interface InspectorOptions {
  /**
   * Inject the element inspector into the application during development.
   * Use Cmd/Ctrl+U to select an element and Escape to close it.
   *
   * @default false
   */
  overlay?: boolean
}

export function createOverlayPlugin(): Plugin {
  return {
    name: 'unocss:inspector:overlay',
    apply: 'serve',
    transformIndexHtml: {
      order: 'post',
      handler() {
        return [{
          tag: 'script',
          attrs: {
            type: 'module',
            // The inspector middleware is mounted at the server root,
            // independently of the application's Vite base.
            src: '/__unocss/overlay/index.js',
          },
          injectTo: 'body',
        }]
      },
    },
  }
}
