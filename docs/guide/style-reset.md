---
title: Style Reset
description: UnoCSS does not provide style resetting or preflight by default for maximum flexibility and does not populate your global CSS.
---

# Browser Style Reset

UnoCSS does not provide style resetting or preflight by default for maximum flexibility and does not populate your global CSS. If you use UnoCSS along with other CSS frameworks, they probably already do the resetting for you. If you use UnoCSS alone, you can use resetting libraries like [Normalize.css](https://necolas.github.io/normalize.css/).

We also provide a small collection for you to grab them quickly:

```bash
npm i @unocss/reset
```

```ts
// main.js
// pick one of the following

// normalize.css
import '@unocss/reset/normalize.css'
// reset.css by Eric Meyer https://meyerweb.com/eric/tools/css/reset/index.html
import '@unocss/reset/eric-meyer.css'
// preflights from tailwind
import '@unocss/reset/tailwind.css'
// https://github.com/unocss/unocss/blob/main/packages/reset/tailwind-compat.md
import '@unocss/reset/tailwind-compat.css'
```

Learn more at [@unocss/reset](/tools/reset).
