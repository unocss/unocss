<script setup lang="ts">
import { info, overview, overviewFetch } from '../composables/fetch'
import { useScrollStyle } from '../composables/useScrollStyle'
import { useCSSPrettify } from '../composables/cssPrettify'

const status = ref(null)
const style = useScrollStyle(status, 'overview-scrolls')

overviewFetch.execute()

const isPrettify = ref(false)
const formatted = useCSSPrettify(overview, isPrettify)
</script>

<template>
  <div h-full>
    <StatusBar ref="status" p0>
      <div p="x4 y2" grid="~ cols-4 gap-4">
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
          {{ info?.config?.rulesDynamic?.filter(Boolean).length }} <span op50>dynamic</span><br>
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
      <div b="t main" p="x4 y2" grid="~ cols-4 gap-4">
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
      <TitleBar border="t gray-400/20" title="Output CSS">
        <label>
          <input v-model="isPrettify" type="checkbox">
          Prettify
        </label>
      </TitleBar>
    </StatusBar>
    <CodeMirror
      :model-value="formatted"
      :read-only="true"
      mode="css"
      class="scrolls overview-scrolls"
      :style="style"
    />
  </div>
</template>
