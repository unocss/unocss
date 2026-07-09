import type MagicString from 'magic-string'

const notInCommentRE = /(?<!<!--\s*)/
const stylesTagWithCapturedDirectivesRE = /<style([^>]*)>[\s\S]*?<\/style\s*>/
const actualStylesTagWithCapturedDirectivesRE = new RegExp(notInCommentRE.source + stylesTagWithCapturedDirectivesRE.source, 'g')

const captureOpeningStyleTagWithAttributesRE = /(<style[^>]*>)/

export function addGeneratedStylesIntoStyleBlock(s: MagicString, styles: string) {
  const preExistingStylesTag = s.original.match(actualStylesTagWithCapturedDirectivesRE)

  if (preExistingStylesTag)
    s.replace(captureOpeningStyleTagWithAttributesRE, `$1${styles}`)
  else
    s.append(`\n<style>${styles}</style>`)
}
