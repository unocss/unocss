<script setup lang="ts">
const route = useRoute()
</script>

<template>
  <ModuleInfo :id="route.params.id as string" />
</template>
