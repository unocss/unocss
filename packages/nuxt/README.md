# @unocss/nuxt

Nuxt module for UnoCSS

## Supporting Status

| | Nuxt 2 | Nuxt Bridge | Nuxt 3 |
| --- | --- | --- | --- |
| Webpack Dev | ✅ | ✅ | 🚧 |
| Webpack Build | ✅ | ✅ | ✅ |
| Vite Dev | - | ✅ | ✅ |
| Vite Build | - | ✅ | ✅ |

## Installation

```bash
npm i -D @unocss/nuxt
```

```js
// nuxt.config.js

export default {
  modules: [
    '@unocss/nuxt',
  ],
}
```

## Configuration

In the Nuxt module, we also provided some shortcuts for official presets:

```js
// nuxt.config.js

export default {
  modules: [
    '@unocss/nuxt',
  ],
  unocss: {
    // presets
    uno: true, // enabled `@unocss/preset-uno`
    icons: true, // enabled `@unocss/preset-icons`
    attributify: true, // enabled `@unocss/preset-attributify`,

    // core options
    shortcuts: [],
    rules: [],
  },
}
```

## License

MIT License &copy; 2021-PRESENT [Anthony Fu](https://github.com/antfu)
