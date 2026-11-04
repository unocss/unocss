<script setup lang="ts">
import type { DocsItem } from '../../types'
import { useCSSPrettify } from '#docs/composables/usePrettify'

const props = defineProps<{
  item: DocsItem
}>()

const emit = defineEmits<{
  (e: 'select', token: string): void
}>()

const css = useCSSPrettify(() => props.item.css)

function getRegex101Link(matcher: string) {
  const match = matcher.match(/^\/(.*)\/([a-z]*)$/s)
  if (!match)
    return
  return `https://regex101.com/?regex=${encodeURIComponent(match[1])}&flag=${encodeURIComponent(match[2])}&testString=${encodeURIComponent(props.item.class)}`
}

function getMdnLink(property: string) {
  return `https://developer.mozilla.org/en-US/docs/Web/CSS/${encodeURIComponent(property)}`
}
</script>

<template>
  <div p-5 flex="~ col gap-5" text-sm>
    <div flex items-center gap-2>
      <DocsKindBadge :kind="item.kind" />
      <h2 font-mono text-base font-medium break-all>
        {{ item.class }}
      </h2>
      <Copy v-slot="{ copy, copied }">
        <button
          type="button"
          class="ml-auto inline-flex items-center gap-1.5 rounded px-2 py-1 text-xs hover:bg-active"
          :class="copied ? 'text-green5 dark:text-green4' : 'op-60 hover:op-100'"
          @click="copy(item.class)"
        >
          <span :class="copied ? 'i-carbon-checkmark-outline' : 'i-carbon-copy'" aria-hidden="true" />
          {{ copied ? 'Copied' : 'Copy' }}
        </button>
      </Copy>
    </div>

    <section v-if="item.shortcuts.length">
      <h3 op-50 mb-1>
        Shortcuts
      </h3>
      <div border="~ main" rounded divide-y divide-gray:20>
        <div v-for="s, idx of item.shortcuts" :key="idx" px-3 py-2 font-mono break-all>
          <span op-60>{{ s.from }}</span>
          <span op-30 mx-1>→</span>
          <span>{{ s.to }}</span>
        </div>
      </div>
    </section>

    <section v-if="item.variants.length > 1">
      <h3 op-50 mb-1>
        Variants
      </h3>
      <div border="~ main" rounded divide-y divide-gray:20>
        <div v-for="step, idx of item.variants" :key="idx" px-3 py-2 flex gap-3 items-center>
          <span v-if="idx < item.variants.length - 1" flex gap-1 items-center w-48 shrink-0>
            <span op-40 text-xs truncate>{{ step.preset ?? '(config)' }}</span>
            <span op-30>›</span>
            <span truncate>{{ step.name ?? '(anonymous)' }}</span>
          </span>
          <span v-else w-48 shrink-0 op-40 text-xs>(matched rule)</span>
          <span font-mono op-70 break-all>{{ step.result }}</span>
        </div>
      </div>
    </section>

    <section v-if="item.rules.length">
      <h3 op-50 mb-1>
        Rules
      </h3>
      <div border="~ main" rounded divide-y divide-gray:20>
        <div v-for="rule, idx of item.rules" :key="idx" px-3 py-2 flex flex-wrap gap-2 items-center>
          <span op-40 text-xs>{{ rule.preset ?? '(config)' }}</span>
          <code font-mono break-all>{{ rule.static ? `"${rule.matcher}"` : rule.matcher }}</code>
          <span v-if="rule.static" text-xs rounded px-1 bg-teal5:15 text-teal6 dark:text-teal4>static</span>
          <a
            v-if="!rule.static && getRegex101Link(rule.matcher)"
            ml-auto text-xs op-60 hover:op-100 underline
            :href="getRegex101Link(rule.matcher)"
            target="_blank"
            rel="noopener noreferrer"
          >Regex101</a>
        </div>
      </div>
    </section>

    <section v-if="item.layers.length">
      <h3 op-50 mb-1>
        Layers
      </h3>
      <div flex flex-wrap gap-1>
        <span v-for="layer of item.layers" :key="layer" font-mono text-xs rounded px-1.5 py-0.5 bg-active>{{ layer }}</span>
      </div>
    </section>

    <section>
      <h3 op-50 mb-1>
        CSS
      </h3>
      <ShikiCode border="~ main" rounded :model-value="css ?? item.css" mode="css" />
    </section>

    <section v-if="item.colors.length">
      <h3 op-50 mb-1>
        Colors
      </h3>
      <div flex flex-wrap gap-2>
        <div v-for="color of item.colors" :key="color" flex border="~ main" rounded of-hidden :title="color">
          <span h-8 w-8 flex items-center justify-center text-white :style="{ background: color }">A</span>
          <span h-8 w-8 flex items-center justify-center text-black :style="{ background: color }">A</span>
          <span h-8 w-8 flex items-center justify-center bg-white :style="{ color }">A</span>
          <span h-8 w-8 flex items-center justify-center bg-black :style="{ color }">A</span>
        </div>
      </div>
    </section>

    <section v-if="item.properties.length">
      <h3 op-50 mb-1>
        MDN
      </h3>
      <div flex flex-wrap gap-1>
        <a
          v-for="property of item.properties" :key="property"
          :href="getMdnLink(property)"
          target="_blank"
          rel="noopener noreferrer"
          inline-flex items-center gap-1 font-mono text-xs rounded px-1.5 py-0.5 bg-active hover:text-blue5
        >
          {{ property }}
          <span i-carbon-launch aria-hidden="true" />
        </a>
      </div>
    </section>

    <section v-if="item.aliases.length">
      <h3 op-50 mb-1>
        Aliases
      </h3>
      <div flex flex-wrap gap-1>
        <button
          v-for="alias of item.aliases" :key="alias"
          type="button"
          font-mono text-xs rounded px-1.5 py-0.5 bg-active hover:text-blue5
          @click="emit('select', alias)"
        >
          {{ alias }}
        </button>
      </div>
    </section>

    <section v-if="item.sameRule.length">
      <h3 op-50 mb-1>
        Same rule
      </h3>
      <div flex flex-wrap gap-1>
        <button
          v-for="token of item.sameRule" :key="token"
          type="button"
          font-mono text-xs rounded px-1.5 py-0.5 bg-active hover:text-blue5
          @click="emit('select', token)"
        >
          {{ token }}
        </button>
      </div>
    </section>
  </div>
</template>
