<template>
  <div px5 py12 gap4 c-truegray5 h-full of-auto>
    <svg w-25 h-25 mxa mb4 mt8 flex-none viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M117.444 167.888C117.444 140.273 139.83 117.888 167.444 117.888V117.888C195.058 117.888 217.444 140.273 217.444 167.888V167.888C217.444 195.502 195.058 217.888 167.444 217.888V217.888C139.83 217.888 117.444 195.502 117.444 167.888V167.888Z" fill="#858585" />
      <path d="M117.444 53C117.444 25.3858 139.83 3 167.444 3V3C195.058 3 217.444 25.3858 217.444 53V98C217.444 100.761 215.205 103 212.444 103H122.444C119.683 103 117.444 100.761 117.444 98V53Z" fill="#CCCCCC" />
      <path d="M102 167.888C102 195.502 79.6142 217.888 52 217.888V217.888C24.3858 217.888 2 195.502 2 167.888L2.00001 122.888C2.00001 120.126 4.23859 117.888 7.00001 117.888L97 117.888C99.7614 117.888 102 120.126 102 122.888L102 167.888Z" fill="#4D4D4D" />
    </svg>
    <p>
      Welcome to UnoCSS <b c-black dark:c-white>Interactive</b> docs! <sup>Beta</sup>
    </p>
    <p>
      Type anything to search for atomic utils, CSS properties, guides, or evaluate the expressions!
    </p>

    <div divider w-30 ma mb3 mt10 />
    <p>
      Or try start with the following utils:
    </p>
    <div row flex-wrap gap-2 justify-center>
      <RouterLink :to="{ query: { s: 'border' } }" badge-lg-orange transition hover:translate-y--2px>
        border
      </RouterLink>
      <RouterLink :to="{ query: { s: 'margin' } }" badge-lg-amber transition hover:translate-y--2px>
        margin
      </RouterLink>
      <RouterLink :to="{ query: { s: 'c-yellow' } }" badge-lg-yellow transition hover:translate-y--2px>
        c-yellow
      </RouterLink>
      <RouterLink :to="{ query: { s: 'colors' } }" badge-lg-lime transition hover:translate-y--2px>
        colors
      </RouterLink>
      <RouterLink :to="{ query: { s: 'guide:' } }" badge-lg-green transition hover:translate-y--2px>
        guide:
      </RouterLink>
      <RouterLink :to="{ query: { s: 'i-twemoji-frog' } }" badge-lg-emerald transition hover:translate-y--2px>
        i-twemoji-frog
      </RouterLink>
      <RouterLink :to="{ query: { s: 'random:' } }" badge-lg-teal transition hover:translate-y--2px>
        random:
      </RouterLink>
    </div>
    <div divider w-30 ma my5 />

    <div flex-auto />
    <div text-opacity-50 text-gray text-sm>
      <div row gap1 justify-center>
        Built with <a href="https://v3.nuxtjs.org/" target="_blank" text-gray text-opacity-100>Nuxt 3</a> ·
        Deploys on <a href="https://www.netlify.com/" target="_blank" text-gray text-opacity-100>Netlify</a>
      </div>
      <div>
        MIT Licensed | Copyright © 2021-PRESENT Anthony Fu and UnoCSS contributors
      </div>
    </div>
  </div>
</template>
