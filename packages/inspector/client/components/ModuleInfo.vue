<script setup lang="ts">
import { Splitpanes, Pane } from 'splitpanes'
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
    <StatusBar grid="~ cols-3">
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
          Matched Rules
        </div>
        {{ mod.matched.length }}
      </div>
      <div>
        <div op50>
          CSS Size
        </div>
        {{ ((mod?.gzipSize || 0) / 1024).toFixed(2) }} KiB
        <span op50>gzipped</span>
      </div>
    </StatusBar>
    <Splitpanes flex h-full w-full>
      <Pane of-hidden border-gray-2 border-r-1>
        <CodeMirror
          min-size="5"
          h-full
          :model-value="mod.code"
          :read-only="true"
          :mode="mode"
          :matched="mod.matched"
        />
      </Pane>
      <Pane>
        <CodeMirror
          h-full
          :model-value="mod.code"
          :read-only="true"
          :mode="mode"
          :matched="mod.matched"
        />
      </Pane>
    </Splitpanes>
    <!-- <Splitpanes min-size="5" h-full flex :push-other-panes="false">
      <Pane>
        <CodeMirror
          h-full
          :model-value="mod.code"
          :read-only="true"
          :mode="mode"
          :matched="mod.matched"
        />
      </Pane>

      <CodeMirror
        h-full
        b="l main"
        :model-value="mod.css"
        :read-only="true"
        mode="css"
      />
    </Splitpanes> -->
    <!-- <div h-full of-hidden grid grid-cols-2> -->
    <!-- </div> -->
  </div>
</template>
