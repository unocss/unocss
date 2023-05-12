# SvelteKit + UnoCSS Vite Plugin (svelte-scoped)

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz_small.svg)](https://stackblitz.com/fork/github/unocss/unocss/tree/main/examples/sveltekit-scoped)

Place generated CSS for each Svelte component's utility styles directly into the Svelte component's `<style>` block instead of in a global CSS file.

Read the [documentation](https://unocss.dev/integrations/svelte-scoped) to understand more.

## Demo Usage

```bash
npm install
npm run dev
```

## Class Compilation Summary Example

```svelte
<span class:logo />
<!-- Assuming logo is set as a shortcut and it is a variable in this component -->

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

will be transformed into this:

```svelte
<span class:uno-0hashz={logo} />

<div class="uno-1hashz">Hello</div>

<div class:uno-2hashz={bar}>World</div>
<div class:uno-2hashz={text-sm}>World</div>

<div class="uno-3hashz foo">
  <div class="uno-4hashz">Logo</div>
  <Button class="uno-4hashz">Login</Button>
</div>

<style>
  :global(.uno-1hashz) {
    --un-bg-opacity: 1;
    background-color: rgba(254, 226, 226, var(--un-bg-opacity));
    font-size: 1.125rem;
    line-height: 1.75rem;
  }

  :global(.uno-2hashz) {
    font-size: 0.875rem;
    line-height: 1.25rem;
  }

  :global(.uno-3hashz) {
    position: fixed;
    display: flex;
  }
  :global([dir="ltr"] .uno-3hashz) {
    left: 0rem;
  }
  :global([dir="rtl"] .uno-3hashz) {
    right: 0rem;
  }
  :global(.uno-3hashz > :not([hidden]) ~ :not([hidden])) {
    --un-space-x-reverse: 0;
    margin-left: calc(0.25rem * calc(1 - var(--un-space-x-reverse)));
    margin-right: calc(0.25rem * var(--un-space-x-reverse));
  }

  :global(.uno-4hashz) {
    padding-left:0.5rem;
    padding-right:0.5rem;
    padding-top:0.25rem;
    padding-bottom:0.25rem;
  }

  :global(.uno-0hashz) {
    /* logo shortcut styles will be put here... */
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

When this reaches the Svelte compiler it will remove the :global() wrappers, add it's own scoping hash just to the `div` and `.foo` rules.
