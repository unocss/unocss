import { createApp } from 'vue'
import App from './App.vue'
import 'uno.css'

// @ts-expect-error missing types
window.onload = () => import('uno:icons.css')
createApp(App).mount('#app')
