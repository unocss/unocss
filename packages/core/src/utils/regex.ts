export const attributifyRE = /^\[(.+?)~?="(.*)"\]$/
export const validateFilterRE = /[a-z]/

export function isAttributifySelector(selector: string) {
  return selector.match(attributifyRE)
}

export function isValidSelector(selector?: string): selector is string {
  return !!(selector && selector.match(validateFilterRE))
}
