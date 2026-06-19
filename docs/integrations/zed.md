---
title: Zed Extension for UnoCSS
---

# Zed Extension

The official [UnoCSS extension for Zed](https://github.com/unocss/unocss/tree/main/packages-integrations/zed), maintained in the UnoCSS monorepo. It runs the official [`@unocss/language-server`](https://www.npmjs.com/package/@unocss/language-server) for completion, hover, color previews and matched-utility underlining.

## Installation

::: info
The extension is not yet published to the Zed extension registry. The `unocss` entry currently in the registry is a separate [community extension](https://github.com/bajrangCoder/zed-unocss). Until publishing is finalized, install the official extension as a dev extension.
:::

1. Run `zed: install dev extension` from the command palette.
2. Point it at the `packages-integrations/zed/` directory of a UnoCSS checkout.

Zed compiles the extension to wasm; the language server itself is fetched from npm on first use.

Once installed, the language server attaches automatically to the supported languages (HTML, CSS, JavaScript, TypeScript, TSX, Vue, Svelte, Astro, Markdown, PHP, ERB) — open a project that has a `uno.config.*` and completion, hover and color previews start working. No manual activation is needed.

## Configuration

Configure the server under `lsp.unocss.settings` in your Zed `settings.json`. Keys are forwarded under the `unocss` namespace the server expects:

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

## Underlining matched utilities

Unlike the VSCode extension (which draws its own underline), the underline in Zed is delivered via semantic tokens, so you opt in with three pieces of config.

1. Turn the feature on in the server and enable semantic tokens for the languages you use (a per-project `.zed/settings.json` is fine):

   ```json
   {
     "lsp": { "unocss": { "settings": { "semanticTokens": true } } },
     "languages": {
       "HTML": { "semantic_tokens": "combined" },
       "TypeScript": { "semantic_tokens": "combined" }
     }
   }
   ```

2. Add the styling rule. This **must** go in your **user** settings (`~/.config/zed/settings.json`) — Zed reads `semantic_token_rules` globally and ignores worktree-local `.zed/settings.json`:

   ```json
   { "global_lsp_settings": { "semantic_token_rules": [{ "token_type": "unocss", "underline": "#888888" }] } }
   ```

`underline` accepts `true` (use the text color) or a hex string. Other supported fields include `foreground_color`, `background_color`, `font_weight`, `font_style` and `strikethrough`.

## Bug Reports / Feature Requests

Report issues at the [UnoCSS issue tracker](https://github.com/unocss/unocss/issues).
