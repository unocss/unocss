# UnoCSS Inspector — Next.js

Next.js app using UnoCSS through `@unocss/postcss`, hosting the inspector
with [`@devframes/next`](https://devfra.me/frameworks/next) — no Vite
involved.

The catch-all route at `app/%5F_unocss/[[...path]]/route.ts` builds a
standalone UnoCSS context (scanning `app/**` once at startup via
`createStandaloneInspectorDevframe`) and serves the inspector SPA + RPC
side-car through `createDevframeNextHandler`.

```sh
pnpm install
pnpm dev
```

Open [http://localhost:3000/\_\_unocss/](http://localhost:3000/__unocss/) and
enter the one-time code printed in the Next dev terminal to unlock the
inspector.

Note: the standalone context scans the project once at startup — restart the
dev server (or re-save the route file) to re-scan after adding new utilities.
