import { Link } from '@remix-run/react'

export default function About() {
  return (
    <section className="bg-red font-sans py-2 px-5">
      <h1>About page</h1>
      <Link to="/" className="text-blue">Back</Link>
    </section>
  )
}
