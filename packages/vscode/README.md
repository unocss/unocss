<br>

<p align="center">
<img src="https://raw.githubusercontent.com/unocss/unocss/main/packages/vscode/res/logo.png" style="width:100px;" />
</p>

<h1 align="center">UnoCSS for VS Code</h1>

<p align="center">
<a href="https://marketplace.visualstudio.com/items?itemName=antfu.unocss" target="__blank"><img src="https://img.shields.io/visual-studio-marketplace/v/antfu.unocss.svg?color=eee&amp;label=VS%20Code%20Marketplace&logo=visual-studio-code" alt="Visual Studio Marketplace Version" /></a>
</p>

> **Preview**

<br>

## Features

- Decoration and tooltip for matched utilities
- Loading configs from `uno.config.js`, `vite.config.js` or `nuxt.config.js`
- Count of matched utilities

## Config

By default the extension will search for the config files under project root. When there is no config found, the extension will be disabled. To work with monorepo, you need to change the `unocss.root` option in your `setting.json` to the directory that contains the config file.

```javascript
{
  "unocss.root": "packages/client"
}
```

## License

MIT License © 2021-PRESENT [Anthony Fu](https://github.com/antfu)


