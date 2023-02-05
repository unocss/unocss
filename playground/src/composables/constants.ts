import defaultConfigRaw from '../../../packages/shared-docs/src/defaultConfig.ts?raw'
import { version } from '../../../package.json'

export const defaultHTML = `
<div h-full text-center flex select-none all:transition-400>
  <div ma>
    <div text-5xl fw100 animate-bounce-alt animate-count-infinite animate-duration-1s>
      UnoCSS
    </div>
    <div op30 text-lg fw300 m1>
      The instant on-demand Atomic CSS engine.
    </div>
    <div m2 flex justify-center text-2xl op30 hover="op80">
      <a
        i-carbon-logo-github
        text-inherit
        href="https://github.com/unocss/unocss"
        target="_blank"
      ></a>
    </div>
  </div>
</div>
<div absolute bottom-5 right-0 left-0 text-center op30 fw300>
  on-demand · instant · fully customizable
</div>
`.trim()

export { defaultConfigRaw, version }

export const defaultOptions = '{}'

export const STORAGE_KEY = 'last-search'
