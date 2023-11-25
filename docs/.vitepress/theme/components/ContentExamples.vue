<script setup lang="ts">
import { examples } from '../../content'
</script>

<template>
  <div flex="~ wrap gap-2">
    <ContentExample
      v-for="item of examples"
      :key="item.name"
      :item="item"
    />
  </div>
</template>
