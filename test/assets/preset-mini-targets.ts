export const presetMiniTargets: string[] = [
  // align
  'text-left',
  'text-align-right',
  'text-align-inherit',
  'vertical-baseline',
  'vertical-super',
  'vertical-inherit',
  'align-text-bottom',
  'align-revert',
  'align-start',
  'v-top',
  'v-mid',
  'v-unset',
  'v-end',

  // behaviors
  'outline-none',
  'outline',
  'outline-inherit',
  'outline-size-none',
  'outline-size-unset',
  'outline-width-revert',
  'outline-offset-inherit',
  'outline-hidden',
  'outline-gray',
  'outline-gray-400',
  'outline-size-4',
  'outline-width-4',
  'outline-offset-4',
  'outline-offset-none',
  'outline-unset',
  'outline-revert-layer',
  'outline-solid',
  'outline-color-red-1',
  'outline-width-10px',
  'outline-inset',
  'outline-110',
  'outline-blue-2',
  'outline-[var(--red)]',
  'outline-[calc(1rem-1px)]',
  'outline-size-[var(--width)]',
  'outline-offset-[var(--offset)]',
  'appearance-none',
  'appearance-auto',
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
  'border-inherit',
  'border-size-none',
  'border-4',
  'border-b',
  'border-x',
  'border-t-2',
  'border-be',
  'border-ie-unset',
  'border-inline',
  'border-bs-2',
  'border-size-2',
  'border-x-size-2',
  'border-t-size-2',
  'border-width-3',
  'border-width-[2em]',
  'border-width-[calc(1em-1px)]',
  'border-size-unset',
  'border-x-width-3',
  'border-t-width-3',
  'border-[calc(var(--border-width)*1px)]',
  'border-[calc(10px+1px)]',
  'rounded-[4px]',
  'rounded-1/2',
  'rounded-full',
  'rounded-unset',
  'rounded-md',
  'rounded-rb-1/2',
  'rounded-rb-1/2',
  'rounded-t-sm',
  'rounded-b-revert',
  'rounded-tr',
  'rounded-ie-be-1/2',
  'rounded-bs-sm',
  'rounded-bs-ie',
  'mt-6',
  'mx-1',
  'ms-4',
  'me-8',
  'pt-6',
  'px-1',
  'ps-4',
  'pe-8',
  'start-4',
  'end-8',
  'border-s-0',
  'border-e-4',
  'border-black',
  'border-s-green-500',
  'border-e-red-400',
  'rounded-s',
  'rounded-e',
  'rounded-ss',
  'rounded-es',
  'rounded',
  'rounded-none',
  'border-rounded',
  'border-dashed',
  'border-solid',
  'border-dotted',
  'border-double',
  'border-hidden',
  'border-none',

  'b-rounded',
  'b-dashed',
  'b-solid',
  'b-dotted',
  'b-double',
  'b-hidden',
  'b-none',

  'border-l-dashed',
  'border-t-dashed',
  'border-b-dashed',
  'border-r-dashed',
  'border-s-dashed',
  'border-e-dashed',
  'border-x-dashed',
  'border-y-unset',
  'border-y-revert-layer',
  'border-is-style-double',
  'border-block-style-double',

  // border - color
  'border-[#124]',
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
  'border-opacity-$opacity-variable',
  'border-y-red',
  'border-y-op-30',
  'border-x-[rgb(1,2,3)]/[0.5]',
  'border-x-[rgb(4_5_6)]/[0.5]',
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
  'c-$color-variable,red',
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
  'color-inherit',
  'color-initial',
  'text-inherit',
  'text-revert',
  'text-black/10',
  'text-rose',
  'text-red-100',
  'text-red-200/10',
  'text-red-300/20',
  'text-red-300:20',
  'text-red:20',
  'text-red100',
  'text-red2',
  'text-opacity-[13.3333333%]',
  'text-opacity-$opacity-variable',
  'text-[--variable]',
  'text-[var(--color)]',
  'text-[#124]',
  'text-[2em]',
  'text-[100px]',
  'text-[calc(1em-1px)]',
  'text-[length:--variable]',
  'text-[length:var(--size)]',
  'text-[length:2em]',
  'text-[length:calc(1em-1px)]',
  'text-[color:--variable]',
  'text-[color:var(--color)]',
  'text-[color:var(--color-x)]:[trick]',
  'text-sm/3',
  'text-sm/[10px]',
  'text-[11px]/4',
  'text-[12px]/[13px]',
  'text-[length:var(--size)]:$leading',
  'text-[calc(1rem-1px)]',
  'text-size-1em',
  'font-size-1.5rem',
  'font-[calc(500-300)]',
  'font-[var(--x)]',

  // color - bg
  'bg-[#153]/10',
  'bg-[#1533]',
  'bg-[#1533]/10',
  'bg-[rgba(1,2,3,0.5)]',
  'bg-[rgba(4_5_6/0.7)]',
  'bg-[rgba(4_5_6/0.7)]/80',
  'bg-[rgb(4_5_6/0.7)]/[calc(100/3)]',
  'bg-#452233/40',
  'bg-red-100',
  'bg-teal-100/55',
  'bg-teal-200:55',
  'bg-teal-300:[.55]',
  'bg-teal-400/[.55]',
  'bg-teal-500/[55%]',
  'bg-hex-452233/40',
  'bg-opacity-45',
  'bg-opacity-[--opacity-variable]',
  'bg-opacity-$opacity-variable',
  'bg-[10px]',
  'bg-[10%]',
  'bg-[10vw]',
  'bg-[calc(10%+10px)]',
  'bg-[calc(10vw+10px)]',
  'bg-[url(https://test.unocss.png)]',
  'bg-[image:$variable]',
  'bg-[image:https://test.unocss.png]',
  'bg-[length:--variable]',
  'bg-[length:10_20rem]',
  'bg-[length:1/2_20rem]',
  'bg-[size:--variable]',
  'bg-[size:10_20rem]',
  'bg-[size:1/2_20rem]',
  'bg-[position:--variable]',
  'bg-[position:10_20rem]',
  'bg-[position:1/2_20rem]',
  'bg-[position:bottom_left_10%]',
  'bg-[position:top_right_1/3]',

  // arbitrary gradients
  'bg-[linear-gradient(45deg,#0072ff,#00d2e8,#04fd8f,#70fd6c)]',
  'bg-[conic-gradient(red,blue)]',
  'bg-[radial-gradient(red,blue)]',

  // color - ring
  'ring-red2',
  'ring-red2/5',
  'ring-px',
  'ring-width-px',
  'ring-size-px',
  'ring-op-5',
  'ring-op-$opacity-variable',
  'ring-offset-red2',
  'ring-offset-red2/5',
  'ring-offset-op-5',
  'ring-offset-op-$opacity-variable',

  // decoration
  'decoration-none',
  'decoration-size-none',
  'decoration-transparent',
  'decoration-purple/50',
  'decoration-5',
  'decoration-offset-0.6rem',
  'decoration-offset-none',
  'decoration-underline',
  'decoration-size-unset',
  'decoration-[calc(1rem-1px)]',
  'underline',
  'underline-dashed',
  'underline-red-500',
  'underline-op80',
  'underline-op-$opacity-variable',
  'underline-auto',
  'underline-inherit',
  'underline-5',
  'underline-[calc(1rem-1px)]',
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
  '!flex-grow-0',
  'flex-basis-0',
  'flex-basis-1/2',
  'flex-$variable',
  'flex-[$variable1_$variable2_$variable3]',
  'shrink',
  'shrink-0',
  'shrink-10',
  'shrink-$variable',
  'grow',
  'grow-0',
  'grow-10',
  'grow-$variable',
  'basis-auto',
  'basis-none',
  'gap-none',
  'gap-inherit',
  'gap-4',
  'gap-x-1',
  'gap-col-1',
  'gap2',
  'flex-gap-y-1',
  'flex-gap-row-1',
  'flex-gap-y-unset',
  'flex-gap-row-unset',
  'grid-gap-y-1',
  'grid-gap-row-1',

  // grid
  'grid-cols-$1',
  'grid-cols-[1fr_2fr_100px_min-content]',
  'grid-cols-2',
  'grid-cols-[repeat(3,auto)]',
  'cols-[repeat(3,auto)]',
  'grid-rows-[1fr_2fr_100px_min-content]',
  'grid-rows-3',
  'rows-3',
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
  'grid-flow-dense',
  'grid-flow-col-dense',
  'grid-area-[content]',
  'grid-area-$variable',
  'grid-areas-[prepend_content_append]',
  'grid-areas-[prepend_content_append]-[prepend_content_append]',
  'grid-areas-$variable',
  'grid-cols-subgrid',
  'grid-rows-subgrid',

  // layout
  'of-y-visible',
  'of-x-unset',
  'overflow-auto',
  'overflow-inherit',
  'overflow-x-scroll',
  'overflow-y-clip',

  // position
  'static',
  'relative',
  'absolute',
  'pos-fixed',
  'pos-unset',
  'position-sticky',
  'position-inherit',
  'justify-inherit',
  'justify-start',
  'justify-center',
  'justify-items-end',
  'justify-items-unset',
  'justify-self-stretch',
  'justify-self-revert',
  'order-first',
  'order-none',
  'content-start',
  'content-inherit',
  'content-center',
  'items-end',
  'items-unset',
  'self-stretch',
  'self-revert',
  'place-content-stretch',
  'place-items-stretch',
  'place-self-stretch',
  'place-content-inherit',
  'place-items-unset',
  'place-self-revert',

  // position - insets
  'top-0',
  'top-$top-height',
  'inset-none',
  'inset-unset',
  'inset-x-5',
  'inset-y-5',
  'inset-t-5',
  'inset-b-5',
  'inset-e-5',
  'inset-e-inherit',
  'inset-bs-5',
  'inset-ie-5',
  'inset-ie-revert',
  'inset-0',
  'inset-5',
  'inset-[5px]',
  'inset-inline-5',
  'inset-block-5',
  'inset-block-unset',

  // position - others
  'float-left',
  'float-none',
  'float-unset',
  'clear-both',
  'clear-none',
  'clear-revert',
  'box-content',
  'box-border',
  'box-inherit',

  // position - z-index
  'z0',
  'z-0',
  'z-1',
  'z-100',
  'z-auto',
  'z-inherit',
  'pos-z--1',
  'position-z-auto',

  // ring, shadow
  'ring',
  'ring-10',
  'ring-none',
  'ring-offset',
  'ring-offset-none',
  'ring-offset-4',
  'ring-offset-green5',
  'ring-inset',
  'ring-[calc(1rem-1px)]',
  'shadow',
  'shadow-transparent',
  'shadow-current',
  'shadow-none',
  'shadow-xl',
  'shadow-green-500',
  'shadow-green-900/50',
  'shadow-[#fff]',
  'shadow-op-50',
  'shadow-op-$opacity-variable',
  'shadow-inset',
  'shadow-[0px_4px_4px_0px_rgba(237,_0,_0,_1)]',
  'shadow-[0px_4px_4px_0px_rgba(238_0_0/1)]',
  'shadow-$variable',

  // size
  'h-auto',
  'h-inherit',
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
  'w-unset',
  'w-1',
  'w-21',
  'w-1/4',
  'w-lg',
  'w-1in',
  'h-screen-sm',
  'h-screen-lg',
  'max-h-[1px]',
  'max-h-unset',
  'max-w-none',
  'max-w-20',
  'max-w-lg',
  'max-w-full',
  'max-w-$var',
  'max-w-screen-lg',
  'max-w-revert',
  'min-h-[1px]',
  'min-h-unset',
  'min-w-none',
  'min-w-20',
  'min-w-lg',
  'min-w-full',
  'min-w-$var',
  'min-w-screen-lg',
  'min-w-revert-layer',
  'h-$var',
  'h-[calc(1000px-4rem)]',
  'w-[calc(calc(100px*10)-4rem)]',
  'w-[calc(1-var(--something)*0.5)]',
  'w-[calc(1-(var(--something)*0.5))]',
  'w-[calc(1-((12-3)*0.5))]',
  'size-w-10',
  'size-h-[calc(1000px-4rem)]',
  'size-min-w-full',
  'size-10',
  'size-[calc(1000px-4rem)]',
  'size-[var(--something)]',
  'size-min-10',
  'size-max-10',

  // size - logical
  'block-auto',
  'block-unset',
  'block-1',
  'block-21',
  'block-1/2',
  'block-8/7',
  'block-lg',
  'block-screen',
  'inline-auto',
  'inline-inherit',
  'inline-1',
  'inline-21',
  'inline-1/4',
  'inline-lg',
  'max-block-[1px]',
  'max-block-revert',
  'max-inline-inherit',
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
  'inline-screen',

  // size - ar
  'aspect-ratio-square',
  'aspect-ratio-video',
  'aspect-ratio-revert',
  'aspect-auto',
  'aspect-unset',
  'aspect-ratio-3/2',
  'aspect-ratio-0.7',
  'aspect-ratio-$var',
  'aspect-ratio-[auto_16/9]',
  'aspect-[auto_16/9]',

  // spacing
  'p-none',
  'p-unset',
  'p-2',
  'p-t-2',
  'p2',
  'pl-10px',
  'pl-revert',
  'pt-2',
  'pt2',
  'pt-$title2',
  'pa',
  'm-inherit',
  'm-[3em]',
  'm-0',
  'm-1/2',
  'm-auto',
  'mt-[-10.2%]',
  'mt-$height',
  'my-auto',
  'my-revert-layer',
  'my-[var(--hello-space-y)]',
  'm-none',

  // spacing - logical
  'p-ie-none',
  'p-ie-revert',
  'p-bs-2',
  'pis-10px',
  'pbs-2',
  'pbs2',
  'pbs-$title2',
  'mbs-unset',
  'mbs-[-10.2%]',
  'mbs-$height',
  'm-block-auto',
  'm-inline-none',
  'm-block-inherit',

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
  '-m-lg',
  '-m-md',
  'm--lg',
  'm--md',
  'm-lg',
  'm-md',

  // static
  'contents',
  'display-$var',
  'display-inherit',
  'visible',
  'backface-hidden',
  'backface-revert',
  'cursor-pointer',
  'cursor-inherit',
  'cursor-$pointer-var',
  'cursor-[url(cursor_2.png)_2_2,_pointer]',
  'pointer-events-none',
  'pointer-events-auto',
  'pointer-events-unset',
  'resize',
  'resize-none',
  'resize-inherit',
  'select-all',
  'select-none',
  'select-inherit',
  'whitespace-pre-wrap',
  'whitespace-unset',
  'ws-nowrap',
  'ws-revert',
  'contain-layout',
  'contain-[size_layout]',
  'contain-[size_layout_paint]',

  'break-normal',
  'break-words',
  'break-keep',
  'text-clip',
  'text-wrap',
  'text-nowrap',
  'text-balance',
  'text-pretty',
  'case-upper', // !
  'case-normal', // !
  'case-inherit', // !
  'italic',
  'oblique',
  'antialiased',

  // content
  'content-empty',
  'content-none',
  'content-[normal]',
  'content-[quoted:!]',
  'content-[quoted:unocss]',
  'content-[\'quoted1\']',
  'content-[\'quoted_with_space\']',
  'content-["quoted2"]',
  'content-[string:attr(dashed-attr)]',
  'content-[string:attr(underlined\\_attr)]',
  'content-$unocss-var',

  // content visibility
  'content-visibility-auto',
  'content-visibility-visible',
  'content-visibility-hidden',
  'content-visibility-unset',
  'intrinsic-size-200',
  'intrinsic-size-200px',
  'intrinsic-size-1/2',
  'intrinsic-size-unset',

  // svg
  'fill-none',
  'fill-current',
  'fill-green-400',
  'fill-opacity-80',
  'fill-opacity-$opacity-variable',
  'fill-[#123]',
  'stroke-none',
  'stroke-current',
  'stroke-green-400',
  'stroke-opacity-80',
  'stroke-opacity-$opacity-variable',
  'stroke-[#123]',
  'stroke-[1rem]',
  'stroke-[calc(1rem-1px)]',
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
  'transform-unset',
  'translate-none',
  'translate-y-1/4',
  'translate-[var(--x),var(--y)]',
  'translate-[var(--x),var(--y),25%]',
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
  'skew-10',
  'skew-[var(--x),var(--y)]',
  'skew-[var(--x),var(--y),25%]',
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
  'transition-property-[border]',
  'transition-200',
  'transition-opacity-200',
  'transition-colors',
  'transition-colors,opacity',
  'transition-colors,opacity-200',
  'transition-color,background-color-200',
  'transition-background-color,color-200',
  'transition-$variant',
  'transition-[width,height]',
  'transition-[width,height,colors]',
  'transition-[width,height,colors]-200',
  'transition',
  'transition-revert-layer',
  'property-none',
  'property-all',
  'property-unset',
  'property-color',
  'property-background-color',
  'property-border-color',
  'property-outline-color',
  'property-text-decoration-color',
  'property-fill',
  'property-stroke',
  'property-margin,padding',
  'property-padding,margin',
  'property-[padding,margin]',
  'duration-111',

  // transition - timings
  'ease-linear',
  'ease-out',
  'transition-ease-in',

  // transition - behavior - discrete/normal
  'transition-discrete',
  'transition-normal',

  // typography
  'font-mono',
  'font-[system-ui]',
  'font-550',
  'font-$font-name',
  'text-4xl',
  'text-base',
  'text-lg',
  'text-2em',
  'text-size-unset',
  'text-size-[2em]',
  'font-thin',
  'font-900',
  'font-050',
  'font-50',
  'font-synthesis-weight',
  'font-synthesis-small-caps',
  'font-synthesis-[weight_style]',
  'font-synthesis-$synth',
  'font-synthesis-inherit',
  'font-inherit',
  'font-["custom_fontFamily_name"]',
  'fw-inherit',
  'fw-900',
  'fw-050',
  'fw-50',
  'font-italic',
  'font-oblique',
  'leading-2',
  'leading-inherit',
  'font-leading-2',
  'lh-[1.5]',
  'line-height-[1.5]',
  'tracking-wide',
  'tracking-[2/5]',
  'tracking-inherit',
  'font-tracking-1em',
  'font-stretch-normal',
  'font-stretch-[ultra-expanded]',
  'font-stretch-1/2',
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
  'indent-revert-layer',
  'text-stroke-6',
  'text-stroke-sm',
  'text-stroke-blue-500',
  'text-stroke-op-60',
  'text-stroke-op-$opacity-variable',
  'text-shadow',
  'text-shadow-lg',
  'text-shadow-none',
  'text-shadow-$var',
  'text-shadow-color-red-300',
  'text-shadow-color-op-30',
  'text-shadow-color-op-$opacity-variable',

  // misc
  'color-scheme-light',
  'color-scheme-dark',

  // variables
  'bg-[--test-variable]',
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
  'scale-[var(--x),var(--y)]',
  'scale-[var(--x),var(--y),20%]',
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

  // variables - property
  '[a:b]',
  '[margin:logical_1rem_2rem_3rem]',
  '[content:attr(attr_content)]',
  '[content:attr(attr\\_content)]',
  '[background-image:url(star_transparent.gif),_url(cat_front.png)]',
  '[font-family:var(--font-family)]',
  '[font-family:\'Inter\',_sans-serif]',
  '[font-feature-settings:\'cv02\',\'cv03\',\'cv04\',\'cv11\']',
  '[font-variation-settings:"wght"_400,_"opsz"_14]',
  '[padding:theme(spacing.xl)]',
  '[color:theme(colors.blue.300/40%)]',
  '[--css-variable:"wght"_400,_"opsz"_14]',
  '[--css-variable-color:theme(colors.red.500)]',
  '[--css-variable-color:theme(colors.red.500/50%)]',
  '[--css-variable-color:theme(colors.green.500),theme(colors.blue.500)]',
  '[--css-spacing:theme(spacing.sm)]',
  'bg-[--css-spacing,theme(spacing.sm)]',
  'text-[theme(spacing.sm)]',
  'c-[theme(colors.red.500/50%)]',

  // variants
  'active:scale-4',
  'hover:scale-4',
  'hover:translate-x-3',
  'peer-checked:translate-x-[var(--reveal)]',
  '!hover:px-10',
  'at-2xl:m2',
  'at-lg:m2',
  'at-sm:m1',
  '~sm:m1',
  'disabled:op50',
  'first:p-2',
  'first-line:bg-green-400',
  'first-letter:bg-green-400',
  'group-hover:group-focus:text-center',
  'focus-visible:outline-none',
  'hover:!p-1',
  'hover:not-first:checked:bg-red/10',
  'hover:p-5',
  'lt-lg:m2',
  'lt-sm:m1',
  'max-sm:m1',
  '<sm:m1',
  'md:!hidden',
  'md:m-1',
  'not-hover:p-3',
  'peer-not-placeholder-shown:text-2xl',
  'sm:m-1',
  'sm:m1',
  'important:p-3',
  'sm:important:p-3',
  'p3!',
  '-mt-safe',
  '-!mb-safe',
  '!-ms-safe',
  '*:p-2',
  '*-p-2',

  // variants class
  'all-[.target]-[combinator:test-2]',
  'children-[.target]-[combinator:test-2]',
  'next-[.target]-[combinator:test-2]',
  'sibling-[div:hover]-[combinator:test-4]',
  'all-[svg]:fill-red',
  'all-[[data-hvr]:hover]:[color:red]',

  // variants combinators
  'all:m-auto',
  'all:m1/1',
  'children:m-auto',
  'next:mt-0',

  // variant dark/light
  'dark:not-odd:text-red',
  'dark:text-xl',
  'light:text-sm',

  // variants layer
  'uno-layer-1:translate-0',
  'uno-layer-uno_css:block',
  'layer-base:translate-0',
  'layer-[utility]:block',
  'uno-layer-[uno_css]:block',

  // variants misc
  '-rotate-2',
  '-translate-full',
  '-translate-x-full',
  '-translate-y-1/2',
  '-scale-x-full',
  '!m-$c-m',
  '!p-5px',
  '-gap-y-5',
  '-gap-row-5',
  '-mb-px',
  '-mt--5cm',
  '-p-px',
  '-z-1',

  // variants supports
  'supports-[(display:_grid)]:block',

  // variants media
  'media-mouse:block',
  'media-[(--cssvar)]:block',
  'group-hover:media-mouse:bg-red',

  // variants prints
  'print:block',
  'print:link:!underline',

  // variants - pseudo elements
  'before:translate-y-full',
  'after:content-[quoted:unocss]',
  'placeholder-opacity-60',
  'placeholder-color-opacity-60',
  'placeholder-color-red-1',
  'placeholder:color-transparent',
  'selection:color-[var(--select-color)]',
  'marker:bg-violet-200',
  'file:bg-violet-50',
  'hover:file:bg-violet-100',
  'backdrop:shadow-green',
  'backdrop-element:shadow-green-100',

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

  // variants - pseudo function with custom value
  'has-[:hover]:m-1',
  'group-not-[[data-potato]]:m-1',
  'previous-is-[div]:m-1',
  'peer-where-[.child]:m-1',
  'parent-not-[#someId]:m-1',

  // variants scope
  'scope-[.scope\\_class]:translate-0',
  'scope-[unocss]:block',
  'scope-[[data-any]]:inline',

  // variants - taggedData
  'group-focus:p-4',
  'peer-checked:bg-blue-500',
  'parent-hover:text-center',
  'previous-checked/label:bg-red-500',
  'group-hover:font-10',
  'group-[:hover]:font-11',
  'group-[[data-attr]]:font-12',
  'group-[.as-parent_&]:font-13',
  'group-[.not-parent]:font-14',
  'group-hover/label:font-15',
  'group-[:hover]/label:font-16',
  'group-[[data-attr]]/label:font-17',
  'group-[.as-parent_&]/label:font-18',
  'group-[.not-parent]/label:font-19',

  // variants - taggedAria
  'group-aria-focus:p-4',
  'peer-aria-checked:bg-blue-500',
  'parent-aria-hover:text-center',
  'previous-aria-checked/label:bg-red-500',
  'group-aria-hover:font-10',
  'group-aria-[:hover]:font-11',
  'group-aria-[[data-attr]]:font-12',
  'group-aria-[.as-parent_&]:font-13',
  'group-aria-[.not-parent]:font-14',
  'group-aria-hover/label:font-15',
  'group-aria-[:hover]/label:font-16',
  'group-aria-[[data-attr]]/label:font-17',
  'group-aria-[.as-parent_&]/label:font-18',
  'group-aria-[.not-parent]/label:font-19',

  // variants - variables
  '[&:nth-child(2)]:m-10',
  '[&>*]:m-11',
  '[*>&]:m-12',
  '[&_&]:m-13',
  '[&[open]]:m-14',
  '[&[readonly][disabled]]:m-15',
  '[&[open]:readonly]:m-16',
  '[*[open]:readonly_&]:[&[open]:disabled]:m-17',
  '[@supports(display:grid)]:bg-red/33',
  '[@supports(display:grid)]:[*+&]:bg-red/34',
  'before:[&[data-active=\'true\']]:content-[\'test\']',
  '[&[data-active="true"]]:bg-red',

  // variants - combinators + pseudo
  'checked:next:text-slate-100',
  'next:checked:text-slate-200',
  'checked:next:hover:text-slate-500',
  'next:checked:children:text-slate-600',

  // variants - multiple parents
  'sm:lt-lg:p-10',

  // variants - aria
  'aria-[invalid=spelling]:underline-red-600',

  // variants - data
  'data-[inline]:inline',
  'data-[invalid~=grammar]:underline-green-600',

  // variants - tagged-data
  'group-data-[state=open]:font-bold',
  'group-data-[state=open]/named:font-medium',
  'peer-data-[state=closed]:border-3',

  // variants - container parent
  '@container',
  '@container/label',
  '@container-normal',
  '@container/label-normal',
  '@container-inline-size',
  '@container/label-inline-size',
  '@container-size',
  '@container/label-size',

  // variants - container query (@)
  '@sm:text-red',
  '@lg-text-red',
  '@[10.5rem]-text-red',
  '@xs/label:text-green',
  '@[100px]/label:text-green',

  // variants - starting style
  'starting:opacity-0',
  'starting:popover-open:opacity-0',
]

