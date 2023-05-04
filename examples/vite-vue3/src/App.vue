<script setup lang="ts">
import cssWithLayer from 'uno:shortcuts.css?inline'
import css from 'uno.css?inline'
</script>

<template>
  <div font-sans p4>
    <div logo />
    <div text-green5 text-lg>
      Hello UnoCSS + Vue
    </div>
    <div i-custom-icon />
    <div i-custom-multi-line-attr />
    <div hidden class="bg-[url(../src/uno.svg)] bg-[url(/uno.svg)]" />
    <pre>{{ css }}</pre>
    <pre>{{ cssWithLayer }}</pre>
  </div>
</template>
