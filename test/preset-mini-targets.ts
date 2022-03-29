export const presetMiniTargets: string[] = [
  // align
  'vertical-baseline',
  'vertical-super',
  'align-text-bottom',
  'v-top',
  'v-mid',
  'text-left',

  // behaviors
  'outline-none',
  'outline',
  'outline-size-none',
  'outline-hidden',
  'outline-gray',
  'outline-gray-400',
  'outline-size-4',
  'outline-width-4',
  'outline-offset-4',
  'outline-offset-none',
  'outline-unset',
  'outline-solid',
  'outline-color-red-1',
  'outline-width-10px',
  'outline-inset',
  'outline-110',
  'outline-blue-2',
  'outline-[var(--red)]',
  'outline-size-[var(--width)]',
  'outline-offset-[var(--offset)]',
  'appearance-none',
  'will-change-margin,padding',
  'will-change-padding,margin',
  'will-change-transform',
  'will-change-unset',
  'will-change-auto',
  'will-change-scroll',
  'will-change-contents',

  // border
  'b-2',
  'border',
  'border-double',
  'border-none',
  'border-size-none',
  'border-4',
  'border-b',
  'border-x',
  'border-t-2',
  'border-be',
  'border-inline',
  'border-bs-2',
  'border-size-2',
  'border-x-size-2',
  'border-t-size-2',
  'border-width-3',
  'border-x-width-3',
  'border-t-width-3',
  'rounded-[4px]',
  'rounded-1/2',
  'rounded-full',
  'rounded-md',
  'rounded-rb-1/2',
  'rounded-t-sm',
  'rounded-tr',
  'rounded-ie-be-1/2',
  'rounded-bs-sm',
  'rounded-bs-ie',
  'rounded',
  'rounded-none',
  'border-rounded',

  // border - color
  'border-[#124]',
  'border-[2em]',
  'border-[calc(1em-1px)]',
  'border-black/10',
  'border-blue',
  'border-red-100',
  'border-red-200/10',
  'border-red-300/20',
  'border-red100',
  'border-red2',
  'border-[var(--color)]',
  'border-green-100/20',
  'border-opacity-20',
  'border-y-red',
  'border-y-op-30',
  'border-x-[rgb(1,2,3)]/[0.5]',
  'border-t-[#124]',
  'border-t-black/10',
  'border-b-blue',
  'border-b-op40',
  'border-s-red-100',
  'border-s-opacity50',
  'border-e-red-200/10',
  'border-e-red-300/[20]',

  // color, op
  'c-[#157]',
  'c-[#157]/10',
  'c-[#2573]',
  'c-[#2573]/10',
  'c-[#335577]',
  'c-[#335577]/10',
  'c-[#44557733]',
  'c-[#44557733]/10',
  'c-#157',
  'c-#157/10',
  'c-#2573',
  'c-#2573/10',
  'c-#335577',
  'c-#335577/10',
  'c-#44557733',
  'c-#44557733/10',
  'c-hex-157',
  'c-hex-157/10',
  'c-hex-2573',
  'c-hex-2573/10',
  'c-hex-335577',
  'c-hex-335577/10',
  'c-hex-44557733',
  'c-hex-44557733/10',
  'c-[#157]/$opacity-variable',
  'c-[#2573]/$opacity-variable',
  'c-[#335577]/$opacity-variable',
  'c-[#44557733]/$opacity-variable',
  'c-$color-variable',
  'c-$color-variable/10',
  'c-$color-variable/$opacity-variable',
  'op-10',
  'opacity-0',
  'opacity-$opa',
  'color-blue',
  'color-blue-400',
  'color-blue-400/10',
  'color-blue/10',
  'color-blue-gray',
  'color-blue-gray-400',
  'color-bluegray',
  'color-bluegray-400',
  'color-blue-gray-400/10',
  'color-blue-gray/10',
  'color-bluegray-400/10',
  'color-bluegray/10',
  'text-black/10',
  'text-rose',
  'text-red-100',
  'text-red-200/10',
  'text-red-300/20',
  'text-red100',
  'text-red2',
  'text-opacity-[13.3333333%]',
  'text-[var(--color)]',
  'text-[#124]',
  'text-[2em]',
  'text-[calc(1em-1px)]',
  'text-[length:var(--size)]',
  'text-[length:2em]',
  'text-[length:calc(1em-1px)]',
  'text-[color:var(--color)]',
  'text-[color:var(--color-x)]:[trick]',

  // color - bg
  'bg-[#153]/10',
  'bg-[#1533]',
  'bg-[#1533]/10',
  'bg-[rgba(1,2,3,0.5)]',
  'bg-#452233/40',
  'bg-red-100',
  'bg-teal-100/55',
  'bg-teal-200:55',
  'bg-teal-300:[.55]',
  'bg-teal-400/[.55]',
  'bg-teal-500/[55%]',
  'bg-hex-452233/40',
  'bg-opacity-45',

  // color - ring
  'ring-red2',
  'ring-red2/5',
  'ring-px',
  'ring-width-px',
  'ring-size-px',
  'ring-op-5',
  'ring-offset-red2',
  'ring-offset-red2/5',
  'ring-offset-op-5',

  // decoration
  'decoration-none',
  'decoration-size-none',
  'decoration-transparent',
  'decoration-purple/50',
  'decoration-5',
  'decoration-offset-0.6rem',
  'decoration-offset-none',
  'decoration-underline',
  'underline',
  'underline-dashed',
  'underline-red-500',
  'underline-op80',
  'underline-auto',
  'underline-5',
  'underline-1rem',
  'underline-offset-auto',
  'underline-offset-4',
  'underline-offset-0.6rem',

  // flex, gap
  'flex-[hi]',
  'flex-[1_0_100%]',
  'flex-[0_0_auto]',
  'flex-[1_1_1/2]',
  'flex-[1_auto]',
  'flex-[fit-content]',
  'flex',
  'flex-row',
  'flex-col-reverse',
  'flex-shrink',
  'flex-shrink-0',
  'flex-grow',
  'flex-grow-0',
  'flex-basis-0',
  'flex-basis-1/2',
  'flex-$variable',
  'flex-[$variable1_$variable2_$variable3]',
  'shrink',
  'shrink-0',
  'grow',
  'grow-0',
  'basis-auto',
  'basis-none',
  'gap-none',
  'gap-4',
  'gap-x-1',
  'gap2',
  'flex-gap-y-1',
  'grid-gap-y-1',

  // grid
  'grid-cols-$1',
  'grid-cols-[1fr_2fr_100px_min-content]',
  'grid-cols-2',
  'grid-cols-[repeat(3,auto)]',
  'grid-rows-[1fr_2fr_100px_min-content]',
  'grid-rows-3',
  'grid',
  'auto-rows-min',
  'auto-rows-fr',
  'row-auto',
  'row-span-[hi]',
  'row-[span_1/span_2]',
  'auto-cols-auto',
  'auto-rows-auto',
  'col-span-1',
  'row-span-full',
  'row-end-1',
  'row-start-full',
  'auto-flow-col-dense',
  'grid-cols-minmax-1rem',
  'grid-rows-minmax-100px',

  // layout
  'of-y-visible',
  'overflow-auto',
  'overflow-x-scroll',
  'overflow-y-clip',

  // position
  'static',
  'relative',
  'absolute',
  'pos-fixed',
  'position-sticky',
  'justify-start',
  'justify-center',
  'justify-items-end',
  'justify-self-stretch',
  'order-first',
  'order-none',
  'content-start',
  'content-center',
  'items-end',
  'self-stretch',
  'place-content-stretch',
  'place-items-stretch',
  'place-self-stretch',

  // position - insets
  'top-0',
  'top-$top-height',
  'inset-none',
  'inset-x-5',
  'inset-y-5',
  'inset-t-5',
  'inset-b-5',
  'inset-e-5',
  'inset-bs-5',
  'inset-ie-5',
  'inset-0',
  'inset-5',
  'inset-[5px]',
  'inset-inline-5',
  'inset-block-5',

  // position - others
  'float-left',
  'float-none',
  'clear-both',
  'clear-none',
  'z0',
  'z-0',
  'z-1',
  'z-100',
  'z-auto',
  'box-content',
  'box-border',

  // ring, shadow
  'ring',
  'ring-10',
  'ring-none',
  'ring-offset',
  'ring-offset-none',
  'ring-offset-4',
  'ring-offset-green5',
  'ring-inset',
  'shadow',
  'shadow-transparent',
  'shadow-current',
  'shadow-none',
  'shadow-xl',
  'shadow-green-500',
  'shadow-green-900/50',
  'shadow-op-50',
  'shadow-inset',

  // size
  'h-auto',
  'h-1',
  'h-1.000%',
  'h-1.001%',
  'h-1.010%',
  'h-1.100%',
  'h20',
  'h1/100',
  'h-21',
  'h-1/2',
  'h-2/2',
  'h-3/2',
  'h-1/3',
  'h-2/3',
  'h-1/4',
  'h-2/4',
  'h-3/4',
  'h-1/5',
  'h-1/6',
  'h-2/6',
  'h-3/6',
  'h-4/6',
  'h-5/6',
  'h-6/7',
  'h-8/7',
  'h-lg',
  'w-none',
  'w-auto',
  'w-1',
  'w-21',
  'w-1/4',
  'w-lg',
  'h-screen-sm',
  'h-screen-lg',
  'max-h-[1px]',
  'max-w-none',
  'max-w-20',
  'max-w-lg',
  'max-w-full',
  'max-w-$var',
  'max-w-screen-lg',
  'min-h-[1px]',
  'min-w-none',
  'min-w-20',
  'min-w-lg',
  'min-w-full',
  'min-w-$var',
  'min-w-screen-lg',
  'h-$var',
  'h-[calc(1000px-4rem)]',
  'w-[calc(calc(100px*10)-4rem)]',

  // size - logical
  'block-auto',
  'block-1',
  'block-21',
  'block-1/2',
  'block-8/7',
  'block-lg',
  'inline-auto',
  'inline-1',
  'inline-21',
  'inline-1/4',
  'inline-lg',
  'max-block-[1px]',
  'max-inline-none',
  'max-inline-20',
  'max-inline-lg',
  'max-inline-full',
  'max-inline-$var',
  'min-block-[1px]',
  'min-inline-none',
  'min-inline-20',
  'min-inline-lg',
  'min-inline-full',
  'min-inline-$var',
  'block-$var',
  'block-[calc(1000px-4rem)]',
  'inline-[calc(calc(100px*10)-4rem)]',

  // size - ar
  'aspect-ratio-square',
  'aspect-ratio-video',
  'aspect-auto',
  'aspect-ratio-3/2',
  'aspect-ratio-0.7',
  'aspect-ratio-$var',
  'aspect-ratio-[auto_16/9]',
  'aspect-[auto_16/9]',

  // spacing
  'p-none',
  'p-2',
  'p-t-2',
  'p2',
  'pl-10px',
  'pt-2',
  'pt2',
  'pt-$title2',
  'pa',
  'm-[3em]',
  'm-0',
  'm-1/2',
  'm-auto',
  'mt-[-10.2%]',
  'mt-$height',
  'my-auto',
  'm-none',

  // spacing - logical
  'p-ie-none',
  'p-bs-2',
  'pis-10px',
  'pbs-2',
  'pbs2',
  'pbs-$title2',
  'mbs-[-10.2%]',
  'mbs-$height',
  'm-block-auto',
  'm-inline-none',

  // spacing - default
  'p',
  'pb',
  'px',
  'p-x',
  'pxy',
  'p-xy',
  'pis',
  'p-is',
  'm-block',
  'mbs',
  'mxy',
  'm-xy',

  // static
  'contents',
  'backface-hidden',
  'cursor-pointer',
  'cursor-$pointer-var',
  'cursor-[url(cursor_2.png)_2_2,_pointer]',
  'pointer-events-none',
  'pointer-events-auto',
  'resize',
  'resize-none',
  'select-all',
  'select-none',
  'whitespace-pre-wrap',
  'ws-nowrap',
  'content-empty',
  'content-none',
  'content-[unocss]',
  'content-[attr(dashed-attr)]',
  'break-normal',
  'break-words',
  'text-clip',
  'case-upper', // !
  'case-normal', // !
  'italic',
  'antialiased',

  // svg
  'fill-none',
  'fill-current',
  'fill-green-400',
  'fill-opacity-80',
  'fill-[#123]',
  'fill-[1rem]',
  'stroke-none',
  'stroke-current',
  'stroke-green-400',
  'stroke-opacity-80',
  'stroke-[#123]',
  'stroke-[1rem]',
  'stroke-size-none',
  'stroke-size-1',
  'stroke-size-1px',
  'stroke-size-[1rem]',
  'stroke-size-$variable',
  'stroke-width-1',
  'stroke-width-1px',
  'stroke-width-[1rem]',
  'stroke-width-$variable',
  'stroke-dash-1',
  'stroke-dash-[5,3,2]',
  'stroke-offset-1',
  'stroke-offset-1px',
  'stroke-offset-[1rem]',
  'stroke-offset-none',
  'stroke-cap-round',
  'stroke-cap-auto',
  'stroke-join-clip',
  'stroke-join-auto',

  // transforms
  'transform',
  'transform-gpu',
  'transform-cpu',
  'transform-none',
  'translate-none',
  'translate-y-1/4',
  'translate-y-px',
  'translate-full',
  'translate-x-full',
  'rotate-1deg',
  'rotate-[var(--spin)]',
  'rotate-x-1deg',
  'rotate-y-1',
  'transform-rotate-y-1',
  'transform-rotate-z-[var(--spin)]',
  'rotate-z-[var(--spin)]',
  'skew-x-10',
  'skew-x-10deg',
  'skew-x-10.00deg',
  'skew-x-10.01deg',
  'skew-x-10.10deg',
  'skew-x-10.11deg',
  'skew-x-[var(--skew-x)]',
  'skew-y-10',
  'skew-y-10deg',
  'skew-y-[var(--skew-y)]',
  'skew-y-0.5turn',
  'skew-y-2grad',
  'skew-y-3.14rad',
  'preserve-3d',
  'preserve-flat',
  'origin-top-left',
  'perspect-100',
  'perspect-800px',
  'perspect-23rem',
  'perspect-origin-center',
  'perspect-origin-top-right',
  'perspect-origin-[150%]',
  'perspect-origin-[150%_150%]',

  // transition
  'transition-none',
  'transition-delay-300',
  'transition-duration-300',
  'transition-property-width',
  'transition-property-all',
  'transition-200',
  'transition-opacity-200',
  'transition-color,background-color-200',
  'transition-background-color,color-200',
  'transition',
  'property-none',
  'property-all',
  'property-unset',
  'property-margin,padding',
  'property-padding,margin',
  'duration-111',

  // transition - timings
  'ease-linear',
  'ease-out',
  'transition-ease-in',

  // typography
  'font-mono',
  'text-4xl',
  'text-base',
  'text-lg',
  'text-2em',
  'text-size-[2em]',
  'font-thin',
  'font-900',
  'font-050',
  'font-50',
  'font-inherit',
  'fw-900',
  'fw-050',
  'fw-50',
  'font-italic',
  'leading-2',
  'leading-inherit',
  'font-leading-2',
  'lh-[1.5]',
  'tracking-wide',
  'tracking-[2/5]',
  'tracking-inherit',
  'font-tracking-1em',
  'word-spacing-1',
  'word-spacing-wide',
  'word-spacing-2',
  'word-spacing-inherit',
  'tab',
  'tab-6',
  'tab-inherit',
  'indent',
  'indent-1/2',
  'indent-lg',
  'indent-unset',
  'text-stroke-6',
  'text-stroke-sm',
  'text-stroke-blue-500',
  'text-stroke-op-60',
  'text-shadow',
  'text-shadow-lg',
  'text-shadow-none',
  'text-shadow-$var',
  'text-shadow-color-red-300',
  'text-shadow-color-op-30',

  // variables
  'bg-$test-variable',
  'border-$color',
  'border-t-$color',
  'border-x-$color',
  'color-$red',
  'items-$size',
  'tab-$tabprop',
  'outline-$variable',
  'outline-width-$variable',
  'outline-size-$variable',
  'outline-offset-$variable',
  'border-size-$variable',
  'border-width-$variable',
  'border-s-width-$variable',
  'b-block-size-$variable',
  'rounded-$variable',
  'flex-basis-$variable',
  'gap-$variable',
  'grid-row-$variable',
  'grid-col-$variable',
  'grid-auto-rows-$variable',
  'grid-auto-cols-$variable',
  'order-$variable',
  'inset-$variable',
  'inset-s-$variable',
  'inset-inline-$variable',
  'z-$variable',
  'ring-offset-$variable',
  'ring-offset-width-$variable',
  'ring-offset-size-$variable',
  'stroke-dash-$variable',
  'stroke-offset-$variable',
  'perspect-$variable',
  'perspect-origin-$variable',
  'translate-x-$variable',
  'rotate-$variable',
  'rotate-x-$variable',
  'skew-x-$variable',
  'scale-$variable',
  'scale-x-$variable',
  'transition-delay-$variable',
  'transition-duration-$variable',
  'ease-$variable',
  'text-$variable',
  'text-size-$variable',
  'fw-$variable',
  'leading-$variable',
  'lh-$variable',
  'tracking-$variable',
  'word-spacing-$variable',
  'ws-$variable',

  // variables - escaping
  // eslint-disable-next-line no-template-curly-in-string
  'ws-${row.span}/24',

  // variables - property
  '[a:b]',
  '[margin:logical_1rem_2rem_3rem]',
  '[content:attr(attr_content)]',
  '[content:attr(attr\\_content)]',
  '[background-image:url(star_transparent.gif),_url(cat_front.png)]',

  // variants
  'active:scale-4',
  'hover:scale-4',
  'hover:translate-x-3',
  'peer-checked:translate-x-[var(--reveal)]',
  '!hover:px-10',
  'at-2xl:m2',
  'at-lg:m2',
  'at-sm:m1',
  'disabled:op50',
  'first:p-2',
  'group-hover:group-focus:text-center',
  'hover:!p-1',
  'hover:not-first:checked:bg-red/10',
  'hover:p-5',
  'lt-lg:m2',
  'lt-sm:m1',
  'md:!hidden',
  'md:m-1',
  'not-hover:p-3',
  'peer-not-placeholder-shown:text-2xl',
  'sm:m-1',
  'sm:m1',

  // variants class
  'all-[.target]-[combinator:test-2]',
  'children-[.target]-[combinator:test-2]',
  'next-[.target]-[combinator:test-2]',
  'group-[.scope]-[combinator:test-3]',
  'parent-[.scope]-[combinator:test-3]',
  'previous-[.scope]-[combinator:test-3]',
  'sibling-[div:hover]-[combinator:test-4]',
  'group-[div:hover]-[combinator:test-4]',
  'all-[svg]:fill-red',

  // variants combinators
  'all:m-auto',
  'children:m-auto',
  'next:mt-0',

  // variant dark/light
  'dark:not-odd:text-red',
  'dark:text-xl',
  'light:text-sm',

  // variants layer
  'layer-1:translate-0',
  'layer-uno_css:block',

  // variants misc
  '-rotate-2',
  '-translate-full',
  '-translate-x-full',
  '-translate-y-1/2',
  '!m-$c-m',
  '!p-5px',
  '-gap-y-5',
  '-m-auto',
  '-mb-px',
  '-p-px',
  '-z-1',

  // variants media
  'media-cssvar:block',

  // variants prints
  'print:block',
  'print:link:!underline',

  // variants - pseudo elements
  'before:translate-y-full',
  'after:content-[unocss]',
  'placeholder-opacity-60',
  'placeholder-color-opacity-60',
  'placeholder-color-red-1',
  'placeholder:color-transparent',
  'selection:color-[var(--select-color)]',
  'marker:bg-violet-200',
  'file:bg-violet-50',
  'hover:file:bg-violet-100',

  // variants - pseudo classes
  'rtl:text-right',
  'ltr:text-left',
  'placeholder-shown-color-transparent',
  'open:color-pink-100',
  'in-range:color-pink-100',
  'out-of-range:color-pink-100',

  // variants - pseudo functions
  'not-hover:p-4px',
  'is-hover:p-4px',
  'where-hover:p-2',
  'has-hover:p-2',
  'peer-not-placeholder-shown:text-3xl',
  'hover:not-first:checked:bg-true-gray/10',
  'peer-is-placeholder-shown:text-3xl',
  'hover:is-first:checked:bg-true-gray/10',
  'group-where-placeholder-shown:text-4xl',
  'focus-within:where-first:checked:bg-gray/20',
  'group-has-placeholder-shown:text-4xl',
  'focus-within:has-first:checked:bg-gray/20',

  // variants scope
  'scope-scope_class:translate-0',
  'scope-unocss:block',

  // variants - tagged
  'group-focus:p-4',
  'peer-checked:bg-blue-500',
  'parent-hover:text-center',
  'previous-checked:bg-red-500',
]
