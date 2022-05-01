/* eslint-disable @typescript-eslint/quotes */
export default [
  '',
  "",
  ``,
  'foo',
  "bar",
  `baz`,
  'foo\'bar\"baz',
  `foo${'bar'}${'baz'}`,
  `foo${'bar'}baz${`spam`}ham eggs`,
  `foo${`spam${"ham"}${'eggs'}`}${`bacon`}bar`,
]
