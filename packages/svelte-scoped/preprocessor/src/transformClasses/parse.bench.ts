import MagicString from 'magic-string'
import { parse } from 'svelte/compiler'
import { bench, describe } from 'vitest'
import { unoMock } from './unoMock'
import { findClasses } from './findClasses'
import { processClasses } from './processClasses'
import { transformClasses } from '.'

const simpleSvelteComponent = `
<script>
import { uno } from 'uno'
</script>
<div class="mb-1">Hello</div>
<style>
div {
  color: green;
}
</style>
`

describe('measure basic operations', () => {
  const classesRE = /class=(["'\`])([\S\s]+?)\1/g // class="mb-1"
  bench('find classes using regex', () => {
    const classes = [...simpleSvelteComponent.matchAll(classesRE)]
  })

  bench('create a MagicString', () => {
    const s = new MagicString(simpleSvelteComponent)
  })
})

describe('parse classes in a simple Svelte component', () => {
  bench('create an AST', () => {
    const ast = parse(simpleSvelteComponent, { filename: 'App.svelte' })
  })

  bench('use regex to find and process classes', async () => {
    const classesToProcess = findClasses(simpleSvelteComponent)
    const result = await processClasses(classesToProcess, {}, unoMock, 'App.svelte')
  })
})

describe('parse classes in a bigger Svelte component with many repeated instances of a utility class, shortcut, and unknown class', () => {
  const biggerSvelteComponent = `
<script>
  import { foo } from 'uno'
  export let onclick
</script>
<div class="mb-1">Hello</div>
<div class="mr-1 my-shortcut foo">World</div>
<div class="mr-1 my-shortcut foo">World</div>
<div class="mr-1 my-shortcut foo">World</div>
<div class="mr-1 my-shortcut foo">World</div>
<div class="mr-1 my-shortcut foo">World</div>
<div class="mr-1 my-shortcut foo">World</div>
<div class="mr-1 my-shortcut foo">World</div>
<div class="mr-1 my-shortcut foo">World</div>
<div class="mr-1 my-shortcut foo">World</div>
<div class="mr-1 my-shortcut foo">World</div>
<div class="mr-1 my-shortcut foo">World</div>
<div class="mr-1 my-shortcut foo">World</div>
<button class="font-semibold" on:click={onclick} type="button">
<span class="i-logos:svelte-icon" /><slot /></button>
<style>
  div {
    color: green;
  }
</style>`

  bench('create an AST', () => {
    const ast = parse(biggerSvelteComponent, { filename: 'App.svelte' })
  })

  bench('use regex to find and process classes', async () => {
    const classesToProcess = findClasses(biggerSvelteComponent)
    const result = await processClasses(classesToProcess, {}, unoMock, 'App.svelte')
  })

  // before running comment out `uno.config.shortcuts = [...originalShortcuts, ...shortcutsForThisComponent]` in transformClasses as it creates a memory error when running thousands of times simultaneously - this bench is more for curiosity than comparison because it only adds the tail end generation of the CSS that any parsing method would need to do
  bench.skip('transform classes for a simple component using regex finding and magic-string to update code', () => {
    const result = transformClasses({ content: biggerSvelteComponent, filename: 'App.svelte', uno: unoMock, options: { combine: false } })
  })
})
