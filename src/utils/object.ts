export function objToCss(obj: any) {
  return `{${objToCssPart(obj)}}`
}

export function objToCssPart(obj: any) {
  return Object.entries(obj)
    .map(([key, value]) => value ? `${key}: ${value};` : undefined)
    .filter(Boolean)
    .join(' ')
}
