export const attributifyRE = /^\[(.+)~="(.+)"\]$/

export function isAttributifySelector(selector: string) {
  return selector.match(attributifyRE)
}
