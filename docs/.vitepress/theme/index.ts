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
  enhanceApp(/* { app, router, siteData } */) {
    // ...
  },
}
