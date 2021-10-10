<template>
  <div class="font-sans">
    <Cover />
    <div class="text-3xl flex gap-4 my-10 justify-center all:my-auto">
      <!-- A basic anchor icon from Phosphor icons -->
      <div i-ph-anchor-simple-thin />
      <!-- An orange alarm from Material Design Icons -->
      <div i-mdi-alarm text-orange-400 />
      <!-- A large Vue logo -->
      <div i-logos-vue text-6xl />
      <!-- Sun in light mode, Moon in dark mode, from Carbon -->
      <div i-carbon-sun dark:i-carbon-moon cursor-pointer @click="isDark = !isDark" />
      <div i-twemoji-grinning-face-with-smiling-eyes hover:i-twemoji-face-with-tears-of-joy />
    </div>
    <Playground />
  </div>
</template>

<script setup lang="ts">
const isDark = useDark()
</script>

<style>
html.dark {
  background: #080808;
  color: white;
}
</style>
