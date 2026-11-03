import { startInspector } from './bootstrap'
import './style.css'
import 'uno.css'

async function mount() {
  if (document.getElementById('unocss-inspector-root'))
    return

  // Load the UI and its eager RPC transport only in the top-level page.
  const [{ createApp }, { default: Inspector }] = await Promise.all([
    import('vue'),
    import('./Inspector.vue'),
  ])
  if (document.getElementById('unocss-inspector-root'))
    return

  const host = document.createElement('div')
  host.id = 'unocss-inspector-root'
  // Keep host application CSS and inspector CSS in separate trees.
  host.style.cssText = 'position:fixed;inset:0;z-index:2147483647;pointer-events:none'
  const shadow = host.attachShadow({ mode: 'open' })
  const stylesheet = document.createElement('link')
  stylesheet.rel = 'stylesheet'
  // Keep this URL runtime-resolved: Vite's asset transform would inline
  // the source stylesheet instead of loading the complete emitted CSS.
  const moduleUrl = import.meta.url
  stylesheet.href = new URL('./style.css', moduleUrl).href
  shadow.appendChild(stylesheet)
  const container = document.createElement('div')
  shadow.appendChild(container)
  document.body.appendChild(host)
  const app = createApp(Inspector)
  app.mount(container)

  import.meta.hot?.dispose(() => {
    app.unmount()
    host.remove()
  })
}

startInspector(mount)
