---
title: UnoCSS CLI
description: The CLI for UnoCSS (@unocss/cli).
---

# CLI

The command line interface for UnoCSS: `@unocss/cli`.

- 🍱 Extract utilities from scoped files
- 👀 [Watch mode](#development) included
- 🔌 Supports custom configurations via [`uno.config.ts`](#configurations)
- ⚙️ Various [options](#options) to customize the output
- 🚀 Supports multiple [entry patterns](#usage)

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

::: tip
To achieve more granular configuration management, we recommend using a configuration file. It also supports different levels of packaging and rewriting for scanned files.
:::

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
  /**
   * Whether to rewrite the transformed utilities.
   *
   * - For css: if rewrite is true, it will not generate a new file, but directly modify the original file content.
   * - For other files: if rewrite is true, it replaces the original file with the transformed content.
   *
   * @default false
   */
  rewrite?: boolean

  /**
   * Whether to output CSS files scanned from patterns to outFile
   *
   * - false: Do not output CSS files
   * - true: Transform and output scanned CSS file contents to outFile
   * - 'multi': Output each CSS file separately with filename format `${originFile}-[hash]`
   * - 'single': Merge multiple CSS files into one output file named `outFile-merged.css`
   *
   * @default true
   */
  splitCss?: boolean | 'multi' | 'single'
}
```

### Rewrite Source Files

Use the `--rewrite` flag to update your source files with transformed utilities. This is useful when you want to apply transformers (like [Variant Groups](/transformers/variant-group) or [Compile Class](/transformers/compile-class)) directly to your code.

```bash
unocss "src/**/*.vue" --rewrite
```

### CSS Splitting

When CSS files are included in the defined patterns, use the `--split-css` flag to control the output of CSS.

- false: Do not output CSS files
- true: Transform and output scanned CSS file contents to outFile
- 'multi': Output each CSS file separately with filename format `${originFile}-[hash]`
- 'single': Merge multiple CSS files into one output file named `outFile-merged.css`

```bash
unocss "src/**/*.vue" --split-css true|false|multi|single
```

### Default Preset

If no `uno.config.ts` file is found, the CLI will use a default preset. You can specify which version of the default preset to use with the `--preset` flag.

- `wind4`: Use the `preset-wind4`.
- `wind3`: Use the `preset-wind3`.

```bash
unocss "src/**/*.vue" --preset wind3|wind4
```

> Note: This option is ignored if a configuration file is present.

::: warning
Starting from version `v66.6.0`, `@unocss/cli` no longer provides a default preset. Users need to explicitly specify the `--preset` option or configure the preset in the configuration file.
:::

For a list of options, head over to the [UnoCSS configurations](/config/) docs.

## Options

| Options                     |                                                                                                                |
| --------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `-v, --version`             | Display the current version of UnoCSS                                                                          |
| `-c, --config [file]`       | Config file                                                                                                    |
| `-o, --out-file <file>`     | The output filename for the generated UnoCSS file. Defaults to `uno.css` in the current working directory      |
| `--stdout`                  | Write the generated UnoCSS file to STDOUT. Will cause the `--watch` and `--out-file` being ignored             |
| `-w, --watch`               | Indicates if the files found by the glob pattern should be watched                                             |
| `--preflights`              | Enable preflight styles                                                                                        |
| `--rewrite`                 | Update source files with transformed utilities                                                                 |
| `--write-transformed`       | Update source files with transformed utilities (deprecated, use `--rewrite`)                                   |
| `-m, --minify`              | Minify generated CSS                                                                                           |
| `--debug`                   | Enable debug mode                                                                                              |
| `--split-css [mode]`        | Whether to output CSS files scanned from patterns to outFile. Options: `true`, `false`, `multi`, `single`      |
| `--preset [default-preset]` | Switch `wind3` or `wind4` preset as default. If you have configured `uno.config`, this option will be ignored. |
| `-h, --help`                | Display available CLI options                                                                                  |
