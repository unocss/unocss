---
title: Inspector
description: The inspector UI for UnoCSS (@unocss/inspector).
---

# Inspector

The inspector UI for UnoCSS: `@unocss/inspector`.
Ships with `unocss` and `@unocss/vite`.

The inspector allows you to inspect the generated CSS rules and the applied classes for each file. It also provides a REPL to test your utilities based on your current configuration.

Built on top of [devframe](https://devfra.me/), the inspector can be hosted in several ways.

## Vite DevTools (recommended)

When [Vite DevTools](https://devtools.vite.dev/) (`@vitejs/devtools`) is installed, the inspector is mounted automatically as a **UnoCSS dock** inside it — no auth prompt, live updates included.

`vite build` with DevTools' static build also bakes a pre-computed snapshot of the inspector data into the export, so the analysis is viewable without a dev server.

## Standalone URL

Visit <a href="http://localhost:5173/__unocss" target="_blank" rel="noreferrer">localhost:5173/\_\_unocss</a> in your Vite dev server to see the inspector.

On first use, enter the one-time 6-digit code printed in your dev server terminal to unlock it (the token is remembered per browser). When Vite DevTools is active, this URL redirects into the DevTools UI instead.

::: info
The standalone URL is a deprecated surface — the Vite DevTools dock is the recommended way to use the inspector going forward.
:::

## Element inspector overlay

Enable the element inspector directly in your application's Vite dev server:

```ts
import UnoCSS from 'unocss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    UnoCSS({
      inspector: { overlay: true },
    }),
  ],
})
```

Click the UnoCSS button or press **Cmd/Ctrl+U**, hover over an element, then click to select it. Press **Escape** to close the selection. Drag the button or the panel's logo to reposition it.

The overlay includes basic element information, class and attributify toggles, inline style editing, flex/grid layout controls, a box model, text/HTML editing, a DOM tree, CSS search with history, and UnoCSS configuration details. DOM edits are temporary and do not write back to source files.

CSS search, layout previews, and settings use the same authenticated devframe backend as the inspector. Enter the one-time code from the dev server terminal when prompted inside these panels. The other panels work directly with the page DOM. The UI and its styles are isolated in a shadow root.

The overlay is opt-in and only injected during development. `inspector: false` disables both the overlay and the inspector backend.

To work on the overlay in this repository, run `pnpm --filter @unocss/inspector build` and `pnpm --filter @unocss/inspector build-post`, enable the option in a Vite application, then run `pnpm --filter @unocss/inspector dev:overlay` to rebuild the overlay as you edit it.

## Other hosts

`@unocss/inspector/devframe` exports the inspector as a portable [devframe definition](https://devfra.me/), mountable by any devframe host:

- `createInspectorDevframe(ctx)` — bind the inspector to an existing UnoCSS plugin context.
- `createStandaloneInspectorDevframe(options)` — build a standalone context by scanning project files, for hosts without a bundler-integrated UnoCSS context (e.g. a Next.js app using `@unocss/postcss` via [`@devframes/next`](https://devfra.me/frameworks/next)).

<img src="https://user-images.githubusercontent.com/11247099/140885990-1827f5ce-f12a-4ed4-9d63-e5145a65fb4a.png" loading="lazy" alt="UnoCSS Inspector" />
<img src="https://user-images.githubusercontent.com/11247099/140886020-7014f412-f020-4aed-a169-d025cc1bbcd3.png" loading="lazy" alt="UnoCSS Inspector REPL" />
