---
title: Configuring UnoCSS
description: Configurations are what make UnoCSS powerful.
outline: deep
---

# Configuring UnoCSS

## Configuration
Configurations are what make UnoCSS powerful.

- [Rules](/config/rules) - Define atomic CSS utilities
- [Shortcuts](/config/shortcuts) - Combine multiple rules into a single shorthand.
- [Theme](/config/theme) - Define theme variables.
- [Variants](/config/variants) - Apply custom conventions to rules.
- [Extractors](/config/extractors) - Define where and how the usage of utilities are extracted.
- [Preflights](/config/preflights) - Define global raw CSS.
- [Layers](/config/layers) - Define the order of each utilities layer.
- [Presets](/config/presets) - Predefined configurations for common use cases.
- [Transformers](/config/transformers) - Code transformers to user sources code to support conventions.
- [Autocomplete](/config/autocomplete) - Define customized autocomplete suggestions.

## Options

### rules
- **Type:** `Rule<Theme>[]`

Rules to generate CSS utilities. Later entries have higher priority.

### shortcuts

- **Type:** `UserShortcuts<Theme>`

Similar to Windi CSS's shortcuts, allows you to create new utilities by combining existing ones. Later entries have higher priority.

### theme
- **Type:** `Theme`

Theme object for shared configuration between rules.

### extendTheme

- **Type:** `Arrayable<ThemeExtender<Theme>>`
Custom functions mutate the theme object.

It's also possible to return a new theme object to completely replace the original one.

### variants

- **Type:** `Variant<Theme>[]`

Variants that preprocess the selectors, having the ability to rewrite the CSS object.

### extractors

- **Type:** `Extractor[]`

Extractors to handle the source file and output possible classes/selectors. Can be language-aware.

### preflights
- **Type:** `Preflight<Theme>[]`

Raw CSS injections.

### layers
- **Type:** `Record<string, number>`

Layer orders. Default to 0.

### outputToCssLayers
- **Type:** `boolean | UseCssLayersOptions`
- **Default:** `false`

Outputs the layers to CSS Cascade Layers.

#### cssLayerName
- **Type:** `(internalLayer: string) => string | undefined | null`

Specifies the name of the CSS layer the internal layer should be output to (can be a sublayer e.g. "mylayer.mysublayer").

If `undefined` is return, the internal layer name wil be used as the CSS layer name.
If `null` is return, the internal layer will not be output to a CSS layer.

### sortLayers
- **Type:** `(layers: string[]) => string[]`

Custom function to sort layers.

### presets

- **Type:** `(PresetOrFactory<Theme> | PresetOrFactory<Theme>[])[]`

Predefined configurations for common use cases.

### transformers
- **Type:** `SourceCodeTransformer[]`

Custom transformers to the source code.

### blocklist

- **Type:** `BlocklistRule[]`

Rules to exclude the selectors for your design system (to narrow down the possibilities). Combining `warnExcluded` options can also help you identify wrong usages.

### safelist

- **Type:** `string[]`

Utilities that are always included.

### preprocess

- **Type:** `Arrayable<Preprocessor>`

Preprocess the incoming utilities, return falsy value to exclude.

### postprocess

- **Type:** `Arrayable<Postprocessor>`

Postprocess the generate utils object.

### separators

- **Type:** `Arrayable<string>`
- **Default:** `[':', '-']`

Variant separator.

### extractorDefault
- **Type:** `Extractor | null | false`
- **Default:** `import('@unocss/core').defaultExtractor`

Default extractor that are always applied. By default it split the source code by whitespace and quotes.

It maybe be replaced by preset or user config, only one default extractor can be presented, later one will override the previous one.

Pass `null` or `false` to disable the default extractor.

### autocomplete

Additional options for auto complete.

#### templates

- **Type:** `Arrayable<AutoCompleteFunction | AutoCompleteTemplate>`

Custom functions / templates to provide autocomplete suggestions.

#### extractors

- **Type:** `Arrayable<AutoCompleteExtractor>`

Custom extractors to pickup possible classes and transform class-name style suggestions to the correct format.

#### shorthands

- **Type:** `Record<string, string | string[]>`

Custom shorthands to provide autocomplete suggestions. if values is an array, it will be joined with `|` and wrapped with `()`.

### content

Options for sources to be extracted as utilities usages.

Supported sources:
- `filesystem` - extract from file system
- `plain` - extract from plain inline text
- `pipeline` - extract from build tools' transformation pipeline, such as Vite and Webpack

The usage extracted from each source will be **merged** together.

#### filesystem

- **Type:** `string[]`
- **Default:** `[]`

Glob patterns to extract from the file system, in addition to other content sources.

In dev mode, the files will be watched and trigger HMR.

#### inline

- **Type:** `string | { code: string; id?: string } | (() => Awaitable<string | { code: string; id?: string }>)) []`

Inline text to be extracted.

#### pipeline

Filters to determine whether to extract certain modules from the build tools' transformation pipeline.

Currently only works for Vite and Webpack integration.

Set `false` to disable.

##### include

- **Type:** `FilterPattern`
- **Default:** `[/\.(vue|svelte|[jt]sx|mdx?|astro|elm|php|phtml|html)($|\?)/]`

Patterns that filter the files being extracted. Supports regular expressions and `picomatch` glob patterns.

By default, `.ts` and `.js` files are NOT extracted.

##### exclude

- **Type:** `FilterPattern`
- **Default:** `[/\.(css|postcss|sass|scss|less|stylus|styl)($|\?)/]`

Patterns that filter the files NOT being extracted. Supports regular expressions and `picomatch` glob patterns.

By default, `node_modules` and `dist` are also extracted.

### configResolved

- **Type:** `(config: ResolvedConfig) => void`

Hook to modify the resolved config.

First presets runs first and the user config.

### configFile

- **Type:** `string | false`

Load from configs files.

Set `false` to disable.

### configDeps

- **Type:** `string[]`

List of files that will also trigger config reloads.

### cli
UnoCSS CLI options.

#### entry
- **Type:** `Arrayable<CliEntryItem>`

UnoCSS cli entry points.

##### patterns
- **Type:** `string[]`

Glob patterns to extract from the file system.

##### outFile
- **Type:** `string`

Output file path.

### shortcutsLayer

- **Type:** `string`
- **Default:** `'shortcuts'`

Layout name of shortcuts.

### envMode

- **Type:** `'dev' | 'build'`
- **Default:** `'build'`

Environment mode.

### details

- **Type:** `boolean`

Expose internal details for debugging / inspecting.

### warn

- **Type:** `boolean`
- **Default:** `true`

Emit warning when matched selectors are presented in blocklist.
