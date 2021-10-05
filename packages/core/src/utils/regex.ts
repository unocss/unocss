export const attributifyRE = /^\[(.+?)~?="(.*)"\]$/
export const validateFilterRE = /[a-z]/

export function isAttributifySelector(selector: string) {
  return selector.match(attributifyRE)
}

export function isValidSelector(selector = ''): selector is string {
  return validateFilterRE.test(selector)
}
