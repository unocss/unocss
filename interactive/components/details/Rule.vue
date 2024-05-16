<script setup lang="ts">
import type { Variant } from '@unocss/core'
import type { GuideItem, RuleItem } from '~/types'
import { highlightCSS, highlightJS } from '~/composables/shiki'
import { searcher } from '~/composables/state'
import { guideColors } from '~/data/guides'

const { item } = defineProps<{
  item: RuleItem
}>()

const docs = computed(() => getDocs(item))
const alias = computed(() => searcher.getAliasOf(item))
const variantSteps = computed(() => {
  const steps: {
    variant?: Variant
    name?: string
    result: string
  }[] = []
  const first = item.context?.variants?.[0]
  steps.push({
    variant: first,
    name: first?.name,
    result: item.class,
  })
  const handlers = item.context?.variantHandlers
  if (handlers) {
    handlers.forEach((h, i) => {
      const v = item.context?.variants?.[i + 1]
      steps.push({
        variant: v,
        name: v?.name,
        result: h.matcher,
      })
    })
  }
  return steps
})
const imageUrls = computed(() => {
  // @ts-expect-error cast
  return item.urls?.filter(i => i.startsWith('data:image') || i.match(/\.(png|jpg|jpeg|svg)$/gi))
})

const guides = computed(() => {
  const items: GuideItem[] = []
  if (item.colors?.length)
    items.push(guideColors)
  return items
})

const sameRules = computed(() => searcher.getSameRules(item))

function getRegex101Link(regex: RegExp, text: string) {
  return `https://regex101.com/?regex=${encodeURIComponent(regex.source)}&flag=${encodeURIComponent(regex.flags)}&testString=${encodeURIComponent(text)}`
}

function getRegexperLink(regex: RegExp) {
  return `https://regexper.com/#${encodeURIComponent(regex.source)}`
}

function getGitHubCodeSearchLink(key: RegExp | string, repo = 'unocss/unocss') {
  // https://docs.github.com/en/search-github/searching-on-github/searching-code#search-within-a-users-or-organizations-repositories
  const separator = ' '
  return `https://github.com/search?type=code&q=${encodeURI(`repo:${repo}`)}${separator}"${encodeURIComponent(String(key))}"`
}
</script>

