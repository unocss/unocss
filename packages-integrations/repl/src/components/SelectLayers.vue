<script setup lang="ts">
import { computed, ref, unref } from 'vue'
import { useCssOutputContext } from '../composables/useCssOutput'
import { useStoreContext } from '../store'

const store = useStoreContext()
const cssOutput = useCssOutputContext()

const open = ref(false)

const outputLayers = computed(() => ['ALL', ...(store.output.value?.layers ?? [])])

function toggleLayer(layer: string) {
  let _layers = [...unref(cssOutput.selectedLayers.value)]
  const index = _layers.indexOf(layer)

  if (layer === 'ALL') {
    _layers = ['ALL']
  }
  else {
    _layers = _layers.filter(l => l !== 'ALL')
    if (index > -1) {
      _layers.splice(index, 1)
    }
    else {
      _layers.push(layer)
    }
  }

  cssOutput.selectedLayers.value = _layers.sort((a, b) => {
    const indexA = outputLayers.value.indexOf(a)
    const indexB = outputLayers.value.indexOf(b)
    return indexA - indexB
  })
}

function handleClickOutside(e: Event) {
  const target = e.target as HTMLElement
  if (!target.closest('.unocss-layer-select')) {
    open.value = false
  }
}
</script>

<template>
  <div h-full py-0.5 class="unocss-layer-select" relative>
    <div
      w-30 h-full of-hidden border="~ main" rd-sm flex items-center px-1 cursor-pointer
      @click="open = !open"
    >
      <div text-sm flex-1 line-clamp-1>
        <span v-if="cssOutput.selectedLayers.value.length > 0" break-all>
          {{ cssOutput.selectedLayers.value.join(',') }}
        </span>
        <span v-else title="Select layers to output">
          Select layers to output
        </span>
      </div>
      <i i-ri-arrow-down-s-line />
    </div>
    <ul
      v-show="open"
      absolute z-10 top-full left-0 mt-1
      w-30 border="~ main" rd-sm space-y-1 py-1 max-h-30 of-auto
      style="background-color: var(--cm-background)"
      @click="handleClickOutside"
    >
      <li
        v-for="layer in outputLayers" :key="layer" flex items-center px-2 cursor-pointer text-gray:80
        hover="bg-gray:20" @click="toggleLayer(layer)"
      >
        <div text-13px flex-1 line-clamp-1>
          {{ layer }}
        </div>
        <i v-if="cssOutput.selectedLayers.value.includes(layer)" text-sm i-ri-check-fill />
      </li>
    </ul>
  </div>
</template>
