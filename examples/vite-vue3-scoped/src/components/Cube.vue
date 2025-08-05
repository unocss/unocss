<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})
</script>

<template>
  <div flex justify-center>
    <!--    https://vuejs.org/api/sfc-css-features.html#child-component-root-elements -->
    <div aspect-square w-100px b-1 flex flex-col justify-center items-center shadow-lg :class="$attrs.class">
      cube
    </div>
  </div>
</template>
