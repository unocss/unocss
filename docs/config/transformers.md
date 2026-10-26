# Transformers

Provides a unified interface to transform source code in order to support conventions.

```ts [my-transformer.ts]
import { SourceCodeTransformer } from 'unocss'
import { createFilter } from 'unplugin-utils'

export default function myTransformers(options: MyOptions = {}): SourceCodeTransformer {
  return {
    name: 'my-transformer',
    enforce: 'pre', // enforce before other transformers
    idFilter(id) {
      // only transform .tsx and .jsx files
      return id.match(/\.[tj]sx$/)
    },
    async transform(code, id, { uno }) {
      // code is a MagicString instance
      code.appendRight(0, '/* my transformer */')
    },
  }
}
```

You can check [official transformers](/presets/#transformers) for more examples.

## Programmatic usage

Transformers are applied by the integrations (Vite, Webpack, CLI, etc.). When you use [`@unocss/core`](/tools/core) directly, `createGenerator` resolves `transformers` from your config but doesn't run them, so you need to apply them to your source code yourself before extracting utilities:

```ts
import type { UnocssPluginContext } from '@unocss/core'
import { createGenerator } from '@unocss/core'
import MagicString from 'magic-string'
import config from './uno.config'

const uno = await createGenerator(config)
const tokens = new Set<string>()

// the subset of the plugin context used by the official transformers
const ctx = { uno, tokens, invalidate: () => {} } as unknown as UnocssPluginContext

async function applyTransformers(code: string, id: string) {
  for (const enforce of ['pre', 'default', 'post'] as const) {
    for (const t of uno.config.transformers ?? []) {
      if ((t.enforce ?? 'default') !== enforce)
        continue
      if (t.idFilter && !t.idFilter(id))
        continue
      if (t.codeFilter && !t.codeFilter(code, id))
        continue
      const s = new MagicString(code)
      await t.transform(s, id, ctx)
      code = s.toString()
    }
  }
  return code
}

const code = await applyTransformers(source, 'src/App.vue')
await uno.applyExtractors(code, 'src/App.vue', tokens)
const { css } = await uno.generate(tokens)
```

Use the transformed `code` in place of the original source, since transformers like [Variant Group](/transformers/variant-group) and [Compile Class](/transformers/compile-class) rewrite the class names in it. The same goes for your CSS files when using [Directives](/transformers/directives).

This doesn't cover what the integrations add on top, such as the `@unocss-ignore` and `@unocss-skip` comments, or source maps.
