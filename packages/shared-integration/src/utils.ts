export function getPath(id: string) {
  return id.replace(/\?.*$/, '')
}
