<script setup lang="ts">
import attributifyPreset from '@unocss/preset-attributify'
import { Pane, Splitpanes } from 'splitpanes'
import { fetchModule } from '../composables/fetch'
import { useScrollStyle } from '../composables/useScrollStyle'
import { useCSSPrettify } from '../composables/usePrettify'

const props = defineProps<{ id: string }>()
const { data: mod } = fetchModule(toRef(props, 'id'))
const mode = props.id.split(/\./g).pop()
const status = ref(null)
const style = useScrollStyle(status, 'module-scrolls')

function openEditor() {
  fetch(`/__open-in-editor?file=${encodeURIComponent(props.id)}`)
}

const { extractors } = attributifyPreset({ strict: true })
const unmatchedClasses = asyncComputed(async () => {
  const set = new Set<string>()
  if (extractors) {
    const context = { code: mod.value?.code || '' } as any
    for (const extractor of extractors) {
      const result = await extractor.extract(context)
      result?.forEach(t => set.add(t))
    }
  }
  return Array.from(set)
    .filter(i => !i.startsWith('['))
    .filter(i => !mod.value?.matched?.some(({ rawSelector }) => rawSelector === i))
})

const isPrettify = ref(false)
const active = ref('source')
const formatted = useCSSPrettify(computed(() => mod.value?.css), isPrettify)
</script>

<template>
  <div v-if="mod" h-full of-hidden flex flex-col>
    <StatusBar ref="status" p0>
      <div p="4" grid="~ cols-4 gap-4">
        <div>
          <div op50>
            Module
          </div>
          <a cursor-pointer op80 hover:op100 @click="openEditor">
            <ModuleId :id="mod.id" mr-1 />
            <div i-carbon-launch />
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
          {{ ((mod?.gzipSize || 0) / 1024).toFixed(2) }} KiB <span op50>gzipped</span>
        </div>
        <div v-if="unmatchedClasses.length" row-span-3>
          <div op50>
            Potentially Unmatched
          </div>
          <code>
            {{ unmatchedClasses.join(', ') }}
          </code>
        </div>
      </div>
      <OverviewTabs v-model="active" />
    </StatusBar>
    <div v-if="active === 'source'" h-full of-hidden>
      <Splitpanes>
        <Pane size="50">
          <CodeMirror
            h-full :model-value="mod.code" :read-only="true" :mode="mode" :matched="mod.matched?.map(({ rawSelector }) => rawSelector)"
            class="scrolls module-scrolls" :style="style"
          />
        </Pane>
        <Pane size="50">
          <div>
            <TitleBar border="l b gray-400/20" title="Output CSS">
              <label>
                <input v-model="isPrettify" type="checkbox">
                Prettify
              </label>
            </TitleBar>
            <CodeMirror
              h-full border="l main" :model-value="formatted" :read-only="true" mode="css"
              class="scrolls module-scrolls" :style="style"
            />
          </div>
        </Pane>
      </Splitpanes>
    </div>
    <Analyzer v-else flex-grow overflow-y-auto :selectors="mod.matched" :colors="mod.colors" />
  </div>
</template>
