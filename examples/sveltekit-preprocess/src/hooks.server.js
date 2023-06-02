// This is just here for our global usage of @unocss/svelte-scoped/vite plugin to conveniently provide a reset and preflights to the demo app - this is unnecessary for your usage of @unocss/svelte-scoped/preprocess

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
  const response = await resolve(event, {
    transformPageChunk: ({ html }) => html.replace('%unocss-svelte-scoped.global%', 'unocss_svelte_scoped_global_styles'),
  })
  return response
}
