import '@unocss/reset/tailwind.css'
import 'splitpanes/dist/splitpanes.css'
import 'uno:icons.css'
import './main.css'
import 'uno.css'

import routes from 'virtual:generated-pages'
import { createRouter, createWebHashHistory } from 'vue-router'
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)
app.use(createRouter({
  history: createWebHashHistory(),
  routes,
}))
app.mount('#app')
