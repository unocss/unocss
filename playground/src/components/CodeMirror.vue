<script setup lang="ts">
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

    const v = input.value
    // hightlight for classes
    let start = 0
    v.split(/[\s"']/g).forEach((i) => {
      const end = start + i.length
      if (props.matched?.has(i))
        mark(start, end)
      start = end + 1
    })
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
