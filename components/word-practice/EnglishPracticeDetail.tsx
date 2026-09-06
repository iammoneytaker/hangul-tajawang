import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BASIC_PRACTICE_STEPS } from '@/lib/word-data';
import { SHORT_TEXT_DB } from '@/lib/short-text-data';
import { STEP_LABELS, THEME_LABELS_EN } from '@/lib/i18n/practice-content';
import { PositionPractice } from './PositionPractice';
import { ShortPractice } from '@/components/short-practice/ShortPractice';

export function EnglishPracticeDetail({ kind, id }: { readonly kind: 'word' | 'short'; readonly id: string }) {
  const entries = kind === 'word'
    ? BASIC_PRACTICE_STEPS.map(step => ({ id: step.id, label: STEP_LABELS[step.id], texts: step.words, category: '' }))
    : SHORT_TEXT_DB.map(theme => ({ id: theme.id, label: THEME_LABELS_EN[theme.id], texts: theme.sentences, category: theme.category }));
  const index = entries.findIndex(entry => entry.id === id);
  const entry = entries[index];
  if (!entry?.label) notFound();
  const previous = entries[index - 1];
  const next = entries[index + 1];
  return (
    <div className="w-full py-8 text-on-surface">
      <header className="max-w-4xl mx-auto text-center px-4 mb-6">
        <Link href={`/en/practice/${kind}`} className="text-sm font-semibold text-primary">All {kind === 'word' ? 'word stages' : 'sentence themes'}</Link>
        <h1 className="text-3xl md:text-4xl font-bold mt-4 mb-3">{entry.label.title}: Korean {kind === 'word' ? 'Word' : 'Sentence'} Practice</h1>
        <p className="text-zinc-600">{entry.label.description} Enable your Korean keyboard and type the text shown. Controls and results are in English.</p>
      </header>
      {kind === 'word' ? <PositionPractice initialPhase="words" initialTargetId={id} /> : <ShortPractice initialCategory={entry.category} />}
      <section className="max-w-5xl mx-auto px-6 mt-12">
        <h2 className="text-2xl font-bold mb-6">Practice text</h2>
        <ul lang="ko" className="grid gap-3 sm:grid-cols-2">
          {entry.texts.map((text, i) => <li key={i} className="bg-surface-low p-4 rounded-xl">{text}</li>)}
        </ul>
        <nav aria-label="Practice stages" className="flex flex-wrap justify-between gap-4 mt-8">
          {previous && <Link href={`/en/practice/${kind}/${previous.id}`} className="text-primary font-bold">Previous: {previous.label?.title}</Link>}
          {next && <Link href={`/en/practice/${kind}/${next.id}`} className="text-primary font-bold">Next: {next.label?.title}</Link>}
        </nav>
      </section>
    </div>
  );
}
