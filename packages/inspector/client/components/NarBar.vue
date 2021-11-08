<script setup lang="ts">
const isDark = useDark()
const toggleDark = useToggle(isDark)
</script>

<template>
  <nav
    p="x4 y3"
    b="b main"
    flex
    children:my-auto
  >
    <div>UnoCSS Inspector</div>
    <div flex-auto />
    <button text-lg i-carbon-sun dark:i-carbon-moon @click="toggleDark()" />
  </nav>
</template>
