const template = document.createElement('template')

template.innerHTML = `
  <style>
    :host {
      width: 100%;
      height: 100%;
    }
    #dark-wrap {
      width: 100%;
      height: 100%;
      position: relative;
      overflow: hidden;
    }
    #container {
      position: absolute;
      inset: 0;
      overflow: auto;
    }
  </style>
  <div id="dark-wrap">
    <div id="container">
    </div>
  </div>
`

class Play extends HTMLElement {
  private styleEl: HTMLStyleElement | null
  private fixedStyleEl: HTMLStyleElement | null
  private container: HTMLElement
  private darkWrap: HTMLElement
  constructor() {
    super()

    this.attachShadow({ mode: 'open' })

    if (this.shadowRoot)
      this.shadowRoot.appendChild(template.content.cloneNode(true))

    this.styleEl = null
    this.fixedStyleEl = null
    this.container = this.shadowRoot!.getElementById('container')!
    this.darkWrap = this.shadowRoot!.getElementById('dark-wrap')!

    this.setContent({
      css: this.getAttribute('css') || '',
      html: this.getAttribute('html') || '<div>Preview</div>',
      classes: this.getAttribute('classes') || '',
      fixedCss: this.getAttribute('fixed-css') || '',
    })

    if (this.getAttribute('dark') === 'true')
      this.container.classList.add('dark')
  }

  static get observedAttributes() {
    return ['dark', 'css', 'html', 'classes', 'fixed-css', 'fixedcss']
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (name === 'dark') {
      if (newValue === 'true')
        this.darkWrap.classList.add('dark')
      else
        this.darkWrap.classList.remove('dark')

      return
    }

    if (name === 'fixed-css' || name === 'fixedcss')
      name = 'fixedCss'

    this.setContent({
      [name]: newValue,
    })
  }

  setContent(data: Record<string, string>) {
    if (!this.shadowRoot) return

    const {
      css,
      fixedCss,
      classes,
      html,
    } = data

    if (css) {
      if (this.styleEl)
        this.shadowRoot.removeChild(this.styleEl)
      this.styleEl = document.createElement('style')
      this.styleEl.innerHTML = css
      this.shadowRoot.appendChild(this.styleEl)
    }

    if (fixedCss) {
      if (this.fixedStyleEl)
        this.shadowRoot.removeChild(this.fixedStyleEl)
      this.fixedStyleEl = document.createElement('style')
      this.fixedStyleEl.innerHTML = fixedCss
      this.shadowRoot.appendChild(this.fixedStyleEl)
    }
    if (html)
      this.container.innerHTML = html
    if (classes && this.container.children[0])
      this.container.children[0].setAttribute('class', classes)
  }
}

window.customElements.define('preview-box', Play)
