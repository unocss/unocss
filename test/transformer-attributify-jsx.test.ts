import MagicString from 'magic-string'
import presetAttributify from '@unocss/preset-attributify'
import presetUno from '@unocss/preset-uno'
import { createGenerator } from '@unocss/core'
import { describe, expect, it } from 'vitest'
import transformerAttributifyJsx from '../packages/transformer-attributify-jsx/src'
import transformerAttributifyJsxBabel from '../packages/transformer-attributify-jsx-babel/src'

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

describe('transformerAttributifyJsx', () => {
  const uno = createGenerator({
    presets: [
      presetUno(),
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
        expect(new RegExp(`${rule.source}=""`).test(codeToString)).not.true
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
})

describe('transformerAttributifyJsxBabel', () => {
  const uno = createGenerator({
    presets: [
      presetUno(),
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
        expect(new RegExp(`${rule.source}=""`).test(codeToString)).not.true
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
