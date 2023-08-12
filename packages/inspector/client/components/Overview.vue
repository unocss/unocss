<script setup lang="ts">
import { info, overview, overviewFetch } from '../composables/fetch'
import { useScrollStyle } from '../composables/useScrollStyle'
import { useCSSPrettify } from '../composables/usePrettify'
import Analyzer from './Analyzer.vue'

const status = ref(null)
const style = useScrollStyle(status, 'overview-scrolls')

overviewFetch.execute()

const isPrettify = ref(false)
const active = ref('source')
const formatted = useCSSPrettify(computed(() => overview.value?.css), isPrettify)
</script>

<template>
  <div h-full flex flex-col>
    <StatusBar ref="status" p0>
      <div p="4" grid="~ cols-4 gap-4">
        <div>
          <div op80>
            Presets
          </div>
          <div op50 ws-pre>
            {{ info?.config?.presets?.map(i => i.name).join('\n') }}
          </div>
        </div>
        <div overflow="auto">
          <div op80>
            Rules
          </div>
          {{ info?.config?.rulesDynamic?.length }} <span op50>dynamic</span><br>
          {{ Object.keys(info?.config?.rulesStaticMap || {}).length }} <span op50>static</span>
        </div>
        <div>
          <div op80>
            Variants
          </div>
          {{ info?.config?.variants?.length }}
        </div>
        <div>
          <div op80>
            Shortcuts
          </div>
          {{ info?.config.shortcuts.length }}
        </div>
        <div v-if="info?.configPath">
          <div op80>
            Config File
          </div>
          <ModuleId :id="info.configPath" />
        </div>
        <div>
          <div op80>
            Version
          </div>
          <div op50 ws-pre>
            {{ info?.version }}
          </div>
        </div>
      </div>
      <div border="t main" p="x4 y2" grid="~ cols-4 gap-4">
        <div>
          <div op80>
            Included Files
          </div>
          {{ info?.modules.length }}
        </div>
        <div>
          <div op80>
            CSS Size
          </div>
          {{ ((overview?.gzipSize || 0) / 1024).toFixed(2) }} KiB <span op50>gzipped</span>
        </div>
        <div>
          <div op80>
            Matched Rules
          </div>
          {{ overview?.matched.length }}
        </div>
        <div>
          <div op80>
            Layers
          </div>
          <div op50 ws-pre>
            {{ overview?.layers.join('\n') }}
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
      :selectors="overview.matched"
      :colors="overview.colors"
    />
  </div>
</template>
