export function sampleArray<T>(arr: T[], count: number) {
  return Array.from({ length: count }, _ => arr[Math.round(Math.random() * (arr.length - 1))])
}

export function extractColors(css: string) {
  return Array.from(css.matchAll(/\brgba?\((.+?)\)/g))
    .map((i) => {
      const [r, g, b, a] = i[1].split(',').map(i => parseInt(i.trim()))
      if (Number.isNaN(r))
        return ''
      if (!Number.isNaN(a))
        return `rgba(${r}, ${g}, ${b}, ${a})`
      return `rgb(${r}, ${g}, ${b})`
    })
    .filter(Boolean)
}

let prettier: typeof import('prettier/standalone')['format']
let prettierParserCSS: typeof import('prettier/parser-postcss')

export async function formatCSS(input: string) {
  await Promise.all([
    import('prettier/standalone').then(r => prettier = r.format),
    import('prettier/parser-postcss').then(r => prettierParserCSS = r.default),
  ])
  return prettier(
    input,
    {
      parser: 'css',
      plugins: [prettierParserCSS],
      printWidth: Infinity,
    },
  )
}

