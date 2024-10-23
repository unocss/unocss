<script setup lang="ts">
const a = 1
const b = 2
// eslint-disable-next-line style/space-infix-ops
const _c = a-(b -a -b)
</script>

<template>
  <div class="(first last)-border-0" />
  <div class="(first last):border-0" />
</template>
