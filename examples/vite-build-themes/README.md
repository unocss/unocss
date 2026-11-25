# Build themes example

One page with two theme facets: three clients (`acme`, `globex`, `initech`) and two editions (`standard`, `premium`), written side by side in [`index.html`](./index.html).

```bash
pnpm dev                          # acme + standard
CLIENT=globex EDITION=premium pnpm dev
pnpm build                        # one build per theme combination
```

`pnpm compare` builds the page with runtime themes (`THEMES=runtime`, every theme ships and is switched with `data-*` attributes) and once per theme combination with [`@unocss/transformer-build-themes`](https://unocss.dev/transformers/build-themes), then prints the HTML and CSS size of each build.