<template>
  <DetailsBase :title="item.class">
    <div gap4 text-left>
      <div v-if="item.context?.shortcuts?.length">
        <div op30 mb1>
          Shortcuts
        </div>
        <div border="~ base">
          <template v-for="r, idx of item.context.shortcuts" :key="idx">
            <div v-if="idx" divider />
            <div row gap2 px4 py2 items-center font-mono op80>
              {{ r[0] }} -> {{ r[1] }}
            </div>
          </template>
        </div>
      </div>
      <div v-if="variantSteps.length > 1">
        <div op30 mb1>
          Variants
        </div>
        <div border="~ base" of-auto grid="~ cols-[max-content_1fr]">
          <template v-for="s, idx of variantSteps" :key="idx">
            <div v-if="idx" divider />
            <div v-if="idx" divider />
            <div px4 py2>
              <div
                v-if="idx < variantSteps.length - 1"
                :class="s.name ? '' : 'op50'" row text-sm gap1
                mra mya
              >
                <PresetLabel
                  op50 hover:op100
                  :preset="searcher.getPresetOfVariant(s.variant)"
                  fallback="(inline)"
                />
                <span op30>></span>
                {{ s.name || '(anonymous)' }}
              </div>
            </div>
            <div px4 py2 font-mono op60>
              {{ s.result }}
            </div>
          </template>
        </div>
      </div>
      <div v-if="item.context?.rules?.length">
        <div op30 mb1>
          Rules
        </div>
        <div border="~ base" of-auto>
          <template v-for="r, idx of item.context.rules" :key="idx">
            <div v-if="idx" divider />
            <div row flex-wrap gap2 px4 py2 items-center>
              <div gap1>
                <PresetLabel text-sm op30 hover:op100 :preset="searcher.getPresetOfRule(r)" />
                <div v-if="typeof r[0] === 'string'" row gap2 items-center>
                  <code text-hex-AB5E3F dark:text-hex-C4704F>"{{ r[0] }}"</code>
                  <div badge-xs-teal mya>
                    static
                  </div>
                </div>
                <code v-else v-html="highlightJS(String(r[0]))" />
              </div>
              <div flex-auto />
              <template v-if="typeof r[0] !== 'string'">
                <a text-sm link :href="getRegex101Link(r[0], item.class)" target="_blank">Regex101</a>
                <a text-sm link :href="getRegexperLink(r[0])" target="_blank">Regexper</a>
              </template>
              <a text-sm link :href="getGitHubCodeSearchLink(r[0])" target="_blank">GitHub</a>
            </div>
          </template>
        </div>
      </div>
      <div v-if="item.layers?.length">
        <div op30 mb1>
          Layers
        </div>
        <div row border="~ base" relative of-hidden font-mono>
          <div v-for="l of item.layers" :key="l" op50 px4 py2>
            {{ l }}
          </div>
        </div>
      </div>
      <div v-if="item.css">
        <div op30 mb1>
          CSS
        </div>
        <div border="~ base" p4 relative of-hidden>
          <pre of-auto w-full v-html="highlightCSS(item.css)" />
        </div>
      </div>
      <div v-if="imageUrls?.length">
        <div op30 mb1>
          Images
        </div>
        <div>
          <div
            v-for="c of imageUrls" :key="c" row
            flex="wrap" gap-2
            text-lg items-center
          >
            <img border="~ base" max-w-40 max-h-40 min-w-15 :src="c" p2>
          </div>
        </div>
      </div>
      <div v-if="item.colors?.length">
        <div op30 mb1>
          Colors
        </div>
        <div>
          <div
            v-for="c of item.colors" :key="c" row
            w-20 h-10 border="~ base" flex="~ gap-2"
            text-lg items-center justify-center
            :style="{ background: c }"
          >
            <span text-white>A</span>
            <span text-black>A</span>
          </div>
        </div>
      </div>
      <div v-if="guides.length">
        <div op30 mb1>
          Guides
        </div>
        <div border="~ base">
          <template v-for="g, idx of guides" :key="g.title">
            <div v-if="idx" divider />
            <RouterLink :to="{ query: { s: searcher.getItemId(g) } }">
              <ResultItem :item="g" />
            </RouterLink>
          </template>
        </div>
      </div>
      <div v-if="docs.length">
        <div op30 mb1>
          MDN Docs
        </div>
        <div border="~ base">
          <template v-for="doc, idx of docs" :key="doc.url">
            <div v-if="idx" divider />
            <a :href="doc.url" target="_blank">
              <ResultItem :item="doc">
                <RouterLink
                  title="Relatives"
                  :to="{ query: { s: `mdn:${doc.title}` } }"
                  i-carbon-list w-5 h-5 px4 op50 hover:op100
                />
              </ResultItem>
            </a>
          </template>
        </div>
      </div>
      <div v-if="alias.length">
        <div op30 mb1>
          Alias
        </div>
        <div border="~ base">
          <template v-for="a, idx of alias" :key="a.class">
            <div v-if="idx" divider />
            <RouterLink :to="{ query: { s: a.class } }">
              <ResultItem :item="a" :compact="true" />
            </RouterLink>
          </template>
        </div>
      </div>
      <div v-if="sameRules.length">
        <div op30 mb1>
          Same Rule
        </div>
        <div border="~ base">
          <template v-for="a, idx of sameRules" :key="a.class">
            <div v-if="idx" divider />
            <RouterLink :to="{ query: { s: a.class } }">
              <ResultItem :item="a" :compact="true" />
            </RouterLink>
          </template>
        </div>
      </div>
    </div>
  </DetailsBase>
</template>
