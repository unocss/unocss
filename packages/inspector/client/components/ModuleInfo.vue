<script setup lang="ts">
import { fetchModule } from '../composables/fetch'

const props = defineProps<{ id: string }>()
const { data: mod } = fetchModule(toRef(props, 'id'))
const mode = props.id.split(/\./g).pop()

function openEditor() {
  fetch(`/__open-in-editor?file=${encodeURIComponent(props.id)}`)
}
</script>

<template>
  <div v-if="mod" h-full grid="~ rows-[max-content,1fr]" of-hidden>
    <StatusBar grid="~ cols-2">
      <div>
        <div op50>
          Module
        </div>
        <a cursor-pointer op80 hover:op100 @click="openEditor">
          <ModuleId :id="mod.id" mr-1 />
          <div i-carbon-launch></div>
        </a>
      </div>
      <div>
        <div op50>
          Matched
        </div>
        {{ mod.matched.length }}
      </div>
    </StatusBar>
    <div h-full of-hidden grid grid-cols-2>
      <CodeMirror
        h-full
        :model-value="mod.code"
        :read-only="true"
        :mode="mode"
        :matched="mod.matched"
      />
      <CodeMirror
        h-full
        b="l main"
        :model-value="mod.css"
        :read-only="true"
        mode="css"
      />
    </div>
  </div>
</template>
