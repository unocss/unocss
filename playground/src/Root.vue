<script setup lang="ts">
import Foo from './components/Foo.vue'

const Bar = (await import('./components/Bar.vue')).default
</script>

<template>
  <Foo />
  <component :is="Bar" v-if="Bar" />
</template>
