<script setup>
import '@unocss/reset/tailwind.css'
import './markdown.css'
import 'uno.css'

const ogUrl = 'https://unocss.dev/'
const ogImage = `${ogUrl}og.png#1`
const title = 'UnoCSS Interactive Docs'
const description = 'The instant on-demand Atomic CSS engine'

useHead({
  title,
  htmlAttrs: [
    { lang: 'en-US' },
  ],
  meta: [
    { property: 'og:type', content: 'website' },
    { name: 'og:title', content: title },
    { name: 'og:description', content: description },
    { property: 'og:image', content: ogImage },
    { name: 'twitter:title', content: title },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:image', content: ogImage },
    { name: 'twitter:site', content: '@antfu7' },
    { name: 'twitter:url', content: ogUrl },
  ],
  link: [
    { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
    { rel: 'search', type: 'application/opensearchdescription+xml', href: '/search.xml', title: 'UnoCSS' },
  ],
})
</script>

<template>
  <main class="pt2 text-center font-sans" w-full h-screen of-hidden relative>
    <NuxtPage />
  </main>
</template>

<style>
html {
  scrollbar-gutter: stable;
}
html, body , #__nuxt {
  height: 100vh;
}
html.dark {
  color-scheme: dark;
  background: #121212;
  color: white;
}
html.dark .shiki,
html.dark .shiki span {
  color: var(--shiki-dark);
}
html:not(.dark) .shiki,
html:not(.dark) .shiki span {
  color: var(--shiki-light);
}
html.dark ::-moz-selection  {
  background: #444;
}
html.dark ::selection {
  background: #444;
}
/* Flexbox default changes */
div {
  display: flex;
  flex-direction: column;
}
div[row=""] {
  display: flex;
  flex-direction: row;
}
div[block=""] {
  display: block;
}

::view-transition-old(root),
::view-transition-new(root) {
  animation: none;
  mix-blend-mode: normal;
}
::view-transition-old(root) {
  z-index: 1;
}
::view-transition-new(root) {
  z-index: 2147483646;
}
.dark::view-transition-old(root) {
  z-index: 2147483646;
}
.dark::view-transition-new(root) {
  z-index: 1;
}
</style>
