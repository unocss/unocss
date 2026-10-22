<script setup lang="ts">
import Button from './components/Button.vue'
import HelloUnoCSS from './components/HelloUnoCSS.vue'
</script>

<template>
  <div text-center font-jbm p4>
    <div logo />
    <HelloUnoCSS />
    <p text-green>
      mode: vue-scoped
    </p>
    <Button class="cube bg-teal" />
  </div>
</template>

<style scoped>
.cube {
  background: teal;
}
</style>
