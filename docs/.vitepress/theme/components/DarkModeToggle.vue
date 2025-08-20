<script setup lang="ts">
import { useData } from 'vitepress'
import { inject } from 'vue'

const { isDark } = useData()

// Use the custom toggle-appearance function provided by UnoCSSLayout
const toggleAppearance = inject('toggle-appearance', () => {
  // Fallback if the provider is not available
  isDark.value = !isDark.value
})

function toggleDark(event: MouseEvent) {
  toggleAppearance(event)
}
</script>

<template>
  <button
    class="VPSwitch VPSwitchAppearance"
    type="button"
    role="switch"
    :title="isDark ? 'Switch to light theme' : 'Switch to dark theme'"
    :aria-checked="isDark"
    @click="toggleDark"
  >
    <span class="VPSwitchAppearanceText">
      <span class="vpi-sun sun" />
      <span class="vpi-moon moon" />
    </span>
  </button>
</template>

<style scoped>
.VPSwitchAppearance {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: opacity 0.25s;
  border: none;
  outline: none;
  background: transparent;
  cursor: pointer;
}

.VPSwitchAppearance:hover {
  opacity: 0.8;
}

.VPSwitchAppearanceText {
  position: relative;
  width: 16px;
  height: 16px;
}

.sun,
.moon {
  position: absolute;
  top: 0;
  left: 0;
  width: 16px;
  height: 16px;
  transition: opacity 0.25s;
}

.sun {
  opacity: 1;
}

.moon {
  opacity: 0;
}

.dark .sun {
  opacity: 0;
}

.dark .moon {
  opacity: 1;
}

.vpi-sun {
  --icon: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3ccircle cx='12' cy='12' r='5'/%3e%3cpath d='M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42'/%3e%3c/svg%3e");
  mask: var(--icon) no-repeat;
  mask-size: 100% 100%;
  -webkit-mask: var(--icon) no-repeat;
  -webkit-mask-size: 100% 100%;
  background-color: currentColor;
  width: 16px;
  height: 16px;
}

.vpi-moon {
  --icon: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpath d='M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z'/%3e%3c/svg%3e");
  mask: var(--icon) no-repeat;
  mask-size: 100% 100%;
  -webkit-mask: var(--icon) no-repeat;
  -webkit-mask-size: 100% 100%;
  background-color: currentColor;
  width: 16px;
  height: 16px;
}
</style>
