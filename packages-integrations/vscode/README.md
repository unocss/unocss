<br>

<p align="center">
<img src="https://raw.githubusercontent.com/unocss/unocss/main/packages-integrations/vscode/res/logo.png" style="width:100px;" height="128" />
</p>

<h1 align="center">UnoCSS for VS Code</h1>

<p align="center">
<a href="https://marketplace.visualstudio.com/items?itemName=antfu.unocss" target="__blank"><img src="https://img.shields.io/visual-studio-marketplace/v/antfu.unocss.svg?color=eee&amp;label=VS%20Code%20Marketplace&logo=visual-studio-code" alt="Visual Studio Marketplace Version" /></a>
</p>

<br>

## Documentation

Please refer to the [documentation](https://unocss.dev/integrations/vscode).

## Commands

<!-- commands -->

| Command                         | Title                                           |
| ------------------------------- | ----------------------------------------------- |
| `unocss.reload`                 | UnoCSS: Reload UnoCSS                           |
| `unocss.insert-skip-annotation` | UnoCSS: Insert `@unocss-skip` for the selection |

<!-- commands -->

## Configurations

<!-- configs -->

| Key                             | Description                                              | Type           | Default    |
| ------------------------------- | -------------------------------------------------------- | -------------- | ---------- |
| `unocss.disable`                | Disable the UnoCSS extension                             | `boolean`      | `false`    |
| `unocss.languageIds`            |                                                          | `array`        | ``         |
| `unocss.root`                   | Project root that contains the UnoCSS configuration file | `array,string` | ``         |
| `unocss.include`                | Directory of files to be detected                        | `array,string` | ``         |
| `unocss.exclude`                | Directory of files not to be detected                    | `array,string` | ``         |
| `unocss.underline`              | Enable/disable underline decoration for class names      | `boolean`      | `true`     |
| `unocss.colorPreview`           | Enable/disable color preview decorations                 | `boolean`      | `true`     |
| `unocss.colorPreviewRadius`     | Radius for color preview                                 | `string`       | `"50%"`    |
| `unocss.remToPxPreview`         | Enable/disable rem to px preview in hover                | `boolean`      | `true`     |
| `unocss.remToPxRatio`           | Ratio of rem to px                                       | `number`       | `16`       |
| `unocss.selectionStyle`         | Enable/disable selection style decorations               | `boolean`      | `true`     |
| `unocss.strictAnnotationMatch`  | Be strict about where to show annotations                | `boolean`      | `false`    |
| `unocss.autocomplete.matchType` | The matching type for autocomplete                       | `string`       | `"prefix"` |
| `unocss.autocomplete.strict`    | Be strict about where to show autocomplete               | `boolean`      | `false`    |
| `unocss.autocomplete.maxItems`  | The maximum number of items to show in autocomplete      | `number`       | `1000`     |

<!-- configs -->

## License

MIT License &copy; 2021-PRESENT [Anthony Fu](https://github.com/antfu)
