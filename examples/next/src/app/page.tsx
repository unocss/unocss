import { type Resource, Resources } from '@/components/Resources'

const resources: Resource[] = [
  {
    title: 'Docs',
    href: 'https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app',
    description: 'Find in-depth information about Next.js features and API.',
  },
  {
    title: 'Learn',
    href: 'https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app',
    description: 'Learn about Next.js in an interactive course with quizzes!',
  },
  {
    title: 'Templates',
    href: 'https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app',
    description: 'Explore the Next.js 13 playground.',
  },
  {
    title: 'Deploy',
    href: 'https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app',
    description:
      'Instantly deploy your Next.js site to a shareable URL with Vercel.',
  },
]

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          Get started by editing&nbsp;
          <code className="font-mono font-bold">src/app/page.tsx</code>
        </p>
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
          <a
            className="pointer-events-none flex place-items-center gap-2 p-8 lg:pointer-events-auto lg:p-0"
            href="https://vercel.com?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            By
            {' '}
            <h2>Vercel</h2>
          </a>
        </div>
      </div>

      <div className='relative flex place-items-center before:absolute before:h-[300px] before:w-[480px] before:-translate-x-1/2 before:rounded-full before:from-white before:to-transparent before:blur-2xl before:content-[""] after:absolute after:-z-20 after:h-[180px] after:w-[240px] after:translate-x-1/3 after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[""] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 before:lg:h-[360px]'>
        <h1 className="font-bold text-6xl font-mono">Next.js</h1>
      </div>

      <Resources resources={resources} />
    </main>
  )
}
