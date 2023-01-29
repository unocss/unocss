<script setup lang="ts">
import { getMatchedPositions } from '@unocss/shared-common'
import { Decoration } from '@codemirror/view'
import { useEventListener, useThrottleFn } from '@vueuse/core'
import type { CompletionSource } from '@codemirror/autocomplete'
import { addMarks, filterMarks, useCodeMirror } from '../composables/codemirror'

const props = defineProps<{
  modelValue: string
  mode?: string
  readOnly?: boolean
  matched?: Set<string> | string[]
  getHint?: CompletionSource
}>()

const emit = defineEmits<{ (e: 'update:modelValue', payload: string): void }>()

const el = ref<HTMLElement>()
const input = useVModel(props, 'modelValue', emit, { passive: true })

onMounted(async () => {
  const cm = useCodeMirror(el, input, reactive({
    autocomplete: props.getHint,
    ...toRefs(props),
  }))

  useEventListener(cm.contentDOM.parentElement, 'scroll', useThrottleFn(() => {
    cm.requestMeasure()
  }, 50, true))

  function mark(start: number, end: number) {
    const strikeMark = Decoration.mark({
      class: 'highlighted',
    })
    cm.dispatch({
      effects: addMarks.of([strikeMark.range(start, end)]),
    })
  }

  function highlight() {
    cm.dispatch({
      effects: filterMarks.of((from: number, to: number) => to <= 0 || from >= cm.state.doc.toString().length),
    })
    getMatchedPositions(props.modelValue, Array.from(props.matched || []), true)
      .forEach(i => mark(i[0], i[1]))
  }

  let timer: any = 0
  watch(() => [props.modelValue, props.matched], async () => {
    clearTimeout(timer)
    if (props.matched)
      timer = setTimeout(highlight, 200)
  }, { immediate: true })
})
</script>

<template>
  <div
    ref="el"
    relative
    font-mono
    text-sm
    data-enable-grammarly="false"
    h-full
  />
</template>

<style>
#gtx-trans,
grammarly-extension,
deepl-inline-translate,
grammarly-popups,
deepl-inline-popup,
grammarly-desktop-integration {
    display: none!important;
}

.cm-editor {
  height: 100% !important;
  width: 100% !important;
  font-family: inherit;
}
.cm-content {
  cursor: text !important;
}

:root {
  --cm-font-family: 'Fira Code', monospace;
  --cm-foreground: #393a3480;
  --cm-background: #fdfdfd;
  --cm-comment: #a0ada0;
  --cm-string: #b56959;
  --cm-number: #296aa3;
  --cm-variable: #59873a;
  --cm-keyword: #1c6b48;
  --cm-property: #b58451;
  --cm-definition-keyword: #ab5959;
  --cm-punctuation: #8e8f8b;
  --cm-decorator: #b07d48;
  --cm-line-highlight-background: #d4e6f6;
  --cm-line-highlight-border: #cde3f1;
  --cm-selection-background: #eeeeee;
  /* scrollbars colors */
  --cm-ttc-c-thumb: #eee;
  --cm-ttc-c-track: white;
}

html.dark {
  --cm-scheme: dark;
  --cm-foreground: #d4cfbf80;
  --cm-background: #121212;
  --cm-comment: #758575;
  --cm-string: #d48372;
  --cm-keyword: #4d9375;
  --cm-number: #6394bf;
  --cm-variable: #c2b36e;
  --cm-property: #dd8e6e;
  --cm-definition-keyword: #cb7676;
  --cm-punctuation: #858585;
  --cm-decorator: #bd976a;
  --cm-line-number: #dedcd530;
  --cm-line-number-gutter: #eeeeee;
  --cm-line-highlight-background: #122434;
  --cm-line-highlight-border: #233947;
  --cm-selection-background: #242424;
  /* scrollbars colors */
  --cm-ttc-c-thumb: #222;
  --cm-ttc-c-track: #111;
}

.highlighted, .highlighted > span {
  border-bottom: 1px dashed currentColor;
}
.cm-scroller::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
.cm-scroller::-webkit-scrollbar-track {
  background: var(--cm-ttc-c-track);
}
.cm-scroller::-webkit-scrollbar-thumb {
  background-color: var(--cm-ttc-c-thumb);
  border-radius: 3px;
  border: 2px solid var(--cm-ttc-c-thumb);
}
.cm-scroller::-webkit-scrollbar-corner {
  background-color: var(--cm-ttc-c-track);
}
</style>
