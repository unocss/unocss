<template>
  <div flex="~ gap-1 cols">
    <div class="hover:text-red text-4xl mx1 m2">
      <div i-carbon-campsite inline-block />
    </div>
    <p>
      <a rel="noreferrer" href="https://github.com/antfu/vitesse" target="_blank">
        Vitesse
      </a>
    </p>
    <p>
      <em text-sm opacity-75 class="foo" hover:text-red text-4xl mx1 m2>{{ t('intro.desc') }}</em>
    </p>

    <div class="hover:(text-red text-4xl) hover:mx1 mx1 m2">Variant group</div>

    <div class="
    foo bar
    hover:(text-red text-4xl)
    hover:mx1 mx1 m2
    "></div>
  </div>
</template>
