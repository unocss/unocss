<script setup>
useHead({
  title: 'UnoCSS Interactive Docs',
  link: [
    {
      rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg',
    },
  ],
})
</script>

<template>
  <main class="pt2 text-center font-sans" w-screen h-screen of-hidden relative>
    <NuxtPage />
  </main>
</template>

<style>
@import './markdown.css';

html, body , #__nuxt {
  height: 100vh;
  margin: 0;
  padding: 0;
  scrollbar-gutter: stable;
}

html.dark {
  background: #121212;
  color: white;
  color-scheme: dark;
}

html.dark .shiki-light {
  display: none;
}

html:not(.dark) .shiki-dark {
  display: none;
}

div {
  display: flex;
  flex-direction: column;
}
div[row=""] {
  display: flex;
  flex-direction: row;
}

html.dark ::-moz-selection  {
  background: #444;
}
html.dark ::selection {
  background: #444;
}
</style>
