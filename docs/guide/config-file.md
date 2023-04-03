# Config File

We **highly recommend to use a dedicated `uno.config.ts` file** to config your UnoCSS, in order to get the best experience with IDEs and other integrations.

A full featured config file looks like this:

```ts
// uno.config.ts
import {
  defineConfig, presetAttributify, presetIcons,
  presetTypography, presetUno, presetWebFonts,
  transformerDirectives, transformerVariantGroup
} from 'unocss'

export default defineConfig({
  shortcuts: [
    // ...
  ],
  theme: {
    colors: {
      // ...
    }
  },
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons(),
    presetTypography(),
    presetWebFonts({
      fonts: {
        // ...
      },
    }),
  ],
  transformers: [
    transformerDirectives(),
    transformerVariantGroup(),
  ],
})
```

Compared to the inline configuration inside your `vite.config.ts` or other tools configurations, the dedicated config file will work better with [IDEs](/integrations/vscode) and integrations with other tools like the [ESLint plugin](/integrations/eslint), and also make HMR work better.

By default, UnoCSS will automatically look for `uno.config.{js,ts,mjs,mts}` or `unocss.config.{js,ts,mjs,mts}` in the root directory of your project. You can also specify the config file manually, for example in Vite:

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import UnoCSS from 'unocss/vite'

export default defineConfig({
  plugins: [
    UnoCSS({
      configFile: '../my-uno.config.ts',
    })
  ]
})
```

For the full list of supported configration options, please refer to the [Config reference](/config/).
