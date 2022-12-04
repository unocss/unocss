import type { NextPage } from 'next'
import Link from 'next/link'
import Navbar from '../../components/navbar'

const Blog: NextPage = () => {
  return (
    <>
      <Navbar />
      <main className="py-20 px-12 text-center flex flex-col items-center gap-20px">
        <h2 className="text-3xl font-bold text-green-900">Blog posts</h2>

        <Link href="/" className="flex items-center btn">
          <div className="i-carbon-arrow-left" />
            Home
        </Link>
      </main>
    </>
  )
}

export default Blog
