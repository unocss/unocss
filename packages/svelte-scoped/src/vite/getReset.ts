import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { UnocssSvelteScopedViteOptions } from './types'

const _dirname = typeof __dirname !== 'undefined'
  ? __dirname
  : dirname(fileURLToPath(import.meta.url))

// Method 1: Include @unocss/reset as a dependency of svelte-scoped. This works in my machine with pnpm but will it always work?
export function getReset(addReset: UnocssSvelteScopedViteOptions['addReset']): string | undefined {
  if (addReset === 'eric-meyer')
    return readFileSync(resolve(_dirname, '../node_modules/@unocss/reset/eric-meyer.css'), 'utf-8')

  if (addReset === 'normalize')
    return readFileSync(resolve(_dirname, '../node_modules/@unocss/reset/normalize.css'), 'utf-8')

  if (addReset === 'sanitize')
    return readFileSync(resolve(_dirname, '../node_modules/@unocss/reset/sanitize/sanitize.css'), 'utf-8')
    // this one is bit more complicated with a base reset and additional resets for specific areas https://unocss.dev/guide/style-reset#sanitize-css. Do we provide the base and point people to https://github.com/csstools/sanitize.css#usage for direct CDN imports if they want more than the base?

  if (addReset === 'tailwind')
    return readFileSync(resolve(_dirname, '../node_modules/@unocss/reset/tailwind.css'), 'utf-8')

  if (addReset === 'tailwind-compat')
    return readFileSync(resolve(_dirname, '../node_modules/@unocss/reset/tailwind-compat.css'), 'utf-8')
}

// Method 2: copy resets into svelte-scoped/dist/reset at build/stub time
// readFileSync(resolve(_dirname, 'reset/normalize.css'), 'utf-8')
