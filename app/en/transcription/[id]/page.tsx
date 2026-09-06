import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { LONG_TEXT_DB } from '@/lib/long-text-data';
import { LongPractice } from '@/components/long-practice/LongPractice';
import { FEATURED_WORKS } from '@/lib/i18n/practice-content';
import { localeAlternates } from '@/lib/i18n/alternates';
import { ENGLISH_OPEN_GRAPH } from '@/lib/i18n/english-metadata';

type Props = { readonly params: Promise<{ id: string }> };
export const dynamicParams = false;
export function generateStaticParams() { return FEATURED_WORKS.map(work => ({ id: work.id })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const work = FEATURED_WORKS.find(work => work.id === id);
  if (!work) notFound();
  const title = `${work.en} — Korean Transcription Practice`;
  const description = `Type ${work.en} by ${work.author} in Korean with English controls, live CPM, accuracy, and saved progress on this device.`;
  return { title, description, alternates: localeAlternates(`/transcription/${id}`, 'en'), openGraph: { ...ENGLISH_OPEN_GRAPH, title, description, url: `https://www.hangul-tajawang.com/en/transcription/${id}` } };
}
export default async function Page({ params }: Props) {
  const { id } = await params;
  const work = FEATURED_WORKS.find(work => work.id === id);
  const text = LONG_TEXT_DB.find(text => text.id === id);
  if (!work || !text) notFound();
  return (
    <div className="w-full py-8">
      <div className="text-center px-4 mb-4">
        <Link href="/en/transcription" className="text-primary font-bold">All literature</Link>
        <p className="text-zinc-600 mt-3">Type the Korean text as shown. Your progress is saved on this browser; use My Library to continue later.</p>
      </div>
      <LongPractice initialTextId={id} />
      <section className="max-w-4xl mx-auto px-6 mt-12">
        <h2 className="text-2xl font-bold mb-4">About this practice</h2>
        <p className="text-zinc-600 mb-6">{work.en} by {work.author}. This is a Korean typing exercise, not an English translation of the work. {work.type === 'Novel' ? 'The practice text is an excerpt.' : ''}</p>
        <div lang="ko" className="whitespace-pre-wrap leading-loose bg-surface-low rounded-2xl p-6">{text.content}</div>
        <nav aria-label="Literature collection" className="flex flex-wrap gap-4 mt-8">
          {FEATURED_WORKS.filter(other => other.id !== id).map(other => <Link key={other.id} href={`/en/transcription/${other.id}`} className="text-primary font-semibold">{other.en}</Link>)}
        </nav>
      </section>
    </div>
  );
}
