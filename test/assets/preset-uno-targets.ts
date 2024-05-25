export const targets = [
  // variants - mix
  'mix-tint-50-c-red-400',
  'mix-shade-50-c-red-400',
  'mix-shift-50-c-red-600',
  'mix-shift--50-c-red-600',

  // custom colors
  'text-custom-a',
  'bg-custom-b',
  'bg-info',
  'bg-info/10',
  'bg-info/[10%]',
  'border-custom-b',
  'border-custom-b/0',
  'border-custom-b/10',
  'bg-custom-c',
  'bg-custom-c/10',
  'bg-custom-d',
  'bg-custom-d/20',
  'bg-custom-e',
  'bg-custom-e/30',
  'bg-custom-f',
  'bg-custom-f/30',
  'bg-custom-f/[var(--f-op)]',

  // wind - placeholder
  'placeholder-red-400',
  'placeholder-inherit',
  'placeholder-opacity-10',
  'placeholder-op90',

  // wind - variants custom media (themed)
  'media-opacity_not_ok:opacity-0',
  'media-touch:p-4',

  // mini + wind - placeholder
  'focus:placeholder-red-300',
  'hover:placeholder-op90',
]

export const targets2 = [
  // mini - variants selector
  'selector-[section]:c-gray-400',
  'selector-[.cls.multi]:c-gray-400',
  'md:selector-[aside]:shadow-xl',
  'dark:selector-[.body\\_main]:bg-white',
  'max-[500px]:bg-red-100',
  'dark:min-[300px]:bg-red-100',
]

export const nonTargets = [
  '--p-2',
  'hi',
  'row-{row.id}',
  'tabs',
  'tab.hello',
  'text-anything',
  'p-anything',
  'rotate-[3]deg',
  'list-none-inside',

  // mini - color utility
  'color-gray-100-prefix/10',
  'color-gray-400-prefix',
  'color-blue-gray-400-prefix',
  'color-true-gray-400-prefix',
  'color-gray-400-500',
  'color-true-gray-400-500',

  // mini - behaviors
  'will-change-all',
  'will-change-none',
  'will-change-margins,padding',
  'will-change-padding,margins',

  // mini - filters
  'brightness',
  'hue-rotate',
  'saturate',
  'backdrop-brightness',
  'backdrop-hue-rotate',
  'backdrop-saturate',

  // mini - ring
  'ring-',

  // mini - shadow
  'shadow-',

  // mini - transition
  'property-colour',
  'property-background-color,colour-300',
  'property-colour-background-color-300',
  'transition-colour',
  'transition-background-color,colour-300',
  'transition-colour,background-color-300',

  // mini - typography
  'tab-',

  // mini - variable
  'tab-$',
  'ws-$',

  // mini - pseudo colon only
  'backdrop-shadow-green',

  // wind - placeholder
  '$-placeholder-red-200',

  // wind - bg-blend
  'bg-blend-plus-lighter', // only added in mix-blend
]
