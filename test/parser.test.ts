import { createGenerator } from '@unocss/core'
import presetAttributify from '@unocss/preset-attributify'
import presetUno from '@unocss/preset-uno'
import { expect, it } from 'vitest'

// #3847
it('test: The symbol in the context causes the class to not be generated correctly', async () => {
  const uno = createGenerator({
    presets: [
      presetUno(),
      presetAttributify(),
    ],
  })
  const { css } = await uno.generate(`<script setup>
  const a = 2 < 3 ? 1 :2;
 const b = {a: \`{}\` };
 const c = '-';
 </script>
 <template>
   <div :class="'a-b'" portrait="pt-54">
     <div>{{ true ? \`123\` : '321' }}</div>
   </div>
 </template>`, { preflights: false })
  expect(css).toMatchInlineSnapshot(`
    "/* layer: default */
    .b,
    [b=""]{border-width:1px;}
    .pt-54{padding-top:13.5rem;}
    @media (orientation: portrait){
    [portrait~="pt-54"]{padding-top:13.5rem;}
    }"
  `)
  // with elementRE
  const { css: css1 } = await uno.generate(`<script setup>
  const a = 2 < 3 ? 1 :2;
 const b = {a: \`{}\` };
 const c = '-';
 </script>
 <template>
   <div :class="'a-b'" portrait="pt-54">
     <div w-20px>{{ true ? \`123\` : '321' }}</div>
   </div>
 </template>`, { preflights: false })
  expect(css1).toMatchInlineSnapshot(`
    "/* layer: default */
    [w-20px=""]{width:20px;}
    .b,
    [b=""]{border-width:1px;}
    .pt-54{padding-top:13.5rem;}
    @media (orientation: portrait){
    [portrait~="pt-54"]{padding-top:13.5rem;}
    }"
  `)
})

it('split string with custom separator', async () => {
  const uno = createGenerator({
    presets: [
      presetUno(),
    ],
    separators: ['__'],
  })

  const { css } = await uno.generate('backdrop__shadow-green', { preflights: false })
  expect(css).toMatchSnapshot()
})

it('unable to generate token variant with explicit separator without dash', async () => {
  const uno = createGenerator({
    presets: [
      presetUno(),
    ],
    separators: '-',
  })

  const { css } = await uno.generate('backdrop-shadow-green', { preflights: false })
  expect(css).eql('')
})
