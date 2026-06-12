<script lang="ts" setup>
import type { Extension } from '@codemirror/state'
import type { UserConfig } from '../index'
import { autocompletion } from '@codemirror/autocomplete'
import { html } from '@codemirror/lang-html'
import { Compartment } from '@codemirror/state'
import { oneDark } from '@codemirror/theme-one-dark'
import { EditorView } from '@codemirror/view'
import { basicSetup } from 'codemirror'
import { onMounted, onScopeDispose, ref, watch } from 'vue'
import { resolveLanguage } from '../index'
import { createUnoCompletionSource } from './completion'

const props = withDefaults(defineProps<{
  modelValue: string
  language?: string
  readOnly?: boolean
  theme?: 'dark' | 'light'
  unocss?: UserConfig
}>(), {
  language: 'html',
  readOnly: false,
  theme: 'dark',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const baseTheme = EditorView.theme({
  '&': {
    fontSize: '13px',
    fontFamily: '\'Fira Code\', monospace',
  },
  '.cm-content': {
    padding: '8px 0',
  },
})

const containerRef = ref<HTMLElement>()
let view: EditorView | null = null
let skipNextUpdate = false
const themeCompartment = new Compartment()

function themeExtensions(): Extension {
  return props.theme === 'dark' ? [oneDark, baseTheme] : baseTheme
}

function buildExtensions(): Extension[] {
  const ext: Extension[] = [basicSetup]

  if (resolveLanguage(props.language) === 'html')
    ext.push(html())

  ext.push(themeCompartment.of(themeExtensions()))

  if (props.readOnly)
    ext.push(EditorView.editable.of(false))

  if (!props.readOnly) {
    ext.push(autocompletion({
      override: [createUnoCompletionSource(props.unocss)],
      activateOnTyping: true,
    }))
  }

  ext.push(EditorView.updateListener.of((update) => {
    if (update.docChanged && !skipNextUpdate)
      emit('update:modelValue', update.state.doc.toString())
    skipNextUpdate = false
  }))

  return ext
}

onMounted(() => {
  if (!containerRef.value)
    return

  view = new EditorView({
    doc: props.modelValue,
    extensions: buildExtensions(),
    parent: containerRef.value,
  })
})

// Vue -> Editor sync
watch(() => props.modelValue, (newValue) => {
  if (view && newValue !== view.state.doc.toString()) {
    skipNextUpdate = true
    view.dispatch({
      changes: {
        from: 0,
        to: view.state.doc.length,
        insert: newValue,
      },
    })
  }
})

watch(() => props.theme, () => {
  view?.dispatch({
    effects: themeCompartment.reconfigure(themeExtensions()),
  })
})

onScopeDispose(() => {
  view?.destroy()
})
</script>

<template>
  <div ref="containerRef" style="height: 100%; width: 100%; overflow: auto" />
</template>
