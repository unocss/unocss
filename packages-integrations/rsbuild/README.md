# @unocss/rsbuild

Native UnoCSS integration for Rsbuild and Rspack.

## Rsbuild

```ts
import { defineConfig } from '@rsbuild/core'
import { pluginUnoCSS } from '@unocss/rsbuild'

export default defineConfig({
  plugins: [
    pluginUnoCSS(),
  ],
})
```

Import the virtual CSS entry from your application:

```ts
import 'uno.css'
```

## Rspack

```ts
import { UnoCSSRspackPlugin } from '@unocss/rsbuild/rspack'

export default {
  plugins: [
    new UnoCSSRspackPlugin(),
  ],
}
```

## License

MIT License &copy; 2026-PRESENT [UnoCSS Authors](https://github.com/unocss/unocss/graphs/contributors)
