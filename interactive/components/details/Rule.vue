<script setup lang="ts">
import type { GuideItem, RuleItem } from '~/types'
import { highlightCSS, highlightJS } from '~/composables/shiki'
import { getPresetName } from '~/composables/uno'
import { getItemId } from '~/composables/utils'
import { guideColors } from '~/data/guides'

const { item } = defineProps<{
  item: RuleItem
}>()

const docs = $computed(() => getDocs(item))
const alias = $computed(() => findAlias(item))
const presetName = $computed(() => getPresetName(item))
const variantSteps = $computed(() => {
  const steps: {
    name?: string
    result: string
  }[] = [{
    name: '',
    result: item.class,
  }]
  const variants = item.context?.variantHandlers
  if (variants) {
    variants.forEach((v, i) => {
      steps.push({
        name: item.context?.variants?.[i]?.name,
        result: v.matcher,
      })
    })
  }
  return steps
})

const guides = $computed(() => {
  const items: GuideItem[] = []
  if (item.colors?.length)
    items.push(guideColors)
  return items
})

function getRegex101Link(regex: RegExp, text: string) {
  return `https://regex101.com/?regex=${encodeURIComponent(regex.source)}&flag=${encodeURIComponent(regex.flags)}&testString=${encodeURIComponent(text)}`
}

function getRegexperLink(regex: RegExp) {
  return `https://regexper.com/#${encodeURIComponent(regex.source)}`
}

function getCsGitHubLink(key: RegExp | string, repo = 'unocss/unocss') {
  return `https://cs.github.com/?scope=${encodeURI(`repo:${repo}`)}&q="${encodeURIComponent(String(key))}"`
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
          <template v-for="r,idx of item.context.shortcuts" :key="idx">
            <div v-if="idx" divider />
            <div row gap2 px4 py2 items-center font-mono op80>
              {{ r[0] }} -> {{ r[1] }}
            </div>
          </template>
        </div>
      </div>
      <div v-if="presetName">
        <div op30 mb1>
          Preset
        </div>
        <div border="~ base" of-auto>
          <a px4 py2 :href="`https://npmjs.com/package/${presetName}`" target="_blank" op50 hover:op100>{{ presetName }}</a>
        </div>
      </div>
      <div v-if="variantSteps.length > 1">
        <div op30 mb1>
          Variants
        </div>
        <div border="~ base" of-auto grid="~ cols-[max-content_1fr]">
          <template v-for="s,idx of variantSteps" :key="idx">
            <div v-if="idx" divider />
            <div v-if="idx" divider />
            <div px4 py2>
              <div v-if="!idx" mra mya badge-xs-gray>
                {input}
              </div>
              <div v-else mra mya badge-xs-pink :class="s.name ? '' : 'op50'">
                {{ s.name || 'anonymous' }}
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
          <template v-for="r,idx of item.context.rules" :key="idx">
            <div v-if="idx" divider />
            <div row flex-wrap gap2 px4 py2 items-center>
              <template v-if="typeof r[0] === 'string'">
                <code text-hex-AB5E3F dark:text-hex-C4704F>"{{ r[0] }}"</code>
                <div badge-xs-teal>
                  static
                </div>
                <div flex-auto />
                <a text-sm link :href="getCsGitHubLink(r[0])" target="_blank">GitHub</a>
              </template>
              <template v-else>
                <code v-html="highlightJS(String(r[0]))" />
                <div flex-auto />
                <a text-sm link :href="getRegex101Link(r[0], item.class)" target="_blank">Regex101</a>
                <a text-sm link :href="getRegexperLink(r[0])" target="_blank">Regexper</a>
                <a text-sm link :href="getCsGitHubLink(r[0])" target="_blank">GitHub</a>
              </template>
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
          <template v-for="g,idx of guides" :key="g.title">
            <div v-if="idx" divider />
            <RouterLink :to="{ query: { s: getItemId(g) } }">
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
          <template v-for="doc,idx of docs" :key="doc.url">
            <div v-if="idx" divider />
            <a :href="doc.url" target="_blank">
              <ResultItem :item="doc">
                <RouterLink
                  title="Relatives"
                  :to="{ query: { s: 'mdn:' + doc.title } }"
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
          <template v-for="a,idx of alias" :key="a.class">
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
