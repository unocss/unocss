---
title: Next.js
description: Getting started with UnoCSS and Next.js.
---

# Next.js

// TODO: link to examples

Getting Started with UnoCSS and Next.js.

## Setup

### Installation

::: code-group
  ```bash [pnpm]
  pnpm add -D unocss @unocss/webpack
  ```
  ```bash [yarn]
  yarn add -D unocss @unocss/webpack
  ```
  ```bash [npm]
  npm install -D unocss @unocss/webpack
  ```
:::

### Configuration

Create `uno.config.ts` at the root of your project.

```ts
// uno.config.ts
import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetUno,
  presetWebFonts
} from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    // ...
  ],
})
 ```

### Add plugin

Then add UnoCSS as a plugin to webpack through your `next.config.js`.

```js{9}
// next.config.js
const UnoCSS = require('@unocss/webpack').default

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.plugins.push(
      UnoCSS(),
    )
    return config
  },
}

module.exports = nextConfig
```

### Import stylesheets

Then import `uno.css` in `_app.tsx`.

```tsx
// _app.tsx
import '@unocss/reset/tailwind.css'
import 'uno.css'

import type { AppProps } from 'next/app'

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}

export default MyApp
```

## Usage

Style your components with unocss!

```tsx
/* index.tsx */
const Home: NextPage = () => {
  return (
    <>
      <main className="py-20 px-12 text-center flex flex-col items-center gap-20px">
        <span text="blue 5xl hover:red" cursor="default">Nextjs</span>
        <div className="i-carbon-car inline-block" text="4xl" />
        <button className="btn w-10rem">Button</button>
      </main>
    </>
  )
}
```

## Hot Module Reload

To support HMR you have to opt-out of webpack's caching.

```js{5}
// next.config.js
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
+   config.cache = false
    config.plugins.push(UnoCSS())
    return config
  }
}
```

## Troubleshooting

### Error concerning virtual module

```bash
Error: ENOENT: no such file or directory, open '.../_virtual_/__uno.css'
```

Try deleting the `.next` directory and restart the dev server.

### Other

You might need to bump your target up to at least `es2015` in your `tsconfig.json` to build your project.

Files with `.js` extension are not supported by default. Change your file extensions to `.jsx` or try to include js files in your config with `include: /\.js$/`. [Learn more](/guide/extracting#extracting-from-build-tools-pipeline).
