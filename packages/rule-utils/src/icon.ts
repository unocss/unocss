// eslint-disable-next-line regexp/no-super-linear-backtracking, regexp/no-potentially-useless-backreference
export const iconFnRE = /icon\(\s*(['"])?(.*?)\1?\s*\)/g

export function hasIconFn(str: string) {
  return str.includes('icon(') && str.includes(')')
}
