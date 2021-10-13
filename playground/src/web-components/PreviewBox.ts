const template = document.createElement('template')

template.innerHTML = `
  <style>
    *::-webkit-scrollbar {
      background-color: transparent;
      height: 12px;
      width: 12px;
    }
    *::-webkit-scrollbar-thumb {
      transition: background .2s ease-in-out;
      border: 3px solid transparent;
      -webkit-background-clip: content-box;
      background-clip: content-box;
      --tw-bg-opacity: 1;
      background-color: rgba(229, 231, 235, var(--tw-bg-opacity));
      border-radius: 9999px;
    }
    .dark *::-webkit-scrollbar-thumb {
      --tw-bg-opacity: 1;
      background-color: rgba(50, 50, 50, var(--tw-bg-opacity));
    }
    *::-webkit-scrollbar-thumb:hover {
      --tw-bg-opacity: 1;
      background-color: rgba(209, 213, 219, var(--tw-bg-opacity));
    }
    .dark *::-webkit-scrollbar-thumb:hover {
      --tw-bg-opacity: 1;
      background-color: rgba(60, 60, 60, var(--tw-bg-opacity));
    }
    *::-webkit-scrollbar-corner {
      background-color: transparent;
    }  

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

    // console.log({
    //   css,
    //   fixedCss,
    //   classes,
    //   html,
    // })

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
