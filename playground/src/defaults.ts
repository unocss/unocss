export const defaultHTML = `
<div h-full text-center flex select-none all:transition-400>
  <div ma>
    <div text-5xl fw100>
      unocss
    </div>
    <div op30 text-lg fw300 m1>
      The instant on-demand Atomic CSS engine.
    </div>
    <div m2 flex justify-center text-2xl op30 hover="op80">
      <a
        i-carbon-logo-github
        text-inherit
        href="https://github.com/antfu/unocss"
        target="_blank"
      ></a>
    </div>
  </div>
</div>
<div absolute bottom-5 right-0 left-0 text-center op30 fw300>
  on-demand · instant · fully customizable
</div>
`.trim()

export const defaultConfigRaw = `
import { defineConfig } from 'unocss'

export default defineConfig({
  rules: [
    ['custom-rule', { color: 'red' }]
  ]
})
`.trim()

export const defaultOptions = JSON.stringify({
  strict: true,
})
