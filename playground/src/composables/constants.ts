import defaultConfigRaw from '#docs/default-config.ts?raw'
import { version as bundleVersion } from '../../../package.json'

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
        aria-label="GitHub repository of the project"
      ></a>
    </div>
  </div>
</div>
<div absolute bottom-5 right-0 left-0 text-center op30 fw300>
  on-demand · instant · fully customizable
</div>
`.trim()

export {
  bundleVersion,
  defaultConfigRaw,
}

export const defaultCSS = `
/* Write custom CSS here, and transformer support. For example: */
/* .custom {
  font-weight: 500;
  @apply p1 text-(white xl);
  background-color: theme('colors.red.400');
} */
`.trim()
export const customCSSLayerName = 'playground'

export const defaultOptions = '{}'

export const STORAGE_KEY = 'last-search'
