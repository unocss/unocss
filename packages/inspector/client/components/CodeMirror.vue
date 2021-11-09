<script setup lang="ts">
import { getMatchedPositions } from '../composables/pos'
import { useCodeMirror } from '../composables/codemirror'

const emit = defineEmits<{ (input: any): void }>()
const props = defineProps<{
  modelValue: string
  mode?: string
  readOnly?: boolean
  matched?: Set<string> | string[]
}>()

const modeMap: Record<string, string> = {
  html: 'htmlmixed',
  vue: 'htmlmixed',
  js: 'javascript',
  mjs: 'javascript',
  cjs: 'javascript',
  ts: 'typescript',
  mts: 'typescript',
}

const el = ref<HTMLTextAreaElement>()
const input = useVModel(props, 'modelValue', emit, { passive: true })

onMounted(async() => {
  const cm = useCodeMirror(el, input, {
    ...props,
    mode: modeMap[props.mode || ''] || props.mode,
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
      .forEach(i => mark(...i))
  }

  watch(() => [props.modelValue, props.matched], async() => {
    await nextTick()
    if (props.matched)
      highlight()
  }, { immediate: true })
})
</script>

<template>
  <div
    relative
    font-mono
    overflow-auto
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
}

.highlighted {
  border-bottom: 1px dashed currentColor;
}
</style>
