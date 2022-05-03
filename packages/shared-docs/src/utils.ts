export function sampleArray<T>(arr: T[], count: number) {
  return Array.from({ length: count }, _ => arr[Math.round(Math.random() * (arr.length - 1))])
}

export function extractColors(css: string) {
  return Array.from(css.matchAll(/\brgba?\((.+?)\)/g))
    .map((i) => {
      const [r, g, b, a] = i[1].split(',').map(i => parseInt(i.trim()))
      if (Number.isNaN(r))
        return ''
      if (!Number.isNaN(a))
        return `rgba(${r}, ${g}, ${b}, ${a})`
      return `rgb(${r}, ${g}, ${b})`
    })
    .filter(Boolean)
}

