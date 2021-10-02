export const variantMatcher = (name: string) => {
  const length = name.length + 1
  const re = new RegExp(`^${name}[:-]`)
  return (input: string) => input.match(re)
    ? input.slice(length)
    : undefined
}
