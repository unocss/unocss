import { createGenerator } from '@unocss/core'
import presetAttributify from '@unocss/preset-attributify'
import presetWind3 from '@unocss/preset-wind3'
import transformerAttributifyJsx from '@unocss/transformer-attributify-jsx'
import transformerAttributifyJsxBabel from '@unocss/transformer-attributify-jsx-babel'
import MagicString from 'magic-string'
import { describe, expect, it } from 'vitest'

const originalCode = `
<div h-full text-center flex select-none className={red ? 'text-red': 'text-green'}>
  <input value={ target ? '10px' : '20px'} style={{ height: '100px' }} />
  <div ma>
    <div text-5xl fw100 animate-bounce-alt animate-count-infinite animate-duration-1s key={index}>
      unocss
    </div>
    <div op30 text-lg fw300 m1 className={hidden && 'op0'}>
      The instant on-demand Atomic CSS engine.
    </div>
    <div m2 flex justify-center text-2xl op30 hover:op80 hover:text-2xl>
      <a
        i-carbon-logo-github
        text-inherit
        href="https://github.com/unocss/unocss"
        target="_blank"
      ></a>
      <router-link to={\`/path/\${1}\`}/>
    </div>
  </div>
  <section
    className={cn({ 'c-red': variable > 0 }, 'mr-10')}
    mr-10
    className={cn({ 'c-red': variable > 0 }, 'mr-10')}
  ></section>
  <div
    label={
      <b>1</b>
    }
  ></div>
  <div absolute bottom-5 right-0 left-0 text-center op30 fw300>
    on-demand · instant · fully customizable
  </div>
  <div components={<div absolute bottom-5></div>}></div>
  <div components={() => <div left-0 bottom-5>
    <div text-center> flex </div>
  </div>}></div>
  <h1 flex>h1</h1>
  <div {...{ flex }} />
  <div {...{ onClick: () => { grid(); flex } }} flex />
  <div {...true ? flex : props.grid } {...grid || ( block ) && $flex } />  
  <div {...[, flex, [flex], !flex, -flex, +flex, ~flex, "flex", \`flex\` ] } />  
</div>
  `.trim()

const tagCouldBeAttrCode = `
<div>
  <b text-red>Test</b>
  <h1 text-red>Test</h1>
  <h2 text-red>Test</h2>
  <h3 text-red>Test</h3>
  <h4 text-red>Test</h4>
  <h5 text-red>Test</h5>
  <h6 text-red>Test</h6>
</div>
`.trim()

