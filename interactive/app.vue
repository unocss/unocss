<script setup>
import '@unocss/reset/antfu.css'
import './markdown.css'
import 'uno.css'

useHead({
  title: 'UnoCSS Interactive Docs',
  htmlAttrs: [
    { lang: 'en-US' },
  ],
  meta: [{
    name: 'description',
    content: 'UnoCSS Interactive Docs',
  }],
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
html, body , #__nuxt {
  height: 100vh;
}
html.dark {
  background: #121212;
  color: white;
}
html.dark .shiki-light {
  display: none;
}
html:not(.dark) .shiki-dark {
  display: none;
}
</style>
