# Getting Started with unocss and Nextjs

## Configuration 

#### 1. Installing the dependencies:

```bash
npm i -D unocss @unocss/webpack
#or
pnpm add -D unocss @unocss/webpack
#or
yarn add -D unocss @unocss/webpack
```

<br>

#### 2. Add `unocss.config.js` in the root of your nextjs project

 ```bash
├── root
  ├── next.config.js
  ├── next-env.d.ts
  ├── node_modules
  ├── package.json
  ├── pages
  ├── public
  ├── README.md
  ├── shims.d.ts
  ├── styles
  ├── tsconfig.json
  └── unocss.config.ts
 ```

 ```ts
// unocss.config.ts

const { defineConfig, presetAttributify, presetIcons, presetUno, presetWebFonts } = require('unocss')

export default defineConfig({
   presets: [
     presetUno(),
     presetIcons(),
     presetAttributify(),
     presetWebFonts({
       provider: 'google',
       fonts: {
         sans: 'Roboto',
       },
     }),
   ],
   shortcuts: [
     ['btn', 'px-4 py-1 rounded inline-block bg-teal-600 text-white cursor-pointer hover:bg-teal-700 disabled:cursor-default disabled:bg-gray-600 disabled:opacity-50'],
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
      UnoCSS(),

    )
    return config
  },
}

module.exports = nextConfig
```
It is also possible to configure unocss purely in `next.config.js`: 
```js
// next.config.js
// ...
    config.plugins.push(
      UnoCSS({
        presets: [
          presetAttributify(),
          presetWebFonts({
            provider: 'google',
            fonts: {
              sans: 'Roboto',
            },
          }),
          presetUno(),
        ],
        shortcuts: [
          ['btn', 'px-4 py-1 rounded inline-block bg-teal-600 text-white cursor-pointer hover:bg-teal-700 disabled:cursor-default disabled:bg-gray-600 disabled:opacity-50'],
        ],
      }),

    )
    return config
// ...
```

<br>

#### 4. import `uno.css` in `_app.tsx`

 ```ts
 // _app.tsx

import '../styles/uno.css'

import type { AppProps } from 'next/app'

function MyApp({ Component, pageProps }: AppProps) {
   return <Component {...pageProps} />
}

export default MyApp
 ```


## Usage 

Style your components with unocss!

```ts
/* index.tsx */

const Home: NextPage = () => {
  return (
    <>
      <main className="py-20 px-12 text-center flex flex-col items-center gap-20px">
        <span text="blue 5xl hover:red" cursor="default"> Nextjs</span>
        <div className="i-carbon-car inline-block" text="4xl" />
        <button className="btn w-10rem">Button</button>
      </main>
    </>
  )
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
- files with `.js` extension are not supported by default. Change your file extensions to `.jsx` or try to 
include js files in your config with `include: /\.js$/`
## Unocss presets used in this example
See following links for specifics. 

- [reset](https://github.com/unocss/unocss/tree/main/packages/reset) 
- [preset-attributify](https://github.com/unocss/unocss/tree/main/packages/preset-attributify) 
- [preset-icons](https://github.com/unocss/unocss/tree/main/packages/preset-icons) 
- [preset-uno](https://github.com/unocss/unocss/tree/main/packages/preset-uno) 
- [preset-web-fonts](https://github.com/unocss/unocss/tree/main/packages/preset-web-fonts) 