describe('transformerAttributifyJsx', async () => {
  const uno = await createGenerator({
    presets: [
      presetWind3(),
      presetAttributify(),
    ],
  })

  it('transform test1', async () => {
    const code = new MagicString(originalCode)
    await transformerAttributifyJsx().transform(code, 'app.tsx', { uno, tokens: new Set() } as any)

    expect(code.toString()).toMatchInlineSnapshot(`
      "<div h-full="" text-center="" flex="" select-none="" className={red ? 'text-red': 'text-green'}>
        <input value={ target ? '10px' : '20px'} style={{ height: '100px' }} />
        <div ma="">
          <div text-5xl="" fw100="" animate-bounce-alt="" animate-count-infinite="" animate-duration-1s="" key={index}>
            unocss
          </div>
          <div op30="" text-lg="" fw300="" m1="" className={hidden && 'op0'}>
            The instant on-demand Atomic CSS engine.
          </div>
          <div m2="" flex="" justify-center="" text-2xl="" op30="" hover-op80="" hover-text-2xl="">
            <a
              i-carbon-logo-github
              text-inherit=""
              href="https://github.com/unocss/unocss"
              target="_blank"
            ></a>
            <router-link to={\`/path/\${1}\`}/>
          </div>
        </div>
        <section
          className={cn({ 'c-red': variable > 0 }, 'mr-10')}
          mr-10=""
          className={cn({ 'c-red': variable > 0 }, 'mr-10')}
        ></section>
        <div
          label={
            <b>1</b>
          }
        ></div>
        <div absolute="" bottom-5="" right-0="" left-0="" text-center="" op30="" fw300="">
          on-demand · instant · fully customizable
        </div>
        <div components={<div absolute="" bottom-5=""></div>}></div>
        <div components={() => <div left-0="" bottom-5="">
          <div text-center=""> flex </div>
        </div>}></div>
        <h1 flex="">h1</h1>
        <div {...{ flex }} />
        <div {...{ onClick: () => { grid(); flex } }} flex="" />
        <div {...true ? flex : props.grid } {...grid || ( block ) && $flex } />  
        <div {...[, flex, [flex], !flex, -flex, +flex, ~flex, "flex", \`flex\` ] } />  
      </div>"
    `)
  })
  // #3754
  it('transform test2', async () => {
    const code = new MagicString(`
    const App: React.FC = () => {
      return (
        <div w-full h-full bg-gray-300
        >
          <div>123</div>
        </div>
      )
    }
    export default App
    `)
    await transformerAttributifyJsx().transform(code, 'app.tsx', { uno, tokens: new Set() } as any)

    expect(code.toString()).toMatchInlineSnapshot(`
      "
          const App: React.FC = () => {
            return (
              <div w-full="" h-full="" bg-gray-300=""
              >
                <div>123</div>
              </div>
            )
          }
          export default App
          "
    `)
  })

  it('blocklist', async () => {
    const code = new MagicString(originalCode)
    const blocklist: (string | RegExp)[] = ['flex', 'absolute']

    await transformerAttributifyJsx({
      blocklist,
    }).transform(code, 'app.jsx', { uno, tokens: new Set() } as any)

    expect(code.toString()).toMatchInlineSnapshot(`
      "<div h-full="" text-center="" flex select-none="" className={red ? 'text-red': 'text-green'}>
        <input value={ target ? '10px' : '20px'} style={{ height: '100px' }} />
        <div ma="">
          <div text-5xl="" fw100="" animate-bounce-alt="" animate-count-infinite="" animate-duration-1s="" key={index}>
            unocss
          </div>
          <div op30="" text-lg="" fw300="" m1="" className={hidden && 'op0'}>
            The instant on-demand Atomic CSS engine.
          </div>
          <div m2="" flex justify-center="" text-2xl="" op30="" hover-op80="" hover-text-2xl="">
            <a
              i-carbon-logo-github
              text-inherit=""
              href="https://github.com/unocss/unocss"
              target="_blank"
            ></a>
            <router-link to={\`/path/\${1}\`}/>
          </div>
        </div>
        <section
          className={cn({ 'c-red': variable > 0 }, 'mr-10')}
          mr-10=""
          className={cn({ 'c-red': variable > 0 }, 'mr-10')}
        ></section>
        <div
          label={
            <b>1</b>
          }
        ></div>
        <div absolute bottom-5="" right-0="" left-0="" text-center="" op30="" fw300="">
          on-demand · instant · fully customizable
        </div>
        <div components={<div absolute bottom-5=""></div>}></div>
        <div components={() => <div left-0="" bottom-5="">
          <div text-center=""> flex </div>
        </div>}></div>
        <h1 flex>h1</h1>
        <div {...{ flex }} />
        <div {...{ onClick: () => { grid(); flex } }} flex />
        <div {...true ? flex : props.grid } {...grid || ( block ) && $flex } />  
        <div {...[, flex, [flex], !flex, -flex, +flex, ~flex, "flex", \`flex\` ] } />  
      </div>"
    `)

    const codeToString = code.toString()
    blocklist.forEach((rule) => {
      if (rule instanceof RegExp)
        expect(new RegExp(`${rule.source}=""`).test(codeToString)).not.toBe(true)
      else
        expect(codeToString).not.toMatch(`${rule}=""`)
    })
  })

  it('if class-like tag do not cause error', async () => {
    const code = new MagicString(tagCouldBeAttrCode)
    await transformerAttributifyJsx().transform(code, 'app.tsx', { uno, tokens: new Set() } as any)

    expect(code.toString()).toMatchInlineSnapshot(`
      "<div>
        <b text-red="">Test</b>
        <h1 text-red="">Test</h1>
        <h2 text-red="">Test</h2>
        <h3 text-red="">Test</h3>
        <h4 text-red="">Test</h4>
        <h5 text-red="">Test</h5>
        <h6 text-red="">Test</h6>
      </div>"
    `)
  })
  // #3923
  it('svg test', async () => {
    const svg = `<Icon
        component={() => (
          <svg class="icon"
            viewBox="0 0 1024 1024"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            p-id="1519"
            width="50"
            height="50"
          >
            <path
              d="M213.48 64.22h597.04c99.5 0 149.26 49.75 149.26 149.26v597.04c0 99.5-49.75 149.26-149.26 149.26H213.48c-99.51 0-149.26-49.75-149.26-149.26V213.48c0-99.5 49.76-149.26 149.26-149.26z m0 0"
              fill="#2c9ef4"
              opacity=".3"
              p-id="1520"
            ></path>
            <path
              d="M644.9 667.47H379.1c-11.12 0-20.14 9.01-20.14 20.14 0 11.12 9.02 20.14 20.14 20.14h265.81c11.12 0 20.14-9.01 20.14-20.14 0-11.12-9.02-20.14-20.15-20.14zM705.32 316.25H318.69c-17.79 0-32.22 14.42-32.22 32.22v257.72c0 8.55 3.39 16.74 9.44 22.78a32.231 32.231 0 0 0 22.78 9.44h386.63c8.54 0 16.74-3.39 22.78-9.44a32.231 32.231 0 0 0 9.44-22.78V348.47c-0.01-17.79-14.43-32.21-32.22-32.22zM654.4 445.04l-88.75 88.75c-6.29 5-15.2 5-21.49 0l-75.22-75.22-75.22 75.22c-6.88 4.99-16.36 4.25-22.37-1.76a17.268 17.268 0 0 1-1.76-22.37l88.75-88.75a16.79 16.79 0 0 1 21.19 0l75.36 75.36 75.37-75.36c6.87-5 16.36-4.25 22.37 1.76 6.01 6.01 6.76 15.5 1.77 22.37z"
              fill="#2c9ef4"
              p-id="1521"
            ></path>
          </svg>
        )}
      />`
    const code = new MagicString(svg)
    await transformerAttributifyJsx().transform(code, 'app.tsx', { uno, tokens: new Set() } as any)

    expect(code.toString()).toMatchInlineSnapshot(`
      "<Icon
              component={() => (
                <svg class="icon"
                  viewBox="0 0 1024 1024"
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  p-id="1519"
                  width="50"
                  height="50"
                >
                  <path
                    d="M213.48 64.22h597.04c99.5 0 149.26 49.75 149.26 149.26v597.04c0 99.5-49.75 149.26-149.26 149.26H213.48c-99.51 0-149.26-49.75-149.26-149.26V213.48c0-99.5 49.76-149.26 149.26-149.26z m0 0"
                    fill="#2c9ef4"
                    opacity=".3"
                    p-id="1520"
                  ></path>
                  <path
                    d="M644.9 667.47H379.1c-11.12 0-20.14 9.01-20.14 20.14 0 11.12 9.02 20.14 20.14 20.14h265.81c11.12 0 20.14-9.01 20.14-20.14 0-11.12-9.02-20.14-20.15-20.14zM705.32 316.25H318.69c-17.79 0-32.22 14.42-32.22 32.22v257.72c0 8.55 3.39 16.74 9.44 22.78a32.231 32.231 0 0 0 22.78 9.44h386.63c8.54 0 16.74-3.39 22.78-9.44a32.231 32.231 0 0 0 9.44-22.78V348.47c-0.01-17.79-14.43-32.21-32.22-32.22zM654.4 445.04l-88.75 88.75c-6.29 5-15.2 5-21.49 0l-75.22-75.22-75.22 75.22c-6.88 4.99-16.36 4.25-22.37-1.76a17.268 17.268 0 0 1-1.76-22.37l88.75-88.75a16.79 16.79 0 0 1 21.19 0l75.36 75.36 75.37-75.36c6.87-5 16.36-4.25 22.37 1.76 6.01 6.01 6.76 15.5 1.77 22.37z"
                    fill="#2c9ef4"
                    p-id="1521"
                  ></path>
                </svg>
              )}
            />"
    `)
  })
})

