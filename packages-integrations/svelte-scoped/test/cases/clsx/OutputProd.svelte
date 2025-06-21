<script lang="ts">
  import { clsx } from "clsx";

  function wrapped(...args: Parameters<typeof clsx>) {
    return clsx(...args);
  }

  const underline = Math.random() > 0.5;
</script>

<p class={["usp-pije4y"]} />

<p class={["usp-pije4y", true ? "usp-133qwa" : "usp-ha5pjs"]} />

<p class={{ "usp-pije4y": true, "usp-133qwa": underline }} />

<p class={clsx("usp-u85pcr", "usp-ti35zw")} />

<p
  class={clsx(
    "usp-u85pcr",
    true && "usp-ti35zw",
    false ? "usp-pxwt0y" : "usp-133qwa"
  )}
/>

<p
  class={wrapped(
    "usp-u85pcr",
    true && "usp-ti35zw",
    false ? "usp-pxwt0y" : "usp-133qwa"
  )}
/>

<style>
  :global(.usp-pxwt0y) {
    border-width: 1px;
  }
  :global(.usp-ti35zw) {
    --un-bg-opacity: 1;
    background-color: rgb(96 165 250 / var(--un-bg-opacity));
  }
  :global(.usp-ha5pjs) {
    --un-text-opacity: 1 !important;
    color: rgb(255 255 255 / var(--un-text-opacity)) !important;
  }
  :global(.usp-pije4y) {
    --un-text-opacity: 1;
    color: rgb(248 113 113 / var(--un-text-opacity));
    font-weight: 700;
  }
  :global(.usp-u85pcr) {
    --un-text-opacity: 1;
    color: rgb(248 113 113 / var(--un-text-opacity));
  }
  :global(.usp-133qwa) {
    text-decoration-line: underline;
  }
</style>
