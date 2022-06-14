# Getting Started with unocss and Nextjs

## Setup

 1. Installing the dependencies:

```bash
npm i -D concurrently unocss @unocss/webpack
#or
pnpm add -D concurrently unocss @unocss/webpack
#or
yarn add -D concurrently unocss @unocss/webpack
```

<br>
 2. Add `unocss.config.ts|js` in the root of your nextjs project

 ```bash
#project root

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

import { defineConfig, presetAttributify, presetIcons, presetUno, presetWebFonts } from 'unocss'

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

<br>
 3. import `../styles/uno.css` in `_app.tsx`

 ```tsx
 // _app.tsx

import '../styles/uno.css'

import type { AppProps } from 'next/app'

function MyApp({ Component, pageProps }: AppProps) {
   return <Component {...pageProps} />
}

export default MyApp
 ```

<br>
4. edit scripts in `package.json`

```json
{
  "scripts": {
    "dev": "concurrently \"unocss \"pages/**/*.tsx\" --out-file=\"styles/uno.css\" --watch\" \"next dev\"",
    "build": "unocss pages/**/*.tsx --out-file=styles/uno.css && next build",
    "start": "next start",
    "lint": "next lint",
    "css": "unocss pages/**/*.tsx --out-file=styles/uno.css"
  }
}
```

## Usage 

Style your components with unocss!

```tsx
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

## Multiple directories
For usage in multiple directories E.g. `pages/` and `components/` add both to your scripts in `packages.json` for unocss to watch.

```json
{
  "scripts": {
    "dev": "concurrently \"unocss \"pages/**/*.tsx\" \"components/**/*.tsx\" --out-file=\"styles/uno.css\" --watch\" \"next dev\""
  }
}
```

## Unocss presets used in this example
See following links for specifics. 

- [reset](https://github.com/unocss/unocss/tree/main/packages/reset) 
- [preset-attributify](https://github.com/unocss/unocss/tree/main/packages/preset-attributify) 
- [preset-icons](https://github.com/unocss/unocss/tree/main/packages/preset-icons) 
- [preset-uno](https://github.com/unocss/unocss/tree/main/packages/preset-uno) 
- [preset-web-fonts](https://github.com/unocss/unocss/tree/main/packages/preset-web-fonts) 


