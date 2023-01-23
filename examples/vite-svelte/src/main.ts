// Can include styles reset here https://github.com/unocss/unocss#style-resetting
// import '@unocss/reset/tailwind.css'

import 'uno.css'

import App from './App.svelte'

const app = new App({
  target: document.getElementById('app'),
})

export default app
