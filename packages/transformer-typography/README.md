# @unocss/transformer-typography

<!-- @unocss-ignore -->

Style generated content in familiar way.

## Usage

```bash
npm i -D @unocss/transformer-typography
```

```ts
import { defineConfig } from 'unocss'
import transformerTypography from '@unocss/transformer-typography'

export default defineConfig({
  utilities: {
    // utility class name, e.g., <markdown-renderer class="prose" :input="input" />
    prose: {
      // key is the selector, and value is the utilities classes
      'p': ['text-sans', 'leading-loose'],
      'pre code': ['bg-gray-200', 'rounded', 'text-sm', 'lg:text-base', 'font-mono'],
    }
  }
})
```

## Caveats

- Variants requiring specific classes might not work, e.g., `dark:` might require a `dark` class on the
  element.

  A work-around is to define them in different utilities like

  ```ts
  transformerTypography({
    utilities: {
      'prose': {
        p: ['text-gray-800']
      },
      'prose-dark': {
        p: ['text-white']
      }
    }
  })
  ```

  and then use it on the wrapper element like `<markdown-renderer class='prose dark:prose-dark'>`

## License

MIT License &copy; 2022-PRESENT [equt](https://github.com/equt)