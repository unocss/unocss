<script lang="ts">
  import { clsx } from "clsx";

  function wrapped(...args: Parameters<typeof clsx>) {
    return clsx(...args);
  }

  const underline = Math.random() > 0.5;
</script>

<p class={["_c-red_wob8jk _font-bold_wob8jk"]} />

<p
  class={[
    "_c-red_wob8jk _font-bold_wob8jk",
    true ? "_underline_wob8jk" : "_c-white!_wob8jk",
  ]}
/>

<p
  class={{
    "_c-red_wob8jk _font-bold_wob8jk": true,
    _underline_wob8jk: underline,
  }}
/>

<p class={clsx("_c-red_wob8jk", "_bg-blue_wob8jk")} />

<p
  class={clsx(
    "_c-red_wob8jk",
    true && "_bg-blue_wob8jk",
    false ? "_border_wob8jk" : "_underline_wob8jk"
  )}
/>

<p
  class={wrapped(
    "_c-red_wob8jk",
    true && "_bg-blue_wob8jk",
    false ? "_border_wob8jk" : "_underline_wob8jk"
  )}
/>

<style>
  :global(._border_wob8jk) {
    border-width: 1px;
  }
  :global(._bg-blue_wob8jk) {
    --un-bg-opacity: 1;
    background-color: rgb(96 165 250 / var(--un-bg-opacity));
  }
  :global(._c-red_wob8jk) {
    --un-text-opacity: 1;
    color: rgb(248 113 113 / var(--un-text-opacity));
  }
  :global(._c-white\!_wob8jk) {
    --un-text-opacity: 1 !important;
    color: rgb(255 255 255 / var(--un-text-opacity)) !important;
  }
  :global(._font-bold_wob8jk) {
    font-weight: 700;
  }
  :global(._underline_wob8jk) {
    text-decoration-line: underline;
  }
</style>
