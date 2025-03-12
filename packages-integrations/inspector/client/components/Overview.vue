<script setup lang="ts">
import { info, overview, overviewFetch } from '../composables/fetch'
import { useCSSPrettify } from '../composables/usePrettify'
import { useScrollStyle } from '../composables/useScrollStyle'
import Analyzer from './Analyzer.vue'

const status = ref(null)
const style = useScrollStyle(status, 'overview-scrolls')

overviewFetch.execute()

const isPrettify = ref(false)
const active = ref('source')
const layer = ref()

function displayLayerCSS(name: string) {
  layer.value = layer.value === name ? undefined : name
}

const formatted = useCSSPrettify(computed(() => {
  if (!layer.value)
    return overview.value?.css
  return overview.value?.layers.find(i => i.name === layer.value)?.css
}), isPrettify)
</script>

<template>
  <div h-full flex flex-col>
    <StatusBar ref="status" p0>
      <div p="4" grid="~ cols-4 gap-4">
        <div>
          <div text-amber op80>
            Presets
          </div>
          <div h25 op50 ws-pre overflow="auto">
            {{ info?.config?.presets?.map(i => i.name).join('\n') }}
          </div>
        </div>
        <div overflow="auto">
          <div text-blue op80>
            Rules
          </div>
          {{ info?.config?.rulesDynamic?.length }} <span op50>dynamic</span><br>
          {{ Object.keys(info?.config?.rulesStaticMap || {}).length }} <span op50>static</span>
        </div>
        <div>
          <div text-fuchsia op80>
            Variants
          </div>
          {{ info?.config?.variants?.length }}
        </div>
        <div>
          <div text-emerald op80>
            Shortcuts
          </div>
          {{ info?.config.shortcuts.length }}
        </div>
        <div v-if="info?.configPath">
          <div text-lime op80>
            Config File
          </div>
          <ModuleId :id="info.configPath" />
        </div>
        <div>
          <div text-orange op80>
            Version
          </div>
          <div op50 ws-pre>
            {{ info?.version }}
          </div>
        </div>
      </div>
      <div border="t main" p="x4 y2" grid="~ cols-4 gap-4">
        <div>
          <div text-pink op80>
            Included Files
          </div>
          {{ info?.modules.length }}
        </div>
        <div>
          <div text-teal op80>
            CSS Size
          </div>
          {{ ((overview?.gzipSize || 0) / 1024).toFixed(2) }} KiB <span op50>gzipped</span>
        </div>
        <div>
          <div text-yellow op80>
            Matched Rules
          </div>
          {{ overview?.matched.length }}
        </div>
        <div>
          <div text-rose op80>
            Layers
          </div>
          <div op50 ws-pre flex flex-col>
            <span v-for="_layer in overview?.layers" :key="_layer.name" :class="layer === _layer.name ? 'text-rose:70' : ''" hover:text-rose:50 cursor-pointer @click="displayLayerCSS(_layer.name)">
              {{ _layer.name }}
            </span>
          </div>
        </div>
      </div>
      <OverviewTabs v-model="active" />
      <TitleBar v-if="active === 'source'" border="t gray-400/20" title="Output CSS">
        <label>
          <input v-model="isPrettify" type="checkbox">
          Prettify
        </label>
      </TitleBar>
    </StatusBar>
    <CodeMirror
      v-if="active === 'source'" :model-value="formatted" :read-only="true" mode="css" class="overview-scrolls"
      :style="style"
    />
    <Analyzer
      v-else flex-grow overflow-y-auto
      :selectors="overview!.matched"
      :colors="overview!.colors"
      :icons="overview!.icons"
    />
  </div>
</template>
