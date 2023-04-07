// https://vitepress.dev/guide/custom-theme
import { h } from 'vue'
import Theme from 'vitepress/theme'
import './rainbow.css'
import './style.css'
import './overrides.css'
import 'uno.css'

import HomePage from './components/HomePage.vue'

export default {
  ...Theme,
  Layout: () => {
    return h(Theme.Layout, null, {
      'home-features-after': () => h(HomePage),
    })
  },
}

if (typeof window !== 'undefined') {
  // detect browser, add to class for conditional styling
  const browser = navigator.userAgent.toLowerCase()
  if (browser.includes('chrome'))
    document.documentElement.classList.add('browser-chrome')
  else if (browser.includes('firefox'))
    document.documentElement.classList.add('browser-firefox')
  else if (browser.includes('safari'))
    document.documentElement.classList.add('browser-safari')
}
