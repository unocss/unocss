export const defaultHTML = `
<div h-full text-center flex select-none all:transition-400>
  <div ma class="group">
    <div text-5xl fw100 group-hover="op80">
      unocss
    </div>
    <div op30 fw200 mt1 tracking-wider group-hover="op100 c-teal">
      Re-imaging Atomic-CSS
    </div>
    <div m5 flex justify-center text-2xl op30 group-hover="op80">
      <a
        i-carbon-logo-github
        text-inherit
        href="https://github.com/antfu/unocss"
        target="_blank"
      ></a>
    </div>
  </div>
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
