# Transformers

Provides a unified interface to transform source code in order to support conventions.

```ts
// my-transformer.ts
import { createFilter } from '@rollup/pluginutils'
import { SourceCodeTransformer } from 'unocss'

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
