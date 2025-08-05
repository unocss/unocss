<script setup lang="ts">
import Cube from './components/Cube.vue'
import HelloUnoCSS from './components/HelloUnoCSS.vue'
</script>

<template>
  <div text-center font-jbm p4>
    <div logo />
    <HelloUnoCSS />
    <p text-green>
      mode: vue-scoped
    </p>
    <Cube class="cube bg-teal" />
  </div>
</template>

<style scoped>
.cube {
  background: teal;
}
</style>
