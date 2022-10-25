# SvelteKit + UnoCSS Vite Plugin (svelte-scoped)

## Why?

### Scoping utility classes by component unleashes creativity

A global css file that only includes used utilities is great for small and medium apps, but there will come a point in a large project's life when every time you start to write a class like `.md:max-w-[50vw]` that you know is only going to be used once you start to cringe as you feel the size of your global style sheet getting larger and larger. This inhibits creativity. Sure, you could use `@apply md:max-w-[50vw]` in the style block but that gets tedious. Styles in context are so useful. Furthermore, if you would like to include a great variety of icons in your project, you will begin to feel the weight of adding them to the global stylesheet. When each component bears the weight of its own styles and icons you can continue to expand your project without building an evergrowing global stylesheet.

Another benefit is that if used to build a component library, your library won't need to match the particular Uno, Windi, Tailwind setup/version of your sites. This allows for easier of upgrades of all parts of your ecosystem, because they work well together but aren't dependent on each other. You also won't need to include a global stylesheet alongside your components for them to be used properly. You only need to pay attention to global theme variables and style resets.

### Completely isolated styles are impractical

There is a problem with purely isolated styles though. Many styles are dependent on elements and styles set in a parent or child component, such as `dark:`, `rtl:`, and `.space-x-1`. The issue of how to pass styles down to children components has often come up in Svelte chat threads. Fortunately `svelte-scoped` mode solves all of these problems as each utility class (or set of classes) is scoped based on filename + class name(s) hashes and made global. Because they are global they will have influence everywhere and because their names are unique they will conflict nowhere.

## Usage

Set up using `mode: 'svelte-scoped'` as described in the [Svelte/SvelteKit scoped section](/packages/vite/README.md#sveltesveltekit-scoped-mode) of the [Vite instructions](/packages/vite/README.md).

### Preflights & Safelist

- To use preflights add `<style uno:preflights global></style>` to your root `+layout.svelte` (some classes depend on these, like `.shadow`)
- To use safelist add `<style uno:safelist global></style>` to your root `+layout.svelte`
- Or to use both, add `<style uno:preflights uno:safelist global></style>` to your root `+layout.svelte` or a component imported there as demoed in this example repo. If you only want them to apply to 1 component just add them to that component's `style` tag and don't add `global`.

### Resets

Import reset stylesheets and anything else that you want utility classes to override in the head of `app.html` file before `%sveltekit.head%`. At present, placing them in your root layout file won't guarantee they are loaded in before specific component styles.

### Parent dependent classes

```svelte
<div class="ltr:left-0 rtl:right-0"></div>
```

turns into:

```svelte
<div class="uno-3hashz"></div>

<style>
  :global([dir="ltr"] .uno-3hashz) {
    left: 0rem;
  }
  :global([dir="rtl"] .uno-3hashz) {
    right: 0rem;
  }
</style>
```

### Children affecting classes

If an element in your component wants to add space between 3 children elements of which some are in separate components you can now do that:

```svelte
<div class="space-x-1">
  <div>Status</div>
  <Button>FAQ</Button>
  <Button>Login</Button>
</div>
```

turns into:

```svelte
<div class="uno-7haszz">
  <div>Status</div>
  <Button>FAQ</Button>
  <Button>Login</Button>
</div>

<style>
  :global(.uno-7haszz > :not([hidden]) ~ :not([hidden])) {
    --un-space-x-reverse: 0;
    margin-left: calc(0.25rem * calc(1 - var(--un-space-x-reverse)));
    margin-right: calc(0.25rem * var(--un-space-x-reverse));
  }
</style>
```

### Nested Component styles

You can add the `class` prop to a component which which places them on to an element using `class="{$$props.class} foo bar"`.

```svelte
<Button class="px-2 py-1">Login</Button>
```

turns into:

```svelte
<Button class="uno-4hshza">Login</Button>

<style>
  :global(.uno-4hshza) {
    padding-left:0.5rem;
    padding-right:0.5rem;
    padding-top:0.25rem;
    padding-bottom:0.25rem;
  }
</style>
```

### Conditional `class:` syntax

Class names added using Svelte's class directive feature, `class:text-sm={bar}`, will also be compiled. No need to add `extractorSvelte` and custom extractors will not be used by this mode.

```svelte
<div class:text-sm={bar}>World</div>
```

turns into:

```svelte
<div class:uno-2hashz={bar}>World</div>

<style>
  :global(.uno-2hashz) {
    font-size: 0.875rem;
    line-height: 1.25rem;
  }
</style>
```

The class directive shorthand usage of `class:text-sm` where `text-sm` is both a class and a variable is also supported. The plugin will change `class:text-sm` into `class:uno-2hshza={text-sm}`.

### Usage Summary

```svelte
<span class:logo />
<!-- This would work if logo is set as a shortcut in the plugin settings and it is a variable in this component. Note that it's class name will not be changed -->

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
<span class:logo />

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

  :global(.logo) {
    /* logo styles will be put here... */
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

## Example Project
To try this out in the example project here, install and then run dev.

- Tested with @sveltejs/kit@1.0.0-next.520 (release candidate)
- Includes usage example of `@unocss/transformer-directives`'s `--at-apply: text-lg underline` ability

## Notes

- In development, individual classes will be retained and hashed in place for ease of toggling on and off in your browser's developer tools. `class="mb-1 mr-1"` will turn into something like `class="_mb-1_9hwi32 _mr-1_84jfy4`. In production, these will be compiled into a single class name using your desired prefix, `uno-` by default, and a hash based on the filename + class names, e.g. `class="uno-84dke3`.
- Vite plugins can't yet be used to preprocess files emitted by `svelte-package` as it does not use Vite. Follow https://github.com/sveltejs/vite-plugin-svelte/issues/475 to see when this will be made possible. In the meantime a [temporary svelte preprocessor wrapper](https://www.npmjs.com/package/temp-s-p-u) was published to enable using `svelte-scoped` mode in component libraries and other context that don't use Vite.
- [UnoCSS Inspector doesn't work yet](https://github.com/unocss/unocss/issues/1718). PR's welcome!
- Has not been tested with `Attributify` mode and other such innovations and probably won't work with them.

## Known Issues

- Having a commented out style tag (e.g. `<!-- <style>...</style> -->`) will prevent styles working for that component as they will be placed inside a useless tag.
- Placing `dark:` prefixed styles in a component with `<style global></style>` will not work. If anyone wants to fix, they can look at the compiled Svelte output and go from there.
