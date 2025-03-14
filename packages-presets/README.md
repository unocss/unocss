# UnoCSS Presets Packages

Opinionated presets for UnoCSS. To serve as a good starting point for using UnoCSS in end projects. Also to demonstrate and dog-fooding on how to create presets/transformers/extractors for UnoCSS.

| Package                                                                    | Description                                         | Included in `unocss` | Enabled |
| -------------------------------------------------------------------------- | --------------------------------------------------- | -------------------- | ------- |
| [unocss](./unocss)                                                         | The default package with common presets and plugins | -                    | -       |
| [@unocss/preset-mini](./preset-mini)                                       | The minimal but essential rules and variants        | ✅                   | ✅      |
| [@unocss/preset-wind3](./preset-wind3)                                     | Tailwind / Windi CSS compact preset                 | ✅                   | ✅      |
| [@unocss/preset-attributify](./preset-attributify)                         | Enables Attributify Mode for other rules            | ✅                   | No      |
| [@unocss/preset-tagify](./preset-tagify)                                   | Enables Tagify Mode for other rules                 | ✅                   | No      |
| [@unocss/preset-icons](./preset-icons)                                     | Pure CSS Icons solution powered by Iconify          | ✅                   | No      |
| [@unocss/preset-web-fonts](./preset-web-fonts)                             | Web fonts (Google Fonts, etc.) support              | ✅                   | No      |
| [@unocss/preset-typography](./preset-typography)                           | The typography preset                               | ✅                   | No      |
| [@unocss/preset-rem-to-px](./preset-rem-to-px)                             | Coverts rem to px for utils                         | No                   | No      |
| [@unocss/transformer-variant-group](./transformer-variant-group)           | Transformer for Windi CSS's variant group feature   | ✅                   | No      |
| [@unocss/transformer-directives](./transformer-directives)                 | Transformer for CSS directives like `@apply`        | ✅                   | No      |
| [@unocss/transformer-compile-class](./transformer-compile-class)           | Compile group of classes into one class             | ✅                   | No      |
| [@unocss/transformer-attributify-jsx](./transformer-attributify-jsx)       | Support valueless attributify in JSX/TSX            | ✅                   | No      |
| [@unocss/transformer-attributify-jsx-babel](./transformer-attributify-jsx) | Support valueless attributify in JSX/TSX (Babel)    | No                   | No      |
| [@unocss/extractor-pug](./extractor-pug)                                   | Extractor for Pug                                   | No                   | -       |
| [@unocss/extractor-svelte](./extractor-svelte)                             | Extractor for Svelte                                | No                   | -       |
| [@unocss/extractor-mdc](./extractor-mdc)                                   | Extractor for MDC                                   | No                   | -       |
| [@unocss/extractor-arbitrary-variants](./extractor-arbitrary-variants)     | Arbitrary variants for utils                        | No                   | No      |
| [@unocss/reset](./reset)                                                   | Collection of common CSS resets                     | No                   | No      |
| [@unocss/rule-utils](./rule-utils)                                         | The utilities for creating rules/presets for UnoCSS | No                   | -       |
