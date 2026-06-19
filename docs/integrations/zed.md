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

Zed compiles the extension to wasm; the language server itself is fetched from npm on first use. See the extension's [README](https://github.com/unocss/unocss/tree/main/packages-integrations/zed#readme) for languages, settings, and how to enable the utility underline.

## Bug Reports / Feature Requests

Report issues at the [UnoCSS issue tracker](https://github.com/unocss/unocss/issues).
