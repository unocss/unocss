<script lang='ts' setup>
import FlexLayout from './FlexLayout.vue'

defineProps<{
  wrap: boolean
}>()
</script>

<template>
  <FlexLayout direction="row" :wrap="wrap" />
</template>
