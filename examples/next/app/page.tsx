export default function Home() {
  return (
    <main className="flex flex-col items-center gap-6 p-12 text-center active:(rotate-45 text-lime-600)">
      <h1 className="text-4xl font-bold hover:(text-teal-600 underline)">
        UnoCSS + Next.js
      </h1>

      <div className="i-logos-nextjs-icon text-5xl" />

      <p className=":uno: max-w-prose text-neutral-500 leading-relaxed">
        `hover:(...)` above is a variant group and this paragraph is a compiled class.
        Both are rewritten in your source, which only @unocss/next can do.
      </p>
    </main>
  )
}
