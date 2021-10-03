<script setup lang="ts">
import { getMatchedPositions } from '../../../src/utils'
import { useCodeMirror } from '../codemirror'

const props = defineProps<{
  modelValue: string
  mode?: string
  readOnly?: boolean
  matched?: Set<string>
}>()
const emit = defineEmits<{
  (input: any): void
}>()

const el = ref<HTMLTextAreaElement>()
const input = useVModel(props, 'modelValue', emit, { passive: true })

onMounted(async() => {
  const cm = useCodeMirror(el, input, props)

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

    getMatchedPositions(input.value, props.matched || new Set())
      .forEach(i => mark(...i))
  }

  watchEffect(() => {
    if (props.matched)
      highlight()
  })
})
</script>

<template>
  <div>
    <textarea ref="el" />
  </div>
</template>
