import { html, css, LitElement, unsafeCSS } from 'lit'
import { customElement, property } from 'lit/decorators.js'

import unocss from '/@unocss/my-element.css'

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement('my-element')
export class MyElement extends LitElement {
  static styles = css`
    :host {
      display: block;
      border: solid 1px gray;
      padding: 16px;
      max-width: 800px;
    }
    ${unsafeCSS(unocss)}
  `

  /**
   * The name to say "Hello" to.
   */
  @property()
    name = 'World'

  /**
   * The name to say "Hello" to.
   */
  @property()
    span = false

  /**
   * The number of times the button has been clicked.
   */
  @property({ type: Number })
    count = 0

  render() {
    return html`
      <span class="logo"></span>
      <h1 class="mt-6em animate-jack-in-the-box animate-2s" text-green-600>Hello, ${this.name}!</h1>
      <br />
      ${this.span ? html` <div class="bg-red-400">BG Color should change</div>` : html` <div>BG Color should change</div>`}
      <br />
      <button class="bg-red-100" @click=${this._onClick} part="button">
        Click Count: ${this.count}
      </button>
      <button @click=${this._toggleSpan} part="button">
        Change BG Color:: ${this.span ? 'Normal' : 'Red'}
      </button>
      <slot></slot>
    `
  }

  private _onClick() {
    this.count++
  }

  private _toggleSpan() {
    this.span = !this.span
  }

  foo(): string {
    return 'foo'
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'my-element': MyElement
  }
}
