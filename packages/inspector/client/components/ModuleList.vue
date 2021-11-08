<script setup lang="ts">
import { info } from '../composables/fetch'
</script>

<template>
  <ul v-if="info" overflow="auto">
    <li v-for="id of info.modules" :key="id">
      <RouterLink
        block
        font-mono
        b="b main"
        p="x3 y2"
        text-sm
        :to="`/module/${encodeURIComponent(id)}`"
      >
        <ModuleId :id="id" />
      </Routerlink>
    </li>
  </ul>
</template>
