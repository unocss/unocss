import routes from 'virtual:generated-pages'
import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import App from './App.vue'
import '@unocss/reset/tailwind.css'
import 'floating-vue/dist/style.css'

import 'splitpanes/dist/splitpanes.css'
import 'uno:icons.css'
import './main.css'
import 'uno.css'

const app = createApp(App)
app.use(createRouter({
  history: createWebHashHistory(),
  routes,
}))
app.mount('#app')
