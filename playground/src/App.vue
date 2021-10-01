<script setup lang="ts">
import Root from './Root.vue'
import Playground from './components/Playground.vue'
</script>

<template>
  <div>
    <Suspense>
      <div class="font-sans">
        <Playground />
        <Root />
      </div>
    </Suspense>
  </div>
</template>
