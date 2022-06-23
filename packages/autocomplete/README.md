# @unocss/autocomplete

Autocomplete utils for UnoCSS. This is embedded in [the playground](https://uno.antfu.me/play/) and [the VS Code extension](https://github.com/unocss/unocss/tree/main/packages/vscode).

## Syntax

To add autocomplete support to your custom rules:

### Static Rules

Static rules like this will just works without any configuration.

```ts
rules: [
  ['flex', { display: 'flex' }]
]
```

### Dynamic Rules

For dynamic rules, you can provide an extra `meta` object to the rule and specify the autocomplete template.

```ts
rules: [
  [
    /^m-(\d)$/,
    ([, d]) => ({ margin: `${d / 4}rem` }),
    { autocomplete: 'm-<num>' }, // <-- this
  ],
]
```

The template uses a simle DSL to specify the autocomplete suggestions. The syntax is:

- `(...|...)`: logic OR groups. `|` as the separator. Will be used as suggestions when the some of the groups match.
- `<...>`: built-in short hands. currently supports `<num>`, `<percent>` and `<directions>`
- `$...`: theme infering. for example, `$colors` will list all the properties of the `colors` object of the theme.

For examples:

###### Example 1

- **Template**: `(border|b)-(solid|dashed|dotted|double|hidden|none)`
- **Input**: `b-do`
- **Suggestions**: `b-dashed`, `b-double`

###### Example 2

- **Template**: `m-<num>`
- **Input**: `m-`
- **Suggestions**: `m-1`, `m-2`, `m-3` ...

###### Example 3

- **Template**: `text-$colors`
- **Input**: `text-r`
- **Suggestions**: `text-red`, `text-rose` ...

###### Example 4

For multiple templates

- **Template**: `['(border|b)-<num>', '(border|b)-<directions>-<num>']`

- **Input**: `b-`
- **Suggestions**: `b-x`, `b-y`, `b-1`, `b-2` ...

- **Input**: `b-x-`
- **Suggestions**: `b-x-1`, `b-x-2` ...

## License

MIT License &copy; 2021-PRESENT [Anthony Fu](https://github.com/antfu)
