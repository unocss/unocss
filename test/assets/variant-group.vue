<script setup lang="ts">
const a = 1
const b = 2
// eslint-disable-next-line @typescript-eslint/space-infix-ops
const c = a-(b -a -b)
</script>

<template>
  <div class="bg-white font-light sm:hover:(bg-gray-100 font-medium)" />
  <div class="lt-sm:hover:(p-1 p-2)" />
  <div class="sm:(p-1 p-2)" />
  <div class="dark:lg:(p-1 p-2)" />
  <div class="hover:(bg-red text-green dark:(bg-cyan text-pink))" />
</template>
