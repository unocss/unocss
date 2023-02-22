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
    <p class=":uno: text-green text-xl">
      Green Large
    </p>
    <p class="text-(blue sm)">
      Blue Small
    </p>
  </div>
`
