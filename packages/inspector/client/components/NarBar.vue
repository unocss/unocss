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
    <div>Inspector <sup text-teal bg-teal:10 p="x1.5 t0.5 b1" rounded>preview</sup></div>
    <div flex-auto />
    <button text-lg i-carbon-sun dark:i-carbon-moon @click="toggleDark()" />
  </nav>
</template>
