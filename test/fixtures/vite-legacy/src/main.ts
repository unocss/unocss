import '@unocss/reset/tailwind.css'
import 'uno.css'

const html = String.raw
document.querySelector<HTMLDivElement>('#app')!.innerHTML = html`
  <div class="bg-[url(../src/uno.svg)] text-red">
  </div>
`
