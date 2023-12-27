# Getting Started with UnoCSS and Nextjs

This example is a [Next](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Configuration

#### 1. Installing the dependencies:

```bash
npm i -D unocss @unocss/postcss
```

<br>

#### 2. Add these files in the root of your project

```ts
// @filename uno.config.ts
import { defineConfig, presetUno } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    // ...
  ],
})
```

<br>

```ts
// @filename postcss.config.js
module.exports = {
  plugins: {
    '@unocss/postcss': {
      // Optional
      content: ['**/*.{html,js,ts,jsx,tsx}'],
    },
  },
}
```

#### 3. Update your `globals.css` file with UnoCSS

```css
// @filename src/app/globals.css
@import '@unocss/reset/tailwind.css';
@unocss all;
```

## Usage

Style your components using UnoCSS!

```tsx
// @filename src/app/page.tsx
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <p className="...">
          Get started by editing&nbsp;
          <code className="font-mono font-bold">src/app/page.tsx</code>
        </p>
      </div>
    </main>
  )
}
```

## Bonus

### Attributify preset

You can also import from `unocss` package other presets such as `presetAttributify` to enable [attributify mode](https://unocss.dev/presets/attributify#attributify-preset)

```ts
// @filename uno.config.ts
import { presetAttributify } from 'unocss'

export default defineConfig({
  presets: [
    presetAttributify(),
    // ...
  ],
})
 ```

Then you can style your components in attributify mode

```tsx
// @filename src/components/Resources.tsx
export const Resources: React.FC<{ resources: Resource[] }> = ({ resources }) => {
  return (
    <div
      m="b-32 lg:b-0"
      grid="~ lg:cols-4" // ~ is used as a prefix for self-referencing
      text="center lg:left"
    />
  )
}
```

For TypeScript support while using `AttributifyAttributes` make sure to read: [Attributify TypeScript Support](https://unocss.dev/presets/attributify#typescript-support-jsx-tsx)

### Icons preset

You can also import from `unocss` package `presetIcons` to enable using the [Icons Preset](https://unocss.dev/presets/icons) for any icon with Pure CSS for UnoCSS.

```ts
// @filename uno.config.ts
import { presetIcons } from 'unocss'

export default defineConfig({
  presets: [
    presetIcons({
      // Optional
      extraProperties: {
        'display': 'inline-block',
        'vertical-align': 'middle',
      },
    }),
    // ...
  ],
})
```

Then you can use any of the available icons:

```html
<span className='i-lucide:arrow-up-right' />
```

For more information on UnoCSS please visit the Docs [UnoCSS.dev](https://unocss.dev/)
