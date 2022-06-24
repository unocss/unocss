# @unocss/cli

The CLI for UnoCSS. A perfect fit for traditional backends.

## Key Features

- 🍱 Suited for traditional backends like Laravel or Kirby
- 👀 [Watch mode](#development) included
- 🔌 Supports custom configurations via [`unocss.config.js`](#unocssconfigjs-support)

## Requirements

- Node 14+ (Node 16 recommended)

## Installation

This package is shipped with the `unocss` package:

```bash
npm i -D unocss
```

You can also install it standalone:

```bash
npm i -D @unocss/cli
```

## Usage

You can also pass multiple glob patterns to `@unocss/cli`:

```bash
unocss "site/snippets/**/*.php" "site/templates/**/*.php"
```

Example package configuration:

> ℹ️ Make sure to add escaped quotes to your npm script glob patterns.

```json
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

## Built-in Features

### Configurations

Create a `unocss.config.js` or `unocss.config.ts` configuration file the root-level of your project to customize UnoCSS.

```js
import { defineConfig } from 'unocss'

export default defineConfig({
  shortcuts: [
    { box: 'max-w-7xl mx-auto bg-gray-100 rounded-md shadow-sm p-4' },
  ],
})
```

For a list of options, head over to the [UnoCSS configurations](https://github.com/unocss/unocss#configurations) docs.

## CLI Options

> Inspect all available options with `unocss --help`.

### `--out-file`

The output filename for the generated UnoCSS file. Defaults to `uno.css` in the current working directory.

### `--watch`

Indicates if the files found by the glob pattern should be watched.

## License

MIT License &copy; 2021-PRESENT [Anthony Fu](https://github.com/antfu)

MIT License &copy; 2021-PRESENT [Johann Schopplich](https://github.com/johannschopplich)
