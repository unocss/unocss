/* eslint-disable unused-imports/no-unused-vars */
import MagicString from 'magic-string'
import { parse } from 'svelte/compiler'
import { describe, it } from 'vitest'
import { unoMock } from './unoMock'
import { findClasses } from './findClasses'
import { processClasses } from './processClasses'

// import { transformClasses } from '.'

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
  const classesRE = /class=(["'`])([\s\S]+?)\1/g // class="mb-1"
  it('find classes using regex', () => {
    const classes = [...simpleSvelteComponent.matchAll(classesRE)]
  })

  it('create a MagicString', () => {
    const s = new MagicString(simpleSvelteComponent)
  })
})

describe('parse classes in a simple Svelte component', () => {
  it('create an AST', () => {
    const ast = parse(simpleSvelteComponent, { filename: 'App.svelte' })
  })

  it('use regex to find and process classes', async () => {
    const classesToProcess = findClasses(simpleSvelteComponent)
    const result = await processClasses(classesToProcess, {}, unoMock, 'App.svelte')
  })

  // before running comment out `uno.config.shortcuts = [...originalShortcuts, ...shortcutsForThisComponent]` in transformClasses as it creates a memory error when running thousands of times simultaneously - this bench is more for curiosity than comparison because it only adds the tail end generation of the CSS that any parsing method would need to do
  // bench.skip('transform classes for a simple component using regex finding and magic-string to update code', () => {
  //   const result = transformClasses({ content: simpleSvelteComponent, filename: 'App.svelte', uno: unoMock, options: { combine: false } })
  // })
})

describe('parse classes in a bigger Svelte component with an artificially large number of instances of a utility class, shortcut, and unknown class', () => {
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

  it('create an AST', () => {
    const ast = parse(biggerSvelteComponent, { filename: 'App.svelte' })
  })

  it('use regex to find and process classes', async () => {
    const classesToProcess = findClasses(biggerSvelteComponent)
    const result = await processClasses(classesToProcess, {}, unoMock, 'App.svelte')
  })
})

describe('parse classes in a slideover Svelte component with some logic as well as a good bit of classes', () => {
  const slideoverComponent = `
  <script>
  import { createEventDispatcher, onMount } from 'svelte';
  import { fly, fade } from 'svelte/transition';
  import { portal } from '../actions/portal';
  import { trapFocus } from './trapFocus';

  export let zIndex = 60;
  export let duration = 200;
  export let side = 'right';
  export let widthRem = 16;
  export let maxWidthPercentage = 70;

  const dispatch = createEventDispatcher();
  const close = () => dispatch('close');

  let slideover;

  onMount(() => {
    const previouslyFocused =
      typeof document !== 'undefined' && document.activeElement;

    return () => {
      if (previouslyFocused) {
        previouslyFocused.focus();
      }
    };
  });
</script>

<svelte:window
  on:keydown={(e) => {
    if (e.key === 'Escape') return close();
    if (e.key === 'Tab') trapFocus(e, slideover);
  }}
/>

<div
  use:portal
  class:right-0={side === 'right'}
  class:left-0={side === 'left'}
  class="fixed inset-y-0 flex"
  style="z-index: {zIndex};"
>
  <div class="fixed inset-0 transition-opacity" transition:fade={{ duration }}>
    <button type="button" class="absolute inset-0 bg-black opacity-25" on:click={close} />
  </div>

  <div
    transition:fly={{ x: side === 'right' ? 200 : -200, duration }}
    class="bg-white overflow-hidden shadow-xl transform
    transition-all w-64 h-full flex flex-col z-1"
    style="width: {widthRem}rem; max-width: {maxWidthPercentage}vw;"
    role="dialog"
    aria-modal="true"
    aria-labelledby="slideover-headline"
    bind:this={slideover}
  >
    {#if $$slots.title}
      <div class="flex items-start justify-between border-b border-gray-300">
        <h3 class="text-lg font-medium text-gray-900 p-3" id="slideover-headline">
          <slot name="title" />
        </h3>
        <button
          on:click={close}
          type="button"
          class="text-gray-400 px-3 py-4 flex hover:text-gray-500 focus:outline-none
    focus:text-gray-500 transition ease-in-out duration-150"
          aria-label="Close"
        >
          <span class="i-fa-solid-times text-lg" /></button
        >
      </div>
    {/if}

    <slot name="heading" />

    <div class="flex-1 overflow-y-auto">
      <slot />
    </div>
  </div>
</div>`

  it('create an AST', () => {
    const ast = parse(slideoverComponent, { filename: 'App.svelte' })
  })

  it('use regex to find and process classes', async () => {
    const classesToProcess = findClasses(slideoverComponent)
    const result = await processClasses(classesToProcess, {}, unoMock, 'App.svelte')
  })
})
