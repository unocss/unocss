---
title: UnoCSS Language Server
---

# LSP Support for UnoCSS

UnoCSS Language Server provides IDE-like support for UnoCSS in any editor that supports LSP (Neovim, VS Code, Emacs, etc).

:::info
Note: This is a **community-maintained language server, not officially maintained by the UnoCSS team**. Use at your own discretion. Report issues at [xna00/unocss-language-server](https://github.com/xna00/unocss-language-server).
:::

## Installation

```bash
npm install -g unocss-language-server
```

## Features

- Auto-completion for UnoCSS utilities
- Hover documentation with CSS previews

## Usage

Start the language server with:

```bash
unocss-language-server --stdio
```

Configure your editor’s LSP client to connect to it.

## Bug Reports / Feature Requests

Report it at [Issue Tracker](https://github.com/xna00/unocss-language-server/issues)
