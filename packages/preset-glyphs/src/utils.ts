const isNode = typeof process < 'u' && typeof process.stdout < 'u'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Fontmin = require('fontmin')

export function subsetFont(path: string, glyphs: string) {
  return new Promise<string | undefined>((resolve) => {
    if (!isNode)
      return resolve(undefined)

    const f = new Fontmin().src(path)

    if (path.match(/\.otf$/))
      f.use(Fontmin.otf2ttf())

    f.use(Fontmin.glyph({ text: glyphs }))
      .use(Fontmin.css({ base64: true }))

    f.run((err: any, files: any[]) => {
      if (err)
        return resolve(undefined)
      const fontData = files[1].contents.toString().replace(/^[\s\S]*?;base64,([^)]+)\)[\s\S]*$/, '$1')
      resolve(fontData)
    })
  })
}
