# Getting Started with UnoCSS and Nextjs

## Configuration 

#### 1. Installing the dependencies:

```bash
npm i -D unocss @unocss/webpack
```

<br>

#### 2. Add `unocss.config.ts` in the root of your project

```ts
// unocss.config.ts
import { defineConfig, presetAttributify, presetIcons, presetUno, presetWebFonts } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    // ...
  ],
})
 ```

#### 3. Add unocss as plugin to webpack through your `next.config.js`

```js
// next.config.js

const UnoCSS = require('@unocss/webpack').default

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.plugins.push(
      UnoCSS(), // <--
    )
    return config
  },
}

module.exports = nextConfig
```

<br>

#### 4. import `uno.css` in `_app.tsx`

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

<br>

## Hot Module Reload 
To support HMR you have to opt-out of webpacks caching.

```diff
// next.config.js

const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
+   config.cache = false
    config.plugins.push(
      UnoCSS({
        //...
      })
    )
    return config
  }
}
```
<br>

## Troubleshooting

#### Error concerning virtual module

```bash
Error: ENOENT: no such file or directory, open '.../_virtual_/__uno.css'
```

try deleting the `.next` directory and restart the dev server.

#### Other

- you might need to bump your target up to at least `es2015` in your `tsconfig.json` to build your project
- files with `.js` extension are not supported by default. Change your file extensions to `.jsx` or try to include js files in your config with `include: /\.js$/`. [Learn more](https://github.com/unocss/unocss#scanning).
