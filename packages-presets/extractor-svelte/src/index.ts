import type { Extractor } from '@unocss/core'

const rightTrimRe = /=$/
const tagStartRE = /<[a-z][\w:.-]*(?=[\t\n\f\r />])/gi
const whitespaceRE = /[\t\n\f\r ]/
const invalidClassRE = /["'`=<>{}]/
const expressionWordRE = /[\w$]/
const regexPrefixKeywordRE = /^(?:return|throw|case|delete|void|typeof|instanceof|in|of|yield|await|else|do)$/

function skipQuoted(code: string, start: number, escaped = false): number {
  const quote = code[start]
  let i = start + 1
  while (i < code.length) {
    if (!escaped && code[i] === '{')
      i = skipExpression(code, i)
    else if (escaped && code[i] === '\\')
      i += 2
    else if (code[i++] === quote)
      break
  }
  return i
}

function skipExpression(code: string, start: number): number {
  let depth = 1
  let i = start + 1
  let regexAllowed = true
  let afterDot = false
  while (i < code.length && depth) {
    if (/\s/.test(code[i])) {
      i++
      continue
    }
    if (code[i] === '"' || code[i] === '\'' || code[i] === '`') {
      i = skipQuoted(code, i, true)
      regexAllowed = false
      afterDot = false
      continue
    }
    if (code[i] === '/' && code[i + 1] === '/') {
      i += 2
      while (i < code.length && !/[\n\r\u2028\u2029]/.test(code[i]))
        i++
      continue
    }
    if (code[i] === '/' && code[i + 1] === '*') {
      const end = code.indexOf('*/', i + 2)
      i = end === -1 ? code.length : end + 2
      continue
    }
    // A slash following an operand is division, not a regular expression.
    if (code[i] === '/' && regexAllowed) {
      i = skipRegex(code, i)
      regexAllowed = false
      afterDot = false
      continue
    }
    if (expressionWordRE.test(code[i])) {
      const wordStart = i
      while (i < code.length && expressionWordRE.test(code[i]))
        i++
      regexAllowed = regexPrefixKeywordRE.test(code.slice(wordStart, i))
        && !afterDot
      afterDot = false
      continue
    }
    if ((code[i] === '+' || code[i] === '-') && code[i + 1] === code[i]) {
      i += 2
      continue
    }
    if (code[i] === '{')
      depth++
    else if (code[i] === '}')
      depth--
    regexAllowed = !')]}'.includes(code[i]) && code[i] !== '.'
    afterDot = code[i] === '.'
    i++
  }
  return i
}

function skipRegex(code: string, start: number): number {
  let i = start + 1
  let inCharacterClass = false
  while (i < code.length) {
    if (code[i] === '\\') {
      i += 2
      continue
    }
    if (code[i] === '[')
      inCharacterClass = true
    else if (code[i] === ']')
      inCharacterClass = false
    else if (code[i] === '/' && !inCharacterClass)
      return i + 1
    i++
  }
  return i
}

function extractUnquotedClasses(code: string): string[] {
  const classes: string[] = []
  // Keep the scan local to each start tag; quoted values and Svelte expressions
  // can contain both attribute-like text and tag delimiters.
  const tags = new RegExp(tagStartRE)
  while (tags.test(code)) {
    let i = tags.lastIndex
    while (i < code.length && code[i] !== '>') {
      if (whitespaceRE.test(code[i]) || code[i] === '/') {
        i++
        continue
      }
      if (code[i] === '{') {
        i = skipExpression(code, i)
        continue
      }
      const nameStart = i
      while (i < code.length && !whitespaceRE.test(code[i]) && !'/=>'.includes(code[i]))
        i++
      const name = code.slice(nameStart, i)
      while (i < code.length && whitespaceRE.test(code[i]))
        i++
      if (code[i] !== '=')
        continue
      i++
      while (i < code.length && whitespaceRE.test(code[i]))
        i++
      if (code[i] === '"' || code[i] === '\'') {
        i = skipQuoted(code, i)
        continue
      }
      const valueStart = i
      while (i < code.length && !whitespaceRE.test(code[i]) && code[i] !== '>') {
        if (code[i] === '{')
          i = skipExpression(code, i)
        else
          i++
      }
      let value = code.slice(valueStart, i)
      // Svelte's self-closing slash is not part of the attribute value.
      if (code[i] === '>' && value.endsWith('/'))
        value = value.slice(0, -1)
      if (name === 'class' && value && !invalidClassRE.test(value))
        classes.push(value)
    }
    tags.lastIndex = i + 1
  }
  return classes
}

function extractorSvelte(): Extractor {
  return {
    name: 'svelte',
    order: 100,
    extract({ code, id, extracted }) {
      if (id && id.endsWith('.svelte')) {
        const items = Array.from(extracted)
        items.forEach((r) => {
          if (r.startsWith('class:')) {
            extracted.add(r.slice(6).replace(rightTrimRe, ''))
            extracted.delete(r)
          }
        })
        for (const value of extractUnquotedClasses(code))
          extracted.add(value)
      }
    },
  }
}

export default extractorSvelte
