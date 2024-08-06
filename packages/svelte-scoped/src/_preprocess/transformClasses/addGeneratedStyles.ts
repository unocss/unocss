const notInCommentRE = /(?<!<!--\s*)/
const stylesTagWithCapturedDirectivesRE = /<style([^>]*)>[\s\S]*?<\/style\s*>/
const actualStylesTagWithCapturedDirectivesRE = new RegExp(notInCommentRE.source + stylesTagWithCapturedDirectivesRE.source, 'g')

const captureOpeningStyleTagWithAttributesRE = /(<style[^>]*>)/

export function addGeneratedStylesIntoStyleBlock(code: string, styles: string) {
  const preExistingStylesTag = code.match(actualStylesTagWithCapturedDirectivesRE)

  if (preExistingStylesTag)
    return code.replace(captureOpeningStyleTagWithAttributesRE, `$1${styles}`)

  return `${code}\n<style>${styles}</style>`
}
