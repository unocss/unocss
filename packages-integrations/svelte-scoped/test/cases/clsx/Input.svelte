<script lang="ts">
  import { clsx } from 'clsx';

  function wrapped(...args: Parameters<typeof clsx>) {
    return clsx(...args);
  }

  const underline = Math.random() > 0.5;
</script>

<p class={['c-red font-bold']}></p>

<p class={['c-red font-bold', true ? 'underline' : 'c-white!']}></p>

<p class={{ 'c-red font-bold': true, underline }}></p>

<p class={clsx('c-red', 'bg-blue')}></p>

<p class={clsx('c-red', true && 'bg-blue', false ? 'border' : 'underline')}></p>

<p class={wrapped('c-red', true && 'bg-blue', false ? 'border' : 'underline')}></p>
