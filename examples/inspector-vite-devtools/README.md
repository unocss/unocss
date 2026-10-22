# UnoCSS Inspector — Vite DevTools

Vite app with UnoCSS and [Vite DevTools](https://devtools.vite.dev)
(`devtools: true` + `@vitejs/devtools`). The inspector is mounted as a
**dock** inside Vite DevTools.

## Dev

```sh
pnpm install
pnpm dev
```

Open [http://localhost:5173/\_\_devtools/](http://localhost:5173/__devtools/)
and pick the **UnoCSS** dock — inside the DevTools host the inspector is
trusted automatically (no code prompt). Visiting `/__unocss/` directly
redirects to the DevTools UI.

## Static build (RPC dump)

```sh
pnpm build
pnpm preview
```

The build bakes a static DevTools export — including a pre-computed RPC dump
of the inspector's project overview and per-module analysis — into the output,
viewable without a dev server.
