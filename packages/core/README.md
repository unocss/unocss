# @unocss/core

The core engine of [UnoCSS](https://github.com/unocss/unocss) without any presets. It can be used as the engine of your own atomic CSS framework.

## Usage

```ts
import { createGenerator } from '@unocss/core'

const generator = createGenerator({ /* user options */ }, { /* default options */ })

const { css } = await generator.generate(code)
```

## License

MIT License &copy; 2021-PRESENT [Anthony Fu](https://github.com/antfu)

