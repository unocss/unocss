// @unocss-include
import css from 'virtual:uno.css?inline'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class="text-red">${css}</div>
`
