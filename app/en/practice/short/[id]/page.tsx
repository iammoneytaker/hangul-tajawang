import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { EnglishPracticeDetail } from '@/components/word-practice/EnglishPracticeDetail';
import { THEME_LABELS_EN } from '@/lib/i18n/practice-content';
import { localeAlternates } from '@/lib/i18n/alternates';
import { ENGLISH_OPEN_GRAPH } from '@/lib/i18n/english-metadata';

type Props = { readonly params: Promise<{ id: string }> };
export const dynamicParams = false;
export function generateStaticParams() { return Object.keys(THEME_LABELS_EN).map(id => ({ id })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const label = THEME_LABELS_EN[id];
  if (!label) notFound();
  const title = `${label.title} — Korean Sentence Typing Practice`;
  const description = `${label.description} Practice Korean typing with English controls and live feedback.`;
  return { title, description, alternates: localeAlternates(`/practice/short/${id}`, 'en'), openGraph: { ...ENGLISH_OPEN_GRAPH, title, description, url: `https://www.hangul-tajawang.com/en/practice/short/${id}` } };
}
export default async function Page({ params }: Props) {
  return <EnglishPracticeDetail kind="short" id={(await params).id} />;
}
