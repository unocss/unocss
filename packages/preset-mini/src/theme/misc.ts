// keep in ASC order: container.ts and breakpoints.ts need that order
export const breakpoints = {
  'sm': '640px',
  'md': '768px',
  'lg': '1024px',
  'xl': '1280px',
  '2xl': '1536px',
}

export const borderRadius = {
  'DEFAULT': '0.25rem',
  'none': '0px',
  'sm': '0.125rem',
  'md': '0.375rem',
  'lg': '0.5rem',
  'xl': '0.75rem',
  '2xl': '1rem',
  '3xl': '1.5rem',
  'full': '9999px',
}

export const boxShadow = {
  'DEFAULT': 'var(--un-shadow-inset) 0 1px 3px 0 rgba(var(--un-shadow-color), var(--un-shadow-opacity, 0.1)), var(--un-shadow-inset) 0 1px 2px -1px rgba(var(--un-shadow-color), var(--un-shadow-opacity, 0.1))',
  'sm': 'var(--un-shadow-inset) 0 1px 2px 0 rgba(var(--un-shadow-color), var(--un-shadow-opacity, 0.05))',
  'md': 'var(--un-shadow-inset) 0 4px 6px -1px rgba(var(--un-shadow-color), var(--un-shadow-opacity, 0.1)), var(--un-shadow-inset) 0 2px 4px -2px rgba(var(--un-shadow-color), var(--un-shadow-opacity, 0.1))',
  'lg': 'var(--un-shadow-inset) 0 10px 15px -3px rgba(var(--un-shadow-color), var(--un-shadow-opacity, 0.1)), var(--un-shadow-inset) 0 4px 6px -4px rgba(var(--un-shadow-color), var(--un-shadow-opacity, 0.1))',
  'xl': 'var(--un-shadow-inset) 0 20px 25px -5px rgba(var(--un-shadow-color), var(--un-shadow-opacity, 0.1)), var(--un-shadow-inset) 0 8px 10px -6px rgba(var(--un-shadow-color), var(--un-shadow-opacity, 0.1))',
  '2xl': 'var(--un-shadow-inset) 0 25px 50px -12px rgba(var(--un-shadow-color), var(--un-shadow-opacity, 0.25))',
  'inner': 'inset 0 2px 4px 0 rgba(var(--un-shadow-color), var(--un-shadow-opacity, 0.05))',
  'none': '0 0 #0000',
}