describe('transformerAttributifyJsxBabel', async () => {
  const uno = await createGenerator({
    presets: [
      presetWind3(),
      presetAttributify(),
    ],
  })

  it('transform', async () => {
    const code = new MagicString(originalCode)
    await transformerAttributifyJsxBabel().transform(code, 'app.tsx', { uno, tokens: new Set() } as any)

    expect(code.toString()).toMatchInlineSnapshot(`
      "<div h-full="" text-center="" flex="" select-none="" className={red ? 'text-red' : 'text-green'}>
        <input value={target ? '10px' : '20px'} style={{
          height: '100px'
        }} />
        <div ma="">
          <div text-5xl="" fw100="" animate-bounce-alt="" animate-count-infinite="" animate-duration-1s="" key={index}>
            unocss
          </div>
          <div op30="" text-lg="" fw300="" m1="" className={hidden && 'op0'}>
            The instant on-demand Atomic CSS engine.
          </div>
          <div m2="" flex="" justify-center="" text-2xl="" op30="" hover:op80="" hover:text-2xl="">
            <a i-carbon-logo-github text-inherit="" href="https://github.com/unocss/unocss" target="_blank"></a>
            <router-link to={\`/path/\${1}\`} />
          </div>
        </div>
        <section className={cn({
          'c-red': variable > 0
        }, 'mr-10')} mr-10="" className={cn({
          'c-red': variable > 0
        }, 'mr-10')}></section>
        <div label={<b>1</b>}></div>
        <div absolute="" bottom-5="" right-0="" left-0="" text-center="" op30="" fw300="">
          on-demand · instant · fully customizable
        </div>
        <div components={<div absolute="" bottom-5=""></div>}></div>
        <div components={() => <div left-0="" bottom-5="">
          <div text-center=""> flex </div>
        </div>}></div>
        <h1 flex="">h1</h1>
        <div {...{
          flex
        }} />
        <div {...{
          onClick: () => {
            grid();
            flex;
          }
        }} flex="" />
        <div {...true ? flex : props.grid} {...grid || block && $flex} />  
        <div {...[, flex, [flex], !flex, -flex, +flex, ~flex, "flex", \`flex\`]} />  
      </div>;"
    `)
  })

  it('blocklist', async () => {
    const code = new MagicString(originalCode)
    const blocklist: (string | RegExp)[] = ['flex', 'absolute']

    await transformerAttributifyJsxBabel({
      blocklist,
    }).transform(code, 'app.jsx', { uno, tokens: new Set() } as any)

    expect(code.toString()).toMatchInlineSnapshot(`
      "<div h-full="" text-center="" flex select-none="" className={red ? 'text-red' : 'text-green'}>
        <input value={target ? '10px' : '20px'} style={{
          height: '100px'
        }} />
        <div ma="">
          <div text-5xl="" fw100="" animate-bounce-alt="" animate-count-infinite="" animate-duration-1s="" key={index}>
            unocss
          </div>
          <div op30="" text-lg="" fw300="" m1="" className={hidden && 'op0'}>
            The instant on-demand Atomic CSS engine.
          </div>
          <div m2="" flex justify-center="" text-2xl="" op30="" hover:op80="" hover:text-2xl="">
            <a i-carbon-logo-github text-inherit="" href="https://github.com/unocss/unocss" target="_blank"></a>
            <router-link to={\`/path/\${1}\`} />
          </div>
        </div>
        <section className={cn({
          'c-red': variable > 0
        }, 'mr-10')} mr-10="" className={cn({
          'c-red': variable > 0
        }, 'mr-10')}></section>
        <div label={<b>1</b>}></div>
        <div absolute bottom-5="" right-0="" left-0="" text-center="" op30="" fw300="">
          on-demand · instant · fully customizable
        </div>
        <div components={<div absolute bottom-5=""></div>}></div>
        <div components={() => <div left-0="" bottom-5="">
          <div text-center=""> flex </div>
        </div>}></div>
        <h1 flex>h1</h1>
        <div {...{
          flex
        }} />
        <div {...{
          onClick: () => {
            grid();
            flex;
          }
        }} flex />
        <div {...true ? flex : props.grid} {...grid || block && $flex} />  
        <div {...[, flex, [flex], !flex, -flex, +flex, ~flex, "flex", \`flex\`]} />  
      </div>;"
    `)

    const codeToString = code.toString()
    blocklist.forEach((rule) => {
      if (rule instanceof RegExp)
        expect(new RegExp(`${rule.source}=""`).test(codeToString)).not.toBe(true)
      else
        expect(codeToString).not.toMatch(`${rule}=""`)
    })
  })

  it('if class-like tag do not cause error', async () => {
    const code = new MagicString(tagCouldBeAttrCode)
    await transformerAttributifyJsx().transform(code, 'app.tsx', { uno, tokens: new Set() } as any)

    expect(code.toString()).toMatchInlineSnapshot(`
      "<div>
        <b text-red="">Test</b>
        <h1 text-red="">Test</h1>
        <h2 text-red="">Test</h2>
        <h3 text-red="">Test</h3>
        <h4 text-red="">Test</h4>
        <h5 text-red="">Test</h5>
        <h6 text-red="">Test</h6>
      </div>"
    `)
  })

  it('with default prefix attributify', async () => {
    const code = new MagicString(`<div un-hidden un-text-red></div>`)
    await transformerAttributifyJsx().transform(code, 'app.tsx', { uno, tokens: new Set() } as any)

    expect(code.toString()).toMatchInlineSnapshot(`"<div un-hidden="" un-text-red=""></div>"`)
  })
})
