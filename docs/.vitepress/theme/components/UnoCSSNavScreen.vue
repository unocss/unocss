<script setup lang="ts">
import { useScrollLock } from '@vueuse/core'
import { inBrowser } from 'vitepress'
import { ref } from 'vue'
import VPNavScreenAppearance from 'vitepress/dist/client/theme-default/components/VPNavScreenAppearance.vue'
import VPNavScreenMenu from 'vitepress/dist/client/theme-default/components/VPNavScreenMenu.vue'
import VPNavScreenSocialLinks from 'vitepress/dist/client/theme-default/components/VPNavScreenSocialLinks.vue'
import VPNavScreenTranslations from 'vitepress/dist/client/theme-default/components/VPNavScreenTranslations.vue'
import NavScreenRainbowAnimation from './NavScreenRainbowAnimation.vue'

defineProps<{
  open: boolean
}>()

const screen = ref<HTMLElement | null>(null)
const isLocked = useScrollLock(inBrowser ? document.body : null)
</script>

<template>
  <transition
    name="fade"
    @enter="isLocked = true"
    @after-leave="isLocked = false"
  >
    <div v-if="open" id="VPNavScreen" ref="screen" class="VPNavScreen">
      <div class="container">
        <slot name="nav-screen-content-before" />
        <VPNavScreenMenu class="menu" />
        <VPNavScreenTranslations class="translations" />
        <VPNavScreenAppearance class="appearance" />
        <NavScreenRainbowAnimation class="appearance" />
        <VPNavScreenSocialLinks class="social-links" />
        <slot name="nav-screen-content-after" />
      </div>
    </div>
  </transition>
</template>

<style scoped>
.VPNavScreen {
  position: fixed;
  top: calc(var(--vp-nav-height) + var(--vp-layout-top-height, 0px) + 1px);
  /*rtl:ignore*/
  right: 0;
  bottom: 0;
  /*rtl:ignore*/
  left: 0;
  padding: 0 32px;
  width: 100%;
  background-color: var(--vp-nav-screen-bg-color);
  overflow-y: auto;
  transition: background-color 0.5s;
  pointer-events: auto;
}

.VPNavScreen.fade-enter-active,
.VPNavScreen.fade-leave-active {
  transition: opacity 0.25s;
}

.VPNavScreen.fade-enter-active .container,
.VPNavScreen.fade-leave-active .container {
  transition: transform 0.25s ease;
}

.VPNavScreen.fade-enter-from,
.VPNavScreen.fade-leave-to {
  opacity: 0;
}

.VPNavScreen.fade-enter-from .container,
.VPNavScreen.fade-leave-to .container {
  transform: translateY(-8px);
}

@media (min-width: 768px) {
  .VPNavScreen {
    display: none;
  }
}

.container {
  margin: 0 auto;
  padding: 24px 0 96px;
  max-width: 288px;
}

.menu + .translations,
.menu + .appearance,
.translations + .appearance {
  margin-top: 24px;
}

.appearance + .appearance {
  margin-top: 16px;
  margin-bottom: 24px;
}

.menu + .social-links {
  margin-top: 16px;
}

.appearance + .social-links {
  margin-top: 16px;
}
</style>
