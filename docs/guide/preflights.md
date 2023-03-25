---
title: Preflights
description: You can inject raw css as preflights from the configuration. The resolved theme is available to customize the css.
---

# Preflights

You can inject raw css as preflights from the configuration. The resolved `theme` is available to customize the css.

<!--eslint-skip-->

```ts
preflights: [
  {
    getCSS: ({ theme }) => `
      * {
        color: ${theme.colors.gray?.[700] ?? '#333'};
        padding: 0;
        margin: 0;
      }
    `
  }
]
```