export const presetMiniNonTargets = [
  // content requires bracket
  'content-foo',
  'content-foo-bar',
  'content-[foo',
  'content-foo]',

  // variants - negative
  '-border-solid',
  '-decoration-none',
  '-color-blue-400',

  // variants - combinator
  'all:[svg]:fill-red',

  // vertical align
  'v-random',
  'v-foo-100%',
  'vertical-x-100%',

  // arbitrary css properties edge cases that cause invalid output
  '[name].[hash:9]',
  '["update:modelValue"]',
  '[https://en.wikipedia.org/wiki]',
  '[Baz::class]',
  '[foo:bar:baz]',
  '[foo:{bar}]',
  '[foo:\'bar\',"baz",`]',
  // escaped arbitrary css properties only allowed in css variables
  '[cant\~escape:me]',
  // https://github.com/unocss/unocss/issues/2951
  '[https://example.com/documentation/](https://example.com/documentation/)',

  // not exists
  'text-main/50',

  // overmatch
  'op50>Foo',
  'display-a',

  // object prototype
  'px-toString',
  'px-toLocaleString',
  'px-valueOf',
  'px-hasOwnProperty',
  'px-isPrototypeOf',
  'px-propertyIsEnumerable',
  'px-__defineGetter__',
  'px-__defineSetter__',
  'px-__lookupGetter__',
  'bg-toString',
]

export const specialPresetMiniTargets: string[] = [
  '[&>*]:content-[\',\\00a0\']',
  '[&>*:not(:last-child)]:after:content-[\',\\00a0\']',
]
