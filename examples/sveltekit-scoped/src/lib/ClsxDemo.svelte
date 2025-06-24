<script lang="ts">
  import Button from './Button.svelte';

  let underline = $state(false);
  let bold = $state(false);
  let italic = $state(false);
  let red = $state(false);
</script>

<p class={['p-3', { underline, 'font-bold': bold }, italic && 'italic']} class:c-red={red}>
  Demo text using clsx classes and <code>`class:`</code> directive
</p>

<Button onclick={() => (underline = !underline)}>toggle underline</Button>
<Button onclick={() => (bold = !bold)}>toggle bold</Button>
<Button onclick={() => (italic = !italic)}>toggle italic</Button>
<Button onclick={() => (red = !red)}>toggle red</Button>
