const template = document.createElement('template')
template.innerHTML = `
<style>
@unocss-import
</style>
<button class="bg-green-300"><slot></slot></button>
`

export class MyAnotherElement extends HTMLElement {
  _clicked = false

  constructor() {
    super()
  }

  connectedCallback() {
    this.attachShadow({ mode: 'open' })
    this.shadowRoot?.appendChild(template.content.cloneNode(true))
    const button = this.shadowRoot?.querySelector('button')
    button?.addEventListener('click', this._handleClick.bind(this))
  }

  _handleClick() {
    this._clicked = !this._clicked
    const button = this.shadowRoot?.querySelector('button')
    if (this._clicked) {
      button?.classList?.remove('bg-green-300')
      button?.classList?.add('bg-blue-300')
    }
    else {
      button?.classList?.remove('bg-blue-300')
      button?.classList?.add('bg-green-300')
    }
  }
}
window.customElements.define('my-another-element', MyAnotherElement)
