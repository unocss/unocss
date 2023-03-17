export const presetArbitraryTargets: string[] = [
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

  // variants experimental
  '@hover:[[open]_&]:text-blue',

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
  '[--css-variable:"wght"_400,_"opsz"_14]',
  '[--escaped\\~variable\\::100%]',

  // TODO: should them be here?
  'content-[\'quoted1\']',
  'content-[\'quoted_with_space\']',
  'content-["quoted2"]',
]
