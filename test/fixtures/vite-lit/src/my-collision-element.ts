const template = document.createElement('template')
template.innerHTML = `
<style>
@unocss-placeholder
</style>
<div class="m-1em">
  <button class="bg-red-300"><slot></slot></button>
  <div part="cool-part">Testing part</div>
  <div part="another-cool-part">Testing another part</div>
</div>
`

export class MyCollisionElement extends HTMLElement {
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
      button?.classList?.remove('bg-red-300')
      button?.classList?.add('bg-yellow-300')
    }
    else {
      button?.classList?.remove('bg-yellow-300')
      button?.classList?.add('bg-red-300')
    }
  }
}
window.customElements.define('my-collision-element', MyCollisionElement)
