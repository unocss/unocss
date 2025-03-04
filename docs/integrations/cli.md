---
title: UnoCSS CLI
description: The CLI for UnoCSS (@unocss/cli).
---

# CLI

The command line interface for UnoCSS: `@unocss/cli`.

- 🍱 Suited for traditional backends like Laravel or Kirby
- 👀 [Watch mode](#development) included
- 🔌 Supports custom configurations via [`uno.config.ts`](#configurations)

## Installation

This package is shipped with the `unocss` package:

::: code-group

```bash [pnpm]
pnpm add -D unocss
```

```bash [yarn]
yarn add -D unocss
```

```bash [npm]
npm install -D unocss
```

```bash [bun]
bun add -D unocss
```

:::

You can also install the standalone package:

::: code-group

```bash [pnpm]
pnpm add -D @unocss/cli
```

```bash [yarn]
yarn add -D @unocss/cli
```

```bash [npm]
npm install -D @unocss/cli
```

```bash [bun]
bun add -D @unocss/cli
```

:::

::: info
If you are not able to find the binary (e.g. with `pnpm` and only `unocss` is installed), you'll need to explicit install `@unocss/cli` standalone package.
:::

## Usage

You can also pass multiple glob patterns to `@unocss/cli`:

```bash
unocss "site/snippets/**/*.php" "site/templates/**/*.php"
```

Example package configuration:

::: info
Make sure to add escaped quotes to your npm script glob patterns.
:::

```json [package.json]
{
  "scripts": {
    "dev": "unocss \"site/{snippets,templates}/**/*.php\" --watch",
    "build": "unocss \"site/{snippets,templates}/**/*.php\""
  },
  "devDependencies": {
    "@unocss/cli": "latest"
  }
}
```

### Development

Add the `--watch` (or `-w`) flag to enable watching for file changes:

```bash
unocss "site/{snippets,templates}/**/*.php" --watch
```

### Production

```bash
unocss "site/{snippets,templates}/**/*.php"
```

The final `uno.css` will be generated to the current directory by default.

## Built-in features

### Configurations

Create a `uno.config.js` or `uno.config.ts` configuration file the root-level of your project to customize UnoCSS.

```ts [uno.config.ts]
import { defineConfig } from 'unocss'

export default defineConfig({
  cli: {
    entry: {}, // CliEntryItem | CliEntryItem[]
  },
  // ...
})

interface CliEntryItem {
  /**
   * Glob patterns to match files
   */
  patterns: string[]
  /**
   * The output filename for the generated UnoCSS file
   */
  outFile: string
}
```

For a list of options, head over to the [UnoCSS configurations](/config/) docs.

## Options

| Options                    |                                                                                                           |
| -------------------------- | --------------------------------------------------------------------------------------------------------- |
| `-v, --version`            | Display the current version of UnoCSS                                                                     |
| `-c, --config-file <file>` | Config file                                                                                               |
| `-o, --out-file <file>`    | The output filename for the generated UnoCSS file. Defaults to `uno.css` in the current working directory |
| `--stdout`                 | Write the generated UnoCSS file to STDOUT. Will cause the `--watch` and `--out-file` being ignored        |
| `-w, --watch`              | Indicates if the files found by the glob pattern should be watched                                        |
| `--preflights`             | Enable preflight styles                                                                                   |
| `--write-transformed`      | Update source files with transformed utilities                                                            |
| `-m, --minify`             | Minify generated CSS                                                                                      |
| `-h, --help`               | Display available CLI options                                                                             |
