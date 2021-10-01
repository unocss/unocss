<script setup lang="ts">
import Root from './Root.vue'
import Playground from './components/Playground.vue'
</script>

<template>
  <Suspense>
    <div class="font-sans">
      <Playground />
      <Root />
    </div>
  </Suspense>
</template>
