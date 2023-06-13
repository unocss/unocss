<script lang="ts" setup>
const { copy, copied } = useClipboard()
</script>

<template>
  <slot :copy="copy" :copied="copied" />
</template>
