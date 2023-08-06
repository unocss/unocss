import '@unocss/reset/tailwind.css'
import './main.css'
import 'uno.css'

// @unocss-include
const html = String.raw
document.querySelector<HTMLDivElement>('#app')!.innerHTML = html`
  <div class="font-sans p4">
    <p class="text-red">
      Red
    </p>
    <!-- @unocss-skip-start -->
    <p class="text-yellow text-lg">
      Teal Large
    </p>
    <!-- @unocss-skip-end -->
    <p class=":uno: text-green text-xl">
      Green XL
    </p>
    <p class="text-(blue sm)">
      Blue Small
    </p>
    <!-- @unocss-skip-start -->
    <p class="text-(teal xl)">
      Skip transformer
    </p>
     <!-- @unocss-skip-end -->
  </div>
`
