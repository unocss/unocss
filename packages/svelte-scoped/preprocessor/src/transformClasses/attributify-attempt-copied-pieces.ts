// Copied here to serve as a starting point if anyone implements attributify mode in the future

// Was added in https://github.com/unocss/unocss/pull/2260 and then reported to not work very well

// Remove script and style blocks from the context so that attributify only looks for candidates only on template
// const templateCode = code
//   .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1\s*>/g, match => Array(match.length).fill(' ').join(''))
// const { matched } = await uno.generate(templateCode, { preflights: false, safelist: false, minify: true })
