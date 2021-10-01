<script setup lang="ts">
import { createGenerator } from '../../../src/generator'
import { defaultConfig } from '../../../src/default'

const generator = createGenerator(defaultConfig)

const input = ref('sm:dark:!text-red')
const output = computed(() => generator(input.value))
</script>

<template>
  <div class="font-mono flex flex-col gap-2 px-4 py-3">
    <div>Input</div>
    <textarea v-model="input" class="h-40 rounded p-2" />
    <div>Output</div>
    <textarea readonly :value="output" placeholder="No result" class="h-40 rounded p-2" />
  </div>
</template>
