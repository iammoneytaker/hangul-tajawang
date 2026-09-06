import Link from 'next/link';
export function EnglishLegal({ title, source, sections }: { readonly title: string; readonly source: string; readonly sections: readonly (readonly [string, readonly string[]])[] }) {
  return <article className="paper-card max-w-3xl mx-auto my-10 p-6 md:p-12">
    <Link href="/en" className="text-primary font-bold">Home</Link>
    <h1 className="text-3xl font-bold mt-6 mb-3">{title}</h1>
    <p className="text-sm text-zinc-500 mb-8">English translation of the existing policy effective August 29, 2026. <Link href={source} className="underline">Read the Korean original</Link>.</p>
    <div className="space-y-8">{sections.map(([heading, paragraphs]) => <section key={heading}><h2 className="text-xl font-bold mb-3">{heading}</h2>{paragraphs.map(paragraph => <p key={paragraph} className="text-zinc-600 leading-relaxed mb-3 break-words">{paragraph}</p>)}</section>)}</div>
    <nav className="flex flex-wrap gap-5 mt-8 text-primary font-semibold"><Link href="/en/terms">Terms</Link><Link href="/en/privacy">Privacy</Link><Link href="/en/contact">Contact</Link></nav>
  </article>;
}
