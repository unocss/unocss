---
title: Core
description: The core engine of UnoCSS without any presets. It can be used as the engine of your own atomic CSS framework.
---

# Core

The core engine of UnoCSS without any presets: `@unocss/core`. It can be used as the engine of your own atomic CSS framework.

## Installation

::: code-group
  ```bash [pnpm]
  pnpm add -D @unocss/core
  ```
  ```bash [yarn]
  yarn add -D @unocss/core
  ```
  ```bash [npm]
  npm install -D @unocss/core
  ```
:::

## Usage

```ts
import { createGenerator } from '@unocss/core'

const generator = createGenerator(
  { /* user options */ },
  { /* default options */ }
)

const { css } = await generator.generate(code)
```

## License

- MIT License &copy; 2021-PRESENT [Anthony Fu](https://github.com/antfu)
