<script setup lang="ts">
import type { AsyncHintFunction, HintFunction, HintFunctionResolver } from 'codemirror'
import { getMatchedPositions } from '../composables/pos'
import { useCodeMirror } from '../composables/codemirror'

const emit = defineEmits<{ (input: any): void }>()
const props = defineProps<{
  modelValue: string
  mode?: string
  readOnly?: boolean
  matched?: Set<string> | string[]
  getHint?: HintFunction | AsyncHintFunction | HintFunctionResolver
}>()

const modeMap: Record<string, any> = {
  html: 'htmlmixed',
  vue: 'htmlmixed',
  svelte: 'htmlmixed',
  js: 'javascript',
  mjs: 'javascript',
  cjs: 'javascript',
  ts: { name: 'javascript', typescript: true },
  mts: { name: 'javascript', typescript: true },
  cts: { name: 'javascript', typescript: true },
  jsx: { name: 'javascript', jsx: true },
  tsx: { name: 'javascript', typescript: true, jsx: true },
}

const el = ref<HTMLTextAreaElement>()
const input = useVModel(props, 'modelValue', emit, { passive: true })

onMounted(async() => {
  const cm = useCodeMirror(el, input, {
    ...props,
    mode: modeMap[props.mode || ''] || props.mode,
    ...props.getHint
      ? {
        extraKeys: {
          'Ctrl-Space': 'autocomplete',
          'Ctrl-.': 'autocomplete',
          'Cmd-Space': 'autocomplete',
          'Cmd-.': 'autocomplete',
          'Tab': 'autocomplete',
        },
        hintOptions: {
          hint: props.getHint,
        },
      }
      : {},
  })
  cm.setSize('100%', '100%')
  setTimeout(() => cm.refresh(), 100)
  const decorations: CodeMirror.TextMarker<CodeMirror.MarkerRange>[] = []

  function mark(start: number, end: number) {
    decorations.push(cm.markText(
      cm.posFromIndex(start),
      cm.posFromIndex(end),
      { className: 'highlighted' },
    ))
  }

  function highlight() {
    // clear previous
    decorations.forEach(i => i.clear())
    getMatchedPositions(props.modelValue, Array.from(props.matched || []))
      .forEach(i => mark(i[0], i[1]))
  }

  let timer: any = 0
  watch(() => [props.modelValue, props.matched], async() => {
    clearTimeout(timer)
    if (props.matched)
      timer = setTimeout(highlight, 100)
  }, { immediate: true })
})
</script>

<template>
  <div
    relative
    font-mono
    text-sm
  >
    <textarea ref="el" />
  </div>
</template>

<style>
.CodeMirror {
  height: 100% !important;
  width: 100% !important;
  font-family: inherit;
}

.cm-s-vars .cm-tag {
  color: var(--cm-keyword);
}

:root {
  --cm-foreground: #393a3480;
  --cm-background: #fdfdfd;
  --cm-comment: #a0ada0;
  --cm-string: #b56959;
  --cm-literal: #2f8a89;
  --cm-number: #296aa3;
  --cm-keyword: #1c6b48;
  --cm-function: #6c7834;
  --cm-boolean: #1c6b48;
  --cm-constant: #a65e2b;
  --cm-deleted: #a14f55;
  --cm-class: #2993a3;
  --cm-builtin: #ab5959;
  --cm-property: #b58451;
  --cm-namespace: #b05a78;
  --cm-punctuation: #8e8f8b;
  --cm-decorator: #bd8f8f;
  --cm-regex: #ab5e3f;
  --cm-json-property: #698c96;
  /* scrollbars colors */
  --cm-ttc-c-thumb: #eee;
  --cm-ttc-c-track: white;
}

html.dark {
  --cm-scheme: dark;
  --cm-foreground: #d4cfbf80;
  --cm-background: #111;
  --cm-comment: #758575;
  --cm-string: #d48372;
  --cm-literal: #429988;
  --cm-keyword: #4d9375;
  --cm-boolean: #1c6b48;
  --cm-number: #6394bf;
  --cm-variable: #c2b36e;
  --cm-function: #a1b567;
  --cm-deleted: #a14f55;
  --cm-class: #54b1bf;
  --cm-builtin: #e0a569;
  --cm-property: #dd8e6e;
  --cm-namespace: #db889a;
  --cm-punctuation: #858585;
  --cm-decorator: #bd8f8f;
  --cm-regex: #ab5e3f;
  --cm-json-property: #6b8b9e;
  --cm-line-number: #888888;
  --cm-line-number-gutter: #eeeeee;
  --cm-line-highlight-background: #444444;
  --cm-selection-background: #44444450;
  /* scrollbars colors */
  --cm-ttc-c-thumb: #222;
  --cm-ttc-c-track: #111;
}

.highlighted {
  border-bottom: 1px dashed currentColor;
}
.CodeMirror-scroll::-webkit-scrollbar,
.scrolls::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
.full-scrolls .CodeMirror .CodeMirror-scroll,
.scrolls {
  overflow: auto !important;
  height: calc(100vh - 2px) !important;
  scrollbar-width: thin;
  scrollbar-color: var(--cm-ttc-c-thumb) var(--cm-ttc-c-track);
}
.scrolls-sidebar {
  height: calc(100vh - 25px - 1.5rem - 65px - 1rem - 2px) !important;
}
.overview-scrolls .CodeMirror .CodeMirror-scroll {
  --use-overview-scrolls: var(--overview-scrolls, calc(100vh - 116px - 1rem - 61px - 1rem - 2px));
  height: var(--use-overview-scrolls) !important;
}
.module-scrolls .CodeMirror .CodeMirror-scroll {
  --use-module-scrolls: var(--module-scrolls, calc(100vh - 41px - 2.5rem));
  height: var(--use-module-scrolls) !important;
}
.rpel-scrolls .CodeMirror .CodeMirror-scroll {
  --use-rpel-scrolls: var(--rpel-scrolls, calc(100vh - 41px - 2.5rem));
  height: var(--use-rpel-scrolls) !important;
}
.CodeMirror-scroll::-webkit-scrollbar-track,
.scrolls::-webkit-scrollbar-track {
  background: var(--cm-ttc-c-track);
}
.CodeMirror-scroll::-webkit-scrollbar-thumb,
.scrolls::-webkit-scrollbar-thumb {
  background-color: var(--cm-ttc-c-thumb);
  border-radius: 3px;
  border: 2px solid var(--cm-ttc-c-thumb);
}
.CodeMirror-scroll::-webkit-scrollbar-corner,
.scrolls::-webkit-scrollbar-corner {
  background-color: var(--cm-ttc-c-track);
}
.CodeMirror {
  overflow: unset !important;
}
.CodeMirror-vscrollbar,
.CodeMirror-hscrollbar {
  display: none !important;
}
.CodeMirror-scroll {
  margin-bottom: unset !important;
  margin-right: unset !important;
  padding-bottom: unset !important;
}
</style>
