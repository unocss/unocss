<script lang='ts' setup>
import { useClipboard } from '@vueuse/core'
import { computed, ref } from 'vue'
import { useElement } from '../../composables/exports/element'
import { round } from '../../utils'
import Cell from '../sections/Cell.vue'
import ColorDot from '../sections/ColorDot.vue'

const { element, tracking } = useElement()
const showRem = ref(false)
const showFontRem = ref(false)

const basicInfo = computed(() => {
  tracking()

  if (!element.value) {
    return null
  }

  const el = element.value
  const rect = el.getBoundingClientRect()

  return {
    tagName: el.tagName.toLowerCase(),
    id: el.id,
    rect: {
      x: Math.round(rect.x),
      y: Math.round(rect.y),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
    },
    color: {
      text: getComputedStyle(el).color,
      background: getComputedStyle(el).backgroundColor,
    },
    font: {
      size: getComputedStyle(el).fontSize,
      family: getComputedStyle(el).fontFamily,
    },
  }
})

function pxToRem(px: number) {
  return round(px / 16)
}

function toggleUnit() {
  showRem.value = !showRem.value
}

function toggleFontUnit() {
  showFontRem.value = !showFontRem.value
}

const { copy } = useClipboard()
function copyToClipboard(text: string) {
  copy(text)
  // eslint-disable-next-line no-console
  console.log('Copied to clipboard:', text)
}
</script>

<template>
  <div v-if="basicInfo" p-3>
    <div class="flex flex-col gap-2">
      <!-- Tag Name -->
      <Cell label="Tag" icon="i-hugeicons:discount-tag-01">
        <div p="x1.5 y0.5" class="bg-purple/30 text-purple rd w-fit">
          {{ basicInfo.tagName }}
        </div>
      </Cell>
      <!-- ID -->
      <Cell v-if="basicInfo.id" label="ID" icon="i-hugeicons:pin-code">
        <div>
          <span class="mr-0.25 text-white/64 text-10px">#</span>
          {{ basicInfo.id }}
        </div>
      </Cell>
      <!-- Position -->
      <Cell label="Position" icon="i-hugeicons:location-09">
        <div>
          <span op-50>X:</span> {{ basicInfo.rect.x }} <span class="mx-1 text-white/10">|</span> <span op-50>Y:</span> {{ basicInfo.rect.y }}
        </div>
      </Cell>
      <!-- Size -->
      <Cell label="Size" icon="i-hugeicons:image-actual-size">
        <div
          class="cursor-pointer hover:bg-white/10 px-1 py-0.5 rounded transition-colors select-none"
          :title="`Click to switch to ${showRem ? 'px' : 'rem'}`"
          @click="toggleUnit"
        >
          <template v-if="showRem">
            <span op-50>W:</span> {{ pxToRem(basicInfo.rect.width) }}<span class="mx-1 op-50">rem</span> <span class="mx-1 text-white/10">|</span> <span op-50>H:</span> {{ pxToRem(basicInfo.rect.height) }}<span class="mx-1 op-50">rem</span>
          </template>
          <template v-else>
            <span op-50>W:</span> {{ basicInfo.rect.width }}<span class="mx-1 op-50">px</span> <span class="mx-1 text-white/10">|</span> <span op-50>H:</span> {{ basicInfo.rect.height }}<span class="mx-1 op-50">px</span>
          </template>
        </div>
      </Cell>
      <!-- Color -->
      <Cell label="Color" icon="i-hugeicons:color-picker">
        <div flex="~ items-center">
          <div title="Click to copy text color" flex="~ items-center gap-1" class="hover:bg-white/10 cursor-pointer group px-1 py-0.5 rounded" @click="copyToClipboard(basicInfo.color.text)">
            <span>Text:</span>
            <ColorDot :color="basicInfo.color.text" />
          </div>

          <span class="mx-1 text-white/10">|</span>

          <div title="Click to copy background color" flex="~ items-center gap-1" class="hover:bg-white/10 cursor-pointer group px-1 py-0.5 rounded" @click="copyToClipboard(basicInfo.color.background)">
            <span>Background:</span>
            <ColorDot :color="basicInfo.color.background" />
          </div>
        </div>
      </Cell>
      <!-- Font -->
      <Cell label="Font" icon="i-hugeicons:text">
        <div flex="~ items-center">
          <div
            flex="~ items-center gap-1"
            class="hover:bg-white/10 cursor-pointer px-1 py-0.5 rounded transition-colors select-none"
            :title="`Click to switch to ${showFontRem ? 'px' : 'rem'}`"
            @click="toggleFontUnit"
          >
            <template v-if="showFontRem">
              <span>{{ pxToRem(parseFloat(basicInfo.font.size)) }}<span class="mx-1 text-white/50">rem</span></span>
            </template>
            <template v-else>
              <span>{{ basicInfo.font.size }}</span>
            </template>
          </div>

          <span class="mx-1 text-white/10">|</span>            <div flex-1 line-clamp-1 break-all :title="basicInfo.font.family">
            <span>{{ basicInfo.font.family }}</span>
          </div>
        </div>
      </Cell>
    </div>
  </div>
</template>
