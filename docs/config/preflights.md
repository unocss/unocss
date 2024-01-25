---
title: Preflights
description: You can inject raw CSS as preflights from the configuration. The resolved theme is available to customize the CSS.
---

# Preflights

You can inject raw CSS as preflights from the configuration. The resolved `theme` is available to customize the CSS.

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
    `,
  },
]
```
