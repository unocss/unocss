<script setup lang="ts">
import { overview, overviewFetch, info } from '../composables/fetch'

overviewFetch.execute()
</script>

<template>
  <div h-full grid="~ rows-[max-content,1fr]">
    <StatusBar p0>
      <div p4 grid="~ cols-4 gap-4">
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
      </div>
      <div b="t main" p4 grid="~ cols-4 gap-4">
        <div>
          <div op80>
            Scanned Files
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
    </StatusBar>
    <CodeMirror
      h-full
      :model-value="overview?.css || '/* empty */'"
      :read-only="true"
      mode="css"
    />
  </div>
</template>
