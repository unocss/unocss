---
title: Packages
description: "UnoCSS Packages: available packages and what's included and enabled in unocss."
outline: deep
---

# Packages

UnoCSS is a monorepo that contains multiple packages. This page lists all the packages and what's included in `unocss` package:

| Package                                                          | Description                                        | Included in `unocss` | Enabled |
|------------------------------------------------------------------|----------------------------------------------------|----------------------| ------------------ |
| [@unocss/core](/tools/core)                                      | The core library without preset                    | <span class="block i-carbon:checkbox-checked-filled text-green-600 dark:text-green-400 w-2em h-2em" />      | - |
| [@unocss/cli](/integrations/cli)                                 | Command line interface for UnoCSS                  | <span class="block i-carbon:checkbox-checked-filled text-green-600 dark:text-green-400 w-2em h-2em" />                    | - |
| [@unocss/preset-uno](/presets/uno)                               | The default preset                                 | <span class="block i-carbon:checkbox-checked-filled text-green-600 dark:text-green-400 w-2em h-2em" />                    | <span class="block i-carbon:checkbox-checked-filled text-green-600 dark:text-green-400 w-2em h-2em" /> |
| [@unocss/preset-mini](/presets/mini)                             | The minimal but essential rules and variants       | <span class="block i-carbon:checkbox-checked-filled text-green-600 dark:text-green-400 w-2em h-2em" />                    | <span class="block i-carbon:checkbox-checked-filled text-green-600 dark:text-green-400 w-2em h-2em" /> |
| [@unocss/preset-wind](/presets/wind)                             | Tailwind / Windi CSS compact preset                | <span class="block i-carbon:checkbox-checked-filled text-green-600 dark:text-green-400 w-2em h-2em" />                    | <span class="block i-carbon:checkbox-checked-filled text-green-600 dark:text-green-400 w-2em h-2em" /> |
| [@unocss/preset-attributify](/presets/attributify)               | Enables Attributify Mode for other rules           | <span class="block i-carbon:checkbox-checked-filled text-green-600 dark:text-green-400 w-2em h-2em" />                    | No |
| [@unocss/preset-tagify](/presets/tagify)                         | Enables Tagify Mode for other rules                | <span class="block i-carbon:checkbox-checked-filled text-green-600 dark:text-green-400 w-2em h-2em" />                    | No |
| [@unocss/preset-icons](/presets/icons)                           | Pure CSS Icons solution powered by Iconify         | <span class="block i-carbon:checkbox-checked-filled text-green-600 dark:text-green-400 w-2em h-2em" />                    | No |
| [@unocss/preset-web-fonts](/presets/web-fonts)                   | Web fonts (Google Fonts, etc.) support             | <span class="block i-carbon:checkbox-checked-filled text-green-600 dark:text-green-400 w-2em h-2em" />                    | No |
| [@unocss/preset-typography](/presets/typography)                 | The typography preset                              | <span class="block i-carbon:checkbox-checked-filled text-green-600 dark:text-green-400 w-2em h-2em" />                    | No |
| [@unocss/preset-rem-to-px](/presets/rem-to-px)                   | Coverts rem to px for utils                        | No                   | No |
| [@unocss/transformer-variant-group](/transformers/variant-group) | Transformer for Windi CSS's variant group feature  | <span class="block i-carbon:checkbox-checked-filled text-green-600 dark:text-green-400 w-2em h-2em" />                    | No |
| [@unocss/transformer-directives](/transformers/directives)       | Transformer for CSS directives like `@apply`       | <span class="block i-carbon:checkbox-checked-filled text-green-600 dark:text-green-400 w-2em h-2em" />                    | No |
| [@unocss/transformer-compile-class](/transformers/compile-class) | Compile group of classes into one class            | <span class="block i-carbon:checkbox-checked-filled text-green-600 dark:text-green-400 w-2em h-2em" />                    | No |
| [@unocss/transformer-attributify-jsx](/transformers/attributify-jsx) | Support valueless attributify in JSX/TSX           | <span class="block i-carbon:checkbox-checked-filled text-green-600 dark:text-green-400 w-2em h-2em" />                    | No |
| [@unocss/extractor-pug](/extractors/pug)                         | Extractor for Pug                                  | No                   | - |
| [@unocss/extractor-svelte](/extractors/svelte)                   | Extractor for Svelte                               | No                   | - |
| [@unocss/autocomplete](/tools/autocomplete)                      | Utils for autocomplete                             | No                   | - |
| [@unocss/config](/guide/config-file)                             | Configuration file loader                          | <span class="block i-carbon:checkbox-checked-filled text-green-600 dark:text-green-400 w-2em h-2em" />                    | - |
| [@unocss/reset](/guide/style-reset)                              | Collection of common CSS resets                    | <span class="block i-carbon:checkbox-checked-filled text-green-600 dark:text-green-400 w-2em h-2em" />                    | No |
| [@unocss/vite](/integrations/vite)                               | The Vite plugins                                   | <span class="block i-carbon:checkbox-checked-filled text-green-600 dark:text-green-400 w-2em h-2em" />                    | - |
| [@unocss/inspector](/tools/inspector)                            | The inspector UI for UnoCSS                        | <span class="block i-carbon:checkbox-checked-filled text-green-600 dark:text-green-400 w-2em h-2em" />                    | - |
| [@unocss/astro](/integrations/astro)                             | The Astro integration                              | <span class="block i-carbon:checkbox-checked-filled text-green-600 dark:text-green-400 w-2em h-2em" />                    | - |
| [@unocss/webpack](/integrations/webpack)                         | The Webpack plugin                                 | No                   | - |
| [@unocss/nuxt](/integrations/nuxt)                               | The Nuxt Module                                    | No                   | - |
| [@unocss/svelte-scoped](/integrations/svelte-scoped)                               | Svelte Scoped Vite plugin + Preprocessor                                 | No                   | - |
| [@unocss/next](/integrations/next)                               | The Next.js plugin                                 | No                   | - |
| [@unocss/runtime](/integrations/runtime)                         | CSS-in-JS Runtime for UnoCSS                       | No                   | - |
| [@unocss/eslint-plugin](/integrations/eslint)                    | ESLint plugin                                      | No                   | - |
| [@unocss/eslint-config](/integrations/eslint)                    | ESLint config                                      | No                   | - |
| [@unocss/postcss](/integrations/postcss)                         | The PostCSS plugin                                 | No                   | - |
| [VS Code Extension](/integrations/vscode)                        | UnoCSS for VS Code                                 | -                    | - |
