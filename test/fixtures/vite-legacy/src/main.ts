import '@unocss/reset/tailwind.css'
import 'uno.css'

// @unocss-include
const html = String.raw
document.querySelector<HTMLDivElement>('#app')!.innerHTML = html`
  <div class="bg-[url(../src/uno.svg)]">
    <p class="text-red">
      Red
    </p>
  </div>
`
