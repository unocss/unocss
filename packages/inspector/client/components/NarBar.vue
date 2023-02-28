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
    <div flex flex-auto children:my-auto ws-nowrap>
      <img
        src="/favicon.svg"
        filter
        dark:invert
        inline-block
        h="1.3em"
        m="r-1.5"
      >
      <div of-hidden>
        Inspector
        <sup text-teal5 bg-teal5:10 p="x1.5 y0.5" rounded italic>beta</sup>
      </div>
    </div>
    <button text-lg i-carbon-sun dark:i-carbon-moon @click="toggleDark()" />
  </nav>
</template>
