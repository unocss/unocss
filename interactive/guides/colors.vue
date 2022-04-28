<script setup lang="ts">
import { uno } from '~/composables/state'
const colors = (uno.config.theme as any).colors || {}
</script>

<template>
  <div justify-center ma>
    <ColorsItem :item="colors" />
  </div>
</template>
