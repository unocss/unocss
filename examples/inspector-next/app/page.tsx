export default function Home() {
  return (
    <div className="h-screen flex flex-col items-center justify-center gap-4 bg-gray-100 dark:bg-gray-900">
      <h1 className="text-2xl font-bold text-sky-600">UnoCSS + Next.js</h1>
      <p className="op-60 max-w-100 text-center">
        UnoCSS runs through
        {' '}
        <code>@unocss/postcss</code>
        {' '}
        and the inspector is hosted by the Next app at
        {' '}
        <a className="text-sky-600 underline" href="/__unocss/">/__unocss/</a>
        . Enter the one-time code printed in the Next dev terminal to unlock it.
      </p>
      <button type="button" className="btn">A button</button>
      <div className="m-4 p-2 text-sm text-red-500 hover:op-50">Some utilities to inspect</div>
    </div>
  )
}
