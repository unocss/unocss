<script lang="ts">
  import { marked } from "marked";
  marked.use({
    mangle: false,
    headerIds: false
  });
</script>

<div
  class="text-base prose prose-purple md:prose-orange  dark:prose-invert max-w-full text-left mt-10 p-3 md:p-5 shadow-lg border rounded"
>
  {@html marked.parse(`# Svelte Scoped Uno with SvelteKit
  This project has the following **example usages**:
  
- dark mode
- \`.logo\` shortcut
- preflights
- safelist
- styles reset
- parent dependent classes
- children affecting classes
- nested component styles (passed down through class prop)
- Conditional \`class:\` syntax, including shorthand
- --at-apply
- This \`.prose\` block is from \`presetTypography()\`. Place the \`prose\` class into your safelist to make it work (as that class must be in the global stylesheet). Color classes like \`prose-purple\` are fine to use as you would any other utility class. You can put it in the safelist to have it in the global styles or leave it alone to have it be added just to the component(s) where used.
`)}
</div>
