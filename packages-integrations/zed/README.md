# UnoCSS for Zed

A [Zed](https://zed.dev) extension that runs the official
[`@unocss/language-server`](https://www.npmjs.com/package/@unocss/language-server)
for completion, hover, color previews and matched-utility underlining.

Unlike the older `bajrangCoder/zed-unocss` extension, this one:

- attaches to **`TypeScript`** and **`CSS`** (not just `TSX`), so plain `.ts`
  files — e.g. **Lit** components with `class="..."` inside `` html`...` ``
  template literals — get completion and hover.
- uses the **official** `@unocss/language-server` instead of a fork.

## Install (dev extension)

1. `zed: install dev extension` from the command palette.
2. Point it at this `packages-integrations/zed/` directory.

Zed compiles the Rust crate to wasm; the language server itself is fetched from
npm on first use via Zed's bundled Node.

## Requirement for plain `.ts` / `.js` (Lit, vanilla web components)

The language server only offers completion in files that pass UnoCSS's content
**pipeline filter**. By default that filter does **not** include `.ts`/`.js`
(only `.vue`, `.svelte`, `.[jt]sx`, `.html`, …). This is a server/config
behaviour — no editor extension can override it.

To get completion inside Lit `.ts` files, opt them into the pipeline in your
`uno.config` / Vite config:

```ts
UnoCSS({
  content: {
    pipeline: {
      include: [
        /\.(vue|svelte|[jt]sx|mdx?|astro|elm|php|phtml|html)($|\?)/,
        /\.[jt]s($|\?)/, // <- scan plain .ts/.js (Lit html`...` templates)
      ],
    },
  },
  // ...presets
})
```

Alternatively add `// @unocss-include` to the top of individual files.

## Settings

Configure the server under `lsp.unocss.settings` in Zed `settings.json`. Keys
are forwarded under the `unocss` namespace the server expects:

```json
{
  "lsp": {
    "unocss": {
      "settings": {
        "root": "./",
        "remToPxRatio": 16,
        "autocomplete": { "matchType": "fuzzy" }
      }
    }
  }
}
```

## Languages

`HTML`, `CSS`, `JavaScript`, `TypeScript`, `TSX`, `Vue.js`, `Svelte`, `Astro`,
`Markdown`, `PHP`, `ERB`. (Framework languages such as `Vue.js`/`Svelte`/`Astro`
only exist when their own Zed extensions are installed.)

## Underlining matched utilities (semantic tokens)

The server emits every matched utility as a `unocss` semantic token, so editors
can style them — an editor-agnostic take on the VSCode `unocss.underline`
decoration. It is **off by default** (the same server backs VSCode, which has
its own underline), so to use it in Zed:

1. Turn the feature on in the server and enable semantic tokens for the relevant
   languages (per-project `.zed/settings.json` is fine — see the example shipped
   in this directory):
   ```json
   {
     "lsp": { "unocss": { "settings": { "semanticTokens": true } } },
     "languages": { "HTML": { "semantic_tokens": "combined" }, "TypeScript": { "semantic_tokens": "combined" } }
   }
   ```
2. Add the styling rule. **This MUST go in your USER settings**
   (`~/.config/zed/settings.json`) — `global_lsp_settings` is read via
   `get_global`, so unlike the per-language `semantic_tokens` above it is not
   picked up from a worktree-local `.zed/settings.json`:
   ```json
   { "global_lsp_settings": { "semantic_token_rules": [{ "token_type": "unocss", "underline": "#888888" }] } }
   ```

`underline` accepts `true` (text color) or a hex string. Other fields:
`foreground_color`, `background_color`, `font_weight`, `font_style`,
`strikethrough`, `style`.
