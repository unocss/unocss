import { createApp } from 'vue'
import Inspector from './Inspector.vue'
import './style.css'
import 'uno.css'

function mount() {
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

if (document.readyState === 'loading')
  document.addEventListener('DOMContentLoaded', mount, { once: true })
else
  mount()
