# @unocss/reset

Collection of standard reset CSS stylesheets.

```bash
npm i @unocss/reset
```

```ts
// main.js
// pick one of the following

// normalize.css https://necolas.github.io/normalize.css/
import '@unocss/reset/normalize.css'

// sanitize.css https://github.com/csstools/sanitize.css#usage
import '@unocss/reset/sanitize/sanitize.css'
import '@unocss/reset/sanitize/assets.css'

// reset.css by Eric Meyer https://meyerweb.com/eric/tools/css/reset/index.html
import '@unocss/reset/eric-meyer.css'

// preflights from tailwind
import '@unocss/reset/tailwind.css'

// based on tailwind preflights, with some clean up to avoid conflicts with UI frameworks.
// https://github.com/unocss/unocss/blob/main/packages/reset/tailwind-compat.md
import '@unocss/reset/tailwind-compat.css'
```


