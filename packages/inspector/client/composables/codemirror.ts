import type { Ref, WritableComputedRef } from 'vue'
import { watch } from 'vue'
import CodeMirror from 'codemirror'
import 'codemirror/mode/javascript/javascript'
import 'codemirror/mode/css/css'
import 'codemirror/mode/xml/xml'
import 'codemirror/mode/htmlmixed/htmlmixed'
import 'codemirror/mode/jsx/jsx'
import 'codemirror/addon/display/placeholder'
import 'codemirror/addon/hint/show-hint'
import 'codemirror/lib/codemirror.css'
import 'codemirror-theme-vars/base.css'
import 'codemirror/addon/hint/show-hint.css'
import type { MaybeRef } from '@vueuse/core'

export function useCodeMirror(
  textarea: Ref<HTMLTextAreaElement | null | undefined>,
  input: Ref<string> | WritableComputedRef<string>,
  options: MaybeRef<CodeMirror.EditorConfiguration> = {},
) {
  const cm = CodeMirror.fromTextArea(
    textarea.value!,
    {
      theme: 'vars',
      ...unref(options),
    },
  )

  watch(
    options,
    options => Object
      .entries(options)
      .forEach(([key, option]) => cm.setOption(key as keyof CodeMirror.EditorConfiguration, option)),
  )

  let skip = false

  cm.on('change', () => {
    if (skip) {
      skip = false
      return
    }
    input.value = cm.getValue()
  })

  watch(
    input,
    (v) => {
      if (v !== cm.getValue()) {
        skip = true
        const selections = cm.listSelections()
        cm.replaceRange(v, cm.posFromIndex(0), cm.posFromIndex(Infinity))
        cm.setSelections(selections)
      }
    },
    { immediate: true },
  )

  return cm
}
