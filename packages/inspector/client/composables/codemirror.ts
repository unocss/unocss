import type { Ref, WritableComputedRef } from 'vue'
import { computed, unref, watch } from 'vue'
import { Decoration, keymap } from '@codemirror/view'
import type { EditorViewConfig } from '@codemirror/view'
import type { Extension } from '@codemirror/state'
import { EditorSelection, EditorState, StateEffect, StateField } from '@codemirror/state'
import { EditorView, basicSetup } from 'codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { css } from '@codemirror/lang-css'
import { xml } from '@codemirror/lang-xml'
import { htmlLanguage } from '@codemirror/lang-html'
import type { CompletionSource } from '@codemirror/autocomplete'
import { acceptCompletion, completionKeymap } from '@codemirror/autocomplete'
import type { MaybeRef } from '@vueuse/core'
import { vitesse } from '../theme'

// Effects can be attached to transactions to communicate with the extension
export const addMarks = StateEffect.define<any>()
export const filterMarks = StateEffect.define<any>()
// This value must be added to the set of extensions to enable this
const markField = StateField.define({
  // Start with an empty set of decorations
  create() { return Decoration.none },
  // This is called whenever the editor updates—it computes the new set
  update(value, tr) {
    // Move the decorations to account for document changes
    value = value.map(tr.changes)
    // If this transaction adds or removes decorations, apply those changes
    for (const effect of tr.effects) {
      if (effect.is(addMarks))
        value = value.update({ add: effect.value, sort: true })
      // @ts-expect-error any
      else if (effect.is(filterMarks))
        // @ts-expect-error any
        value = value.update({ filter: effect.value })
    }
    return value
  },
  // Indicate that this field provides a set of decorations
  provide: f => EditorView.decorations.from(f),
})

const langExtensions: Record<string, () => {}> = {
  xml,
  css,
  html: () => htmlLanguage.extension,
  vue: () => htmlLanguage.extension,
  svelte: () => htmlLanguage.extension,
  js: javascript,
  mjs: javascript,
  cjs: javascript,
  ts: () => javascript({ typescript: true }),
  mts: () => javascript({ typescript: true }),
  cts: () => javascript({ typescript: true }),
  jsx: () => javascript({ jsx: true }),
  tsx: () => javascript({ typescript: true, jsx: true }),
}

export function useCodeMirror(
  parent: Ref<HTMLElement | null | undefined>,
  input: Ref<string> | WritableComputedRef<string>,
  options: MaybeRef<EditorViewConfig & { readOnly?: boolean; mode?: string; autocomplete?: CompletionSource }> = {},
) {
  const keymaps = [...completionKeymap]
  keymaps.push({ key: 'Tab', run: acceptCompletion })
  const extensions = computed(() => {
    const { mode = 'html', readOnly, autocomplete } = unref(options)
    return [
      basicSetup,
      vitesse,
      markField,
      langExtensions[mode](),
      mode === 'html' && autocomplete && htmlLanguage.data.of({ autocomplete }),
      readOnly && EditorState.readOnly.of(true),
      keymap.of(keymaps),
    ].filter(Boolean) as Extension[]
  })
  let skip = false
  const cm = new EditorView(
    {
      parent: parent.value as Element,
      doc: input.value,
      extensions: extensions.value,
      dispatch(tr) {
        cm.update([tr])
        const selection = cm.state.selection.main
        if (selection.from !== selection.to) {
          cm.contentDOM.style.setProperty('--cm-line-highlight-background', 'transparent')
          cm.contentDOM.style.setProperty('--cm-line-highlight-border', 'transparent')
        }
        else {
          cm.contentDOM.style.removeProperty('--cm-line-highlight-background')
          cm.contentDOM.style.removeProperty('--cm-line-highlight-border')
        }

        if (tr.docChanged) {
          if (skip) {
            skip = false
            return
          }
          input.value = cm.state.doc.toString()
        }
      },
      ...unref(options),
    },
  )

  watch(options, () => {
    cm.dispatch({
      effects: StateEffect.reconfigure.of(extensions.value),
    })
  })

  watch(
    input,
    (v) => {
      if (v !== cm.state.doc.toString()) {
        skip = true
        const selections = cm.state.selection.ranges
        cm.dispatch({
          changes: { from: 0, to: cm.state.doc.length, insert: v },
          selection: EditorSelection.create(selections),
        })
      }
    },
    { immediate: true },
  )

  return cm
}
