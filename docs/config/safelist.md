# Safelist

Safelist is an important option in UnoCSS configuration that allows you to specify a set of utility classes that should always be included in the generated CSS, regardless of whether these classes are detected in your source code.

## Basic Usage

### String Array

The simplest usage is to provide a string array containing the class names you want to preserve:

```ts
// uno.config.ts
export default defineConfig({
  safelist: [
    'p-1',
    'p-2',
    'p-3',
    'text-center',
    'bg-red-500'
  ]
})
```

### Function Form

Safelist can also contain functions that are called during build time and can dynamically return class names:

```ts
// uno.config.ts
export default defineConfig({
  safelist: [
    // Static class names
    'p-1',
    'p-2',
    // Dynamic function
    context => ['m-1', 'm-2', 'm-3'],
    (context) => {
      // Generate class names based on theme
      const colors = Object.keys(context.theme.colors || {})
      return colors.map(color => `bg-${color}-500`)
    }
  ]
})
```

### Mixed Usage

You can mix strings and functions in the same safelist configuration:

```ts
// uno.config.ts
export default defineConfig({
  safelist: [
    // Static class names
    'prose',
    'bg-orange-300',
    // Dynamic generation
    () => ['flex', 'grid', 'block'],
    // Conditional dynamic generation
    (context) => {
      if (process.env.NODE_ENV === 'development') {
        return ['debug-border', 'debug-grid']
      }
      return []
    }
  ]
})
```

## Return Value Types

Safelist functions can return the following types of values:

- `Arrayable<string>` - String or string array

```ts
safelist: [
  // Return string array
  () => ['class1', 'class2', 'class3'],

  // Return single string
  () => 'single-class',

  // Return nested array (will be flattened)
  () => [['nested1', 'nested2'], 'normal3']
]
```

## Practical Use Cases

### Dynamically Generated Class Names

When you have dynamically generated class names that might not be detected by static analysis:

```ts
safelist: [
  // Dynamic color classes
  () => {
    const dynamicColors = ['primary', 'secondary', 'accent']
    return dynamicColors.flatMap(color => [
      `bg-${color}`,
      `text-${color}`,
      `border-${color}`
    ])
  },

  // Dynamic size classes
  () => {
    return Array.from({ length: 12 }, (_, i) => `gap-${i + 1}`)
  }
]
```

### Third-party Component Library Support

Provide necessary class names for third-party component libraries:

```ts
safelist: [
  // Reserved class names for component library
  'prose',
  'prose-sm',
  'prose-lg',

  // Dynamically generate component variants
  () => {
    const variants = ['primary', 'secondary', 'danger', 'success']
    const sizes = ['sm', 'md', 'lg']

    return variants.flatMap(variant =>
      sizes.map(size => `btn-${variant}-${size}`)
    )
  }
]
```

## Relationship with Other Configurations

### Difference from blocklist

- **safelist**: Ensures specified class names are always included
- **blocklist**: Ensures specified class names are always excluded

```ts
export default defineConfig({
  safelist: ['always-include'],
  blocklist: ['never-include']
})
```

### Relationship with Generation Options

When generating CSS, you can control whether to include safelist through `GenerateOptions`:

```ts
const { css } = await uno.generate('', {
  safelist: true // Include class names from safelist
})
```
