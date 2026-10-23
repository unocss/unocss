<script setup lang="ts">
import { ref } from 'vue'

defineOptions({
  inheritAttrs: false,
})

const count = ref(7)
</script>

<template>
  <div mx-auto>
    <!--    https://vuejs.org/api/sfc-css-features.html#child-component-root-elements -->
    <button text-red b-1 px-4 py-1 :class="$attrs.class" @click="count++">
      No.{{ count }}
    </button>
  </div>
</template>
