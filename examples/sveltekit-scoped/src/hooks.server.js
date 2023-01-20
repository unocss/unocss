/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
  const response = await resolve(event, {
    transformPageChunk: ({ html }) => html.replace('%unocss.global%', '__UnoCSS_Svelte_Scoped_global_styles__'),
  })
  return response
}
