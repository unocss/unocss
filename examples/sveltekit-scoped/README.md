# SvelteKit + UnoCSS Vite Plugin (svelte-scoped mode)

- Works with @sveltejs/kit@1.0.0-next.506 (release candidate) and @sveltejs/adapter-auto@1.0.0-next.80
- Uses PresetUno and PresetIcons
- Uses `svelte-scoped` mode
- Doesn't need `extractorSvelte` to be able to use `class:red-bg-200={foo}` or the shorthand of `class:red-bg-200` if you happen to also make your variable the same name as your class.
- Includes usage example of `@unocss/transformer-directives`'s `--at-apply: text-lg underline` ability

## Notes

- To use preflights add `<style uno:preflights global></style>` to your root `+layout.svelte`
- To use safelist add `<style uno:safelist global></style>` to your root `+layout.svelte`
- Or to use both, add `<style uno:preflights uno:safelist global></style>` to your root `+layout.svelte` as demoed in this example repo. If you only want them to apply to 1 component just add them to that component's `style` tag and don't add `global`.

## Before

```svelte
<div class="bg-red-100 text-lg">Hello</div>

<div class:text-sm={bar}>World</div>
<div class:text-sm>World</div>

<div class="fixed flex top:0 ltr:left-0 rtl:right-0 space-x-1 foo">
  <div class="px-2 py-1">Logo</div>
  <Button class="py-1 px-2">Login</Button>
</div>

<style>
  div {
    --at-apply: text-blue-500 underline;
  }
  .foo {
    color: red;
  }
</style>
```

## After

```svelte
<div class="uno-1hashza">Hello</div>

<div class:uno-2hashza={bar}>World</div>
<div class:uno-2hashza={text-sm}>World</div>

<div class="uno-3hashza foo">
  <div class="uno-4hashza">Logo</div>
  <Button class="uno-4hashza">Login</Button>
</div>

<style>
  :global(.uno-1hashza) {
    --un-bg-opacity: 1;
    background-color: rgba(254, 226, 226, var(--un-bg-opacity));
    font-size: 1.125rem;
    line-height: 1.75rem;
  }

  :global(.uno-2hashza) {
    font-size: 0.875rem;
    line-height: 1.25rem;
  }

  :global(.uno-3hashza) {
    position: fixed;
    display: flex;
  }
  :global([dir="ltr"] .uno-3hashza) {
    left: 0rem;
  }
  :global([dir="rtl"] .uno-3hashza) {
    right: 0rem;
  }
  :global(.uno-3hashza > :not([hidden]) ~ :not([hidden])) {
    --un-space-x-reverse: 0;
    margin-left: calc(0.25rem * calc(1 - var(--un-space-x-reverse)));
    margin-right: calc(0.25rem * var(--un-space-x-reverse));
  }

  :global(.uno-4hashza) {
    padding-left:0.5rem;
    padding-right:0.5rem;
    padding-top:0.25rem;
    padding-bottom:0.25rem;
  }
  
  div {
    --un-text-opacity: 1;
    color: rgba(59, 130, 246, var(--un-text-opacity));
    text-decoration-line: underline;
  }

  .foo {
    color: red;
  }
</style>
```