import { LitElement, css, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import './my-another-element'
import './my-collision-element'

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
    @unocss-placeholder
  `

  /**
   * The name to say "Hello" to.
   */
  @property()
    name = 'World'

  /**
   * The number of times the button has been clicked.
   */
  @property({ type: Number })
    count = 0

  /**
   * The name to say "Hello" to.
   */
  @property()
    span = false

  render() {
    return html`
      <span class="logo"></span>
      <h1 class="mt-2em animate-jack-in-the-box animate-duration-2s" text-green-600>Hello, ${this.name}!</h1>
      <br />
      ${this.span ? html` <div class="bg-red-400">BG Color should change</div>` : html` <div>BG Color should change</div>`}
      <br />
      <button class="bg-red-100" @click=${this._onClick} part="button">
        Click Count: ${this.count}
      </button>
      <button @click=${this._toggleSpan} part="button">
        Change BG Color:: ${this.span ? 'Normal' : 'Red'}
      </button>
      <my-another-element class="part-[cool-part]:cool-green part-[another-cool-part]:cool-green">Testing css part</my-another-element>
      <my-another-element class="part-[cool-part]:cool-green part-[another-cool-part]:cool-blue">Testing css part</my-another-element>
      <my-another-element class="part-[cool-part]:cool-blue  part-[another-cool-part]:cool-green">Testing css part</my-another-element>
      <my-another-element class="part-[cool-part]:cool-blue  part-[another-cool-part]:cool-blue">Testing css part</my-another-element>
      <my-another-element class="part-[cool-part]:cool-green">Testing css part</my-another-element>
      <my-another-element class="part-[cool-part]:cool-blue">Testing css part</my-another-element>
      <my-another-element class="part-[cool-part]:cool-blue">Testing css part</my-another-element>
      <my-collision-element class="part-[cool-part]:cool-blue">Testing css part</my-collision-element>
      <my-collision-element class="part-[cool-part]:cool-green part-[another-cool-part]:bg-red-500">Testing css part</my-collision-element>
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
