---
title: Zed Extension for UnoCSS
---

# Zed Extension

The official [UnoCSS extension for Zed](https://github.com/unocss/zed). It runs the official [`@unocss/language-server`](https://www.npmjs.com/package/@unocss/language-server) for completion, hover, color previews and matched-utility underlining.

## Installation

::: info
The extension is not yet published to the Zed extension registry. The `unocss` entry currently in the registry is a separate [community extension](https://github.com/bajrangCoder/zed-unocss). Until publishing is finalized, install the official extension as a dev extension.
:::

1. Clone [`unocss/zed`](https://github.com/unocss/zed).
2. Run `zed: install dev extension` from the command palette.
3. Point it at the cloned repository's directory.

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

Unlike the VSCode extension (which draws its own underline), the underline in Zed is delivered via semantic tokens, so you opt in with two pieces of config.

1. Enable semantic tokens in Zed for the languages you use (the server emits the `unocss` token by default — a per-project `.zed/settings.json` is fine):

   ```json
   {
     "languages": {
       "HTML": { "semantic_tokens": "combined" },
       "TypeScript": { "semantic_tokens": "combined" }
     }
   }
   ```

   You can turn the server tokens off with:

   ```json
   { "lsp": { "unocss": { "settings": { "semanticTokens": false } } } }
   ```

2. Add the styling rule. The per-language `semantic_tokens` settings in step 1 work in a project `.zed/settings.json`, but the rule below uses `global_lsp_settings`, which Zed reads only from your **user** settings (`~/.config/zed/settings.json`) — that key is not available in a worktree-local `.zed/settings.json`:

   ```json
   {
     "global_lsp_settings": {
       "semantic_token_rules": [{ "token_type": "unocss", "underline": true }]
     }
   }
   ```

`underline: true` uses the current text color. For the other fields (`foreground_color`, `background_color`, `font_weight`, `font_style`, `strikethrough`, `style`) see Zed's [semantic token rules](https://zed.dev/docs/semantic-tokens) docs.

### Using theme styles

Instead of a fixed underline you can borrow a color from the active theme with the `style` field — a list of theme style names, first match wins (list fallbacks). `unocss` is a custom token type with no dedicated theme entry, so point it at an existing style; the look then adapts as you switch themes:

```json
{
  "global_lsp_settings": {
    "semantic_token_rules": [
      { "token_type": "unocss", "style": ["link_text", "function"] }
    ]
  }
}
```

## Bug Reports / Feature Requests

Report issues at the [extension's issue tracker](https://github.com/unocss/zed/issues).
