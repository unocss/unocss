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

.prose a {
  text-decoration: none !important;
  opacity: 0.8;
}
.prose a:hover {
  opacity: 1;
  text-decoration: underline !important;
  text-decoration-style: dashed !important;
  text-decoration-thickness: 1px !important;
  text-underline-offset: 2px;
  @apply text-teal;
}
.prose th {
  font-weight: bold !important;
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
