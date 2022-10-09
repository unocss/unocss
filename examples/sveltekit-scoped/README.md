# SvelteKit + UnoCSS Vite Plugin (svelte-scoped mode)

- Works with @sveltejs/kit@1.0.0-next.506 (release candidate) and @sveltejs/adapter-auto@1.0.0-next.80
- Uses PresetUno and PresetIcons
- Uses `svelte-scoped` mode
- Uses `extractorSvelte` to be able to use `class:red-bg-200={true}` in components

## Notes

- To use preflights add `<style uno:preflights global></style>` to your root `+layout.svelte`
- To use safelist add `<style uno:safelist global></style>` to your root `+layout.svelte`
- Or to use both, add `<style uno:preflights uno:safelist global></style>` to your root `+layout.svelte` as demoed in this example repo. If you only want them to apply to 1 component just add them to that component's `style` tag and don't add `global`.
