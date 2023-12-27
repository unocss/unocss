# Autocomplete

Autocomplete can be customized for UnoCSS's intelligent suggestions in <a href="/play" target="_blank" rel="noreferrer">playground</a> and the [VS Code extension](/integrations/vscode).
<!--eslint-skip-->
```ts
autocomplete: {
  templates: [
    // theme inferring
    'bg-$color/<opacity>',
    // short hands
    'text-<font-size>',
    // logic OR groups
    '(b|border)-(solid|dashed|dotted|double|hidden|none)',
    // constants
    'w-half',
  ],
  shorthands: {
    // equal to `opacity: "(0|10|20|30|40|50|60|70|90|100)"`
    'opacity': Array.from({ length: 11 }, (_, i) => i * 10),
    'font-size': '(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)',
    // override built-in short hands
    'num': '(0|1|2|3|4|5|6|7|8|9)',
  },
  extractors: [
      // ...extractors
  ],
}
```

- `templates` uses a simple DSL to specify the autocomplete suggestions.

- `shorthands` is a map of shorthand names to their templates. If it's a `Array`, it will be a logic OR group.

- `extractors` to pickup possible classes and transform class-name style suggestions to the correct format. For example, you could check how we implement the [attributify autocomplete extractor](https://github.com/unocss/unocss/blob/main/packages/preset-attributify/src/autocomplete.ts)

- For additional help, please refer to [here](/tools/autocomplete).
