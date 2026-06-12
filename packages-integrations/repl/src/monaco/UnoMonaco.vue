<script lang="ts" setup>
import type { UserConfig } from '../index'
import * as monaco from 'monaco-editor'
import { onMounted, onScopeDispose, ref, watch, watchEffect } from 'vue'
import { resolveLanguage } from '../index'
import { createConfigProviderSource, ensureMonacoSetup, registerUnoProviders } from './setup'

const props = withDefaults(defineProps<{
  modelValue: string
  language?: string
  readOnly?: boolean
  theme?: 'dark' | 'light'
  unocss?: UserConfig
  /**
   * Register UnoCSS completion + hover providers (built from `unocss`) for this
   * editor's language. Set `false` when the host registers its own live providers.
   * @default true
   */
  registerProviders?: boolean
  /**
   * Character offset ranges `[start, end]` to underline (e.g. matched UnoCSS utilities).
   * Computed by the host app to keep this component free of engine-internal deps.
   */
  markedRanges?: [number, number][]
}>(), {
  language: 'html',
  readOnly: false,
  theme: 'dark',
  registerProviders: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

ensureMonacoSetup()

const containerRef = ref<HTMLElement>()
let editor: monaco.editor.IStandaloneCodeEditor | null = null
let model: monaco.editor.ITextModel | null = null
let decorations: monaco.editor.IEditorDecorationsCollection | null = null
let skipNextChange = false

function themeName(theme: 'dark' | 'light') {
  return theme === 'dark' ? 'vitesse-dark' : 'vitesse-light'
}

function updateDecorations() {
  if (!model || !editor)
    return
  const ranges = props.markedRanges || []
  const deltas: monaco.editor.IModelDeltaDecoration[] = ranges.map(([start, end]) => {
    const startPos = model!.getPositionAt(start)
    const endPos = model!.getPositionAt(end)
    return {
      range: {
        startLineNumber: startPos.lineNumber,
        startColumn: startPos.column,
        endLineNumber: endPos.lineNumber,
        endColumn: endPos.column,
      },
      options: { inlineClassName: 'unocss-matched' },
    }
  })
  if (decorations)
    decorations.set(deltas)
  else
    decorations = editor.createDecorationsCollection(deltas)
}

onMounted(async () => {
  if (!containerRef.value)
    return

  const lang = resolveLanguage(props.language)

  model = monaco.editor.createModel(props.modelValue, lang)
  editor = monaco.editor.create(containerRef.value, {
    model,
    readOnly: props.readOnly,
    theme: themeName(props.theme),
    minimap: { enabled: false },
    fontSize: 13,
    fontFamily: '\'Fira Code\', monospace',
    fontLigatures: true,
    lineNumbersMinChars: 3,
    scrollBeyondLastLine: false,
    automaticLayout: false, // handled by ResizeObserver below
    padding: { top: 8, bottom: 8 },
    renderLineHighlight: 'line',
    smoothScrolling: true,
    cursorSmoothCaretAnimation: 'on',
    tabSize: 2,
    fixedOverflowWidgets: true,
    overviewRulerBorder: false,
    hideCursorInOverviewRuler: true,
    scrollbar: {
      verticalScrollbarSize: 8,
      horizontalScrollbarSize: 8,
      useShadows: false,
    },
    suggest: {
      preview: true,
      showStatusBar: true,
      showIcons: true,
    },
  })

  // Editor -> Vue sync
  model.onDidChangeContent(() => {
    if (skipNextChange) {
      skipNextChange = false
      return
    }
    emit('update:modelValue', model!.getValue())
  })

  // Relayout on container resize (e.g. splitpanes) — without this the editor
  // renders blank inside a zero-sized flex container at mount time.
  let raf = 0
  const resizeObserver = new ResizeObserver(() => {
    cancelAnimationFrame(raf)
    raf = requestAnimationFrame(() => editor?.layout())
  })
  resizeObserver.observe(containerRef.value)

  // Register UnoCSS providers (completion + hover) for editable editors,
  // unless the host opts to manage providers itself (e.g. with a live config).
  if (!props.readOnly && props.registerProviders)
    registerUnoProviders(lang, createConfigProviderSource(props.unocss))

  updateDecorations()

  onScopeDispose(() => {
    cancelAnimationFrame(raf)
    resizeObserver.disconnect()
  })
})

// Vue -> Editor sync (preserves undo stack and cursor)
watch(() => props.modelValue, (newValue) => {
  if (model && editor && newValue !== model.getValue()) {
    skipNextChange = true
    editor.executeEdits('external-sync', [{
      range: model.getFullModelRange(),
      text: newValue,
    }])
  }
})

watch(() => props.markedRanges, updateDecorations, { deep: true })

// Theme sync
watchEffect(() => {
  if (editor)
    monaco.editor.setTheme(themeName(props.theme))
})

onScopeDispose(() => {
  editor?.dispose()
  model?.dispose()
})
</script>

<template>
  <div ref="containerRef" style="height: 100%; width: 100%" />
</template>
