// https://vitepress.dev/guide/custom-theme
import { h, watch } from 'vue'
import Theme from 'vitepress/theme'
import './rainbow.css'
import './style.css'
import './overrides.css'
import 'uno.css'

import HomePage from './components/HomePage.vue'

let homePageStyle: HTMLStyleElement | undefined

export default {
  ...Theme,
  Layout: () => {
    return h(Theme.Layout, null, {
      'home-features-after': () => h(HomePage),
    })
  },
  enhanceApp({ router }) {
    if (typeof window === 'undefined')
      return

    watch(
      () => router.route.data.relativePath,
      () => updateHomePageStyle(location.pathname === '/'),
      { immediate: true },
    )
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

// Speed up the rainbow animation on home page
function updateHomePageStyle(value: boolean) {
  if (value) {
    if (homePageStyle)
      return

    homePageStyle = document.createElement('style')
    homePageStyle.innerHTML = `
    :root {
      animation: rainbow 12s linear infinite;
    }`
    document.body.appendChild(homePageStyle)
  }
  else {
    if (!homePageStyle)
      return

    homePageStyle.remove()
    homePageStyle = undefined
  }
}
