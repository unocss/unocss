const warned = new Set<string>()

export function warnOnce(msg: string) {
  if (warned.has(msg))
    return
  console.warn('[unocss]', msg)
  warned.add(msg)
}
