<script setup lang="ts">
import { Menu } from 'floating-vue'
import { selectedLayers } from '../composables/prettier'

const outputLayers = computed(() => output.value?.layers || [])

function toggleLayer(layer: string) {
  // Keep the order of layers
  const index = outputLayers.value.indexOf(layer)

  if (selectedLayers.value[index]) {
    selectedLayers.value[index] = undefined
  }
  else {
    selectedLayers.value[index] = layer
  }
}
</script>

<template>
  <div h-full py-0.5>
    <Menu>
      <div w-30 h-full of-hidden border="~ main" rd-sm flex items-center px-1>
        <div text-sm flex-1 line-clamp-1>
          <span v-if="selectedLayers.filter(Boolean).length > 0" break-all>
            {{ selectedLayers.filter(Boolean).join(',') }}
          </span>
          <span v-else title="Select layers to output">
            Select layers to output
          </span>
        </div>
        <i i-ri-arrow-down-s-line />
      </div>
      <template #popper>
        <ul w-30 border="~ main" rd-sm space-y-1 py-1 max-h-30 of-auto>
          <li
            v-for="layer in outputLayers" :key="layer"
            flex items-center px-2 cursor-pointer
            text-gray:80 hover:bg-gray:20 @click="toggleLayer(layer)"
          >
            <div text-13px flex-1 line-clamp-1>
              {{ layer }}
            </div>
            <i v-if="selectedLayers.includes(layer)" text-sm i-ri-check-fill />
          </li>
        </ul>
      </template>
    </Menu>
  </div>
</template>

<style>
.v-popper__arrow-outer,
.v-popper__arrow-inner {
  display: none !important;
}
.v-popper__inner {
  background: var(--cm-background) !important;
  border: none !important;
  color: inherit !important;
  border-radius: 0 !important;
}
</style>
