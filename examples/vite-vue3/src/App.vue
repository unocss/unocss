<template>
  <div text-center font-sans p4>
    <div logo />
    <div text-green5 text-lg>
      Hello UnoCSS + Vue
    </div>
    <div i-custom-icon />
    <div i-custom-multi-line-attr />
    <!-- @unocss-skip-start -->
    <div hidden class="bg-[url(../src/uno.svg)] bg-[url(/uno.svg)]" />
    <!-- @unocss-skip-end -->

    <div>SVG Sprite test</div>
    <div class="mdi-close" />
    <div class="mdi-close-bg" />
    <div class="mdi-chevron-down" />
    <div class="mdi-chevron-down-bg" />
    <div class="mdi-chevron-up" />
    <div class="mdi-chevron-up-bg" />

    <div>Custom SVG Sprite</div>
    <div class="sprite-custom-close" />
    <div class="sprite-custom-chevron-down" />
    <div class="sprite-custom-chevron-up" />
    <div class="sprite-custom-animated" />

    <div>Custom SVG Sprite background image</div>
    <div class="sprite-custom-close?bg" />
    <div class="sprite-custom-chevron-down?bg" />
    <div class="sprite-custom-chevron-up?bg" />
    <div class="sprite-custom-animated?bg" />

    <div>Custom MDI SVG Sprite</div>
    <div class="sprite-custom-mdi-account" />
    <div class="sprite-custom-mdi-alert-octagram" />
    <div class="sprite-custom-mdi-access-point-network" />

    <div>Custom SVG Sprite From file system</div>
    <div class="sprite-custom-fs-icon" />
    <div class="sprite-custom-fs-multi-line-attr" />

    <div>Custom SVG Sprite (attributify)</div>
    <div sprite-custom-close />
    <div sprite-custom-chevron-down />
    <div sprite-custom-chevron-up />
    <div sprite-custom-animated />
  </div>
</template>

<style>
.mdi-close {
  --un-icon: url("/sprite.svg#shapes-close-view");
  -webkit-mask: var(--un-icon) no-repeat;
  mask: var(--un-icon) no-repeat;
  -webkit-mask-size: 100% 100%;
  mask-size: 100% 100%;
  background-color: currentColor;
  color: inherit;
  width: 1em;
  height: 1em;
  display: inline-block;
  vertical-align: middle;
}
.mdi-close-bg {
  background: url("/sprite.svg#shapes-close-view") no-repeat;
  background-size: 100% 100%;
  background-color: transparent;
  display: inline-block;
  vertical-align: middle;
  width: 1em;
  height: 1em;
}
.mdi-chevron-down {
  --un-icon: url("/sprite.svg#shapes-chevron-down-view");
  -webkit-mask: var(--un-icon) no-repeat;
  mask: var(--un-icon) no-repeat;
  -webkit-mask-size: 100% 100%;
  mask-size: 100% 100%;
  background-color: currentColor;
  color: inherit;
  width: 1em;
  height: 1em;
  display: inline-block;
  vertical-align: middle;
}
.mdi-chevron-down-bg {
  background: url("/sprite.svg#shapes-chevron-down-view") no-repeat;
  background-size: 100% 100%;
  background-color: transparent;
  display: inline-block;
  vertical-align: middle;
  width: 1em;
  height: 1em;
}
.mdi-chevron-up {
  --un-icon: url("/sprite.svg#shapes-chevron-up-view");
  -webkit-mask: var(--un-icon) no-repeat;
  mask: var(--un-icon) no-repeat;
  -webkit-mask-size: 100% 100%;
  mask-size: 100% 100%;
  background-color: currentColor;
  color: inherit;
  width: 1em;
  height: 1em;
  display: inline-block;
  vertical-align: middle;
}
.mdi-chevron-up-bg {
  background: url("/sprite.svg#shapes-chevron-up-view") no-repeat;
  background-size: 100% 100%;
  background-color: transparent;
  display: inline-block;
  vertical-align: middle;
  width: 1em;
  height: 1em;
}
</style>
