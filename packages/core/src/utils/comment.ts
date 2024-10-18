const COMMENT_REG = /^\s*(<!--.*?-->|\/\/.*)/gm
export function skipComment(str: string) {
  return str.replace(COMMENT_REG, '')
}
