import type { Metadata } from 'next';
import { ENGLISH_OPEN_GRAPH } from '@/lib/i18n/english-metadata';
import Link from 'next/link';
import { Keyboard, ArrowRight } from 'lucide-react';
import { BASIC_PRACTICE_STEPS } from '@/lib/word-data';
import { localeAlternates } from '@/lib/i18n/alternates';

import { STEP_LABELS } from '@/lib/i18n/practice-content';

const FAQ = [
  {
    q: 'How is word practice different from key position practice?',
    a: 'Position practice teaches you where each individual letter lives; word practice chains those letters into real Korean words. This is where your fingers learn the flow of Hangul — how a syllable like 나무 becomes ㄴ+ㅏ+ㅁ+ㅜ without conscious thought. It is the stage that actually raises your typing speed.',
  },
  {
    q: 'The words are in Korean — will I understand them?',
    a: 'The drills use common everyday Korean words, so as a learner you get free vocabulary exposure while you type. You do not need to understand a word to type it, but you will find many of them showing up in your Korean lessons.',
  },
  {
    q: 'Which step should I start from?',
    a: 'Start from Step 1 (home row) and go in order, even if it feels easy. Each step adds one keyboard region, and skipping ahead is the most common cause of persistent typos later.',
  },
];

export const metadata: Metadata = {
  title: 'Korean Word Typing Practice - Hangul Drills',
  description:
    'Type real Korean words step by step, organized by keyboard row. Free Hangul word drills that turn key positions into real typing speed — ideal for beginners.',
  keywords: [
    'korean word typing practice',
    'hangul typing practice',
    'korean typing drills',
    'korean typing practice for beginners',
    'type korean words',
  ],
  alternates: localeAlternates('/practice/word', 'en'),
  openGraph: {
    ...ENGLISH_OPEN_GRAPH,
    title: 'Korean Word Typing Practice - Step-by-Step Drills',
    description: 'Real Korean words, organized by keyboard row, from home-row basics to tense consonants.',
    url: 'https://www.hangul-tajawang.com/en/practice/word',
    locale: 'en_US',
    siteName: 'Hangul Tajawang',
  },
};

export default function EnWordPracticeListPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-16 px-4">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="text-center mb-16 animate-in slide-in-from-bottom duration-700">
        <h1 className="text-5xl font-bold mb-6">Korean Word Typing Practice</h1>
        <p className="text-zinc-500 font-medium text-xl leading-relaxed">
          Real Korean words organized by keyboard region — home row, top row, bottom row, and tense consonants.{' '}
          <br className="hidden md:block" />
          Build speed one keyboard region at a time. Controls and results are in English.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {BASIC_PRACTICE_STEPS.map((step, i) => (
          <Link
            prefetch={false}
            key={step.id}
            href={`/en/practice/word/${step.id}`}
            className="group flex flex-col bg-surface-low p-8 rounded-2xl border border-surface-high hover:border-primary/50 transition-all hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,74,198,0.1)] relative overflow-hidden"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:rotate-12 group-hover:scale-110">
              <Keyboard size={80} />
            </div>

            <div className="mb-4 relative z-10">
              <span className="text-[10px] font-bold uppercase text-primary tracking-widest bg-primary/10 px-3 py-1 rounded-full">
                Step {i + 1}
              </span>
            </div>

            <h2 className="text-2xl font-bold text-on-surface mb-2 group-hover:text-primary transition-colors relative z-10">
              {STEP_LABELS[step.id]?.title ?? `Step ${i + 1}`}
            </h2>
            <p className="text-sm font-medium text-zinc-500 mb-6 relative z-10">{STEP_LABELS[step.id]?.description}</p>

            <div className="mt-auto flex items-center justify-between relative z-10 p-4 bg-surface-lowest rounded-xl border border-surface-high">
              <span className="text-xs font-bold text-zinc-500 line-clamp-1 flex-1">
                e.g. &lsquo;{step.words[0]}&rsquo;, &lsquo;{step.words[1]}&rsquo;
              </span>
              <ArrowRight size={16} className="text-primary group-hover:translate-x-1 transition-transform ml-4" />
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-24 border-t border-zinc-200 pt-16 pb-4 space-y-16 text-left">
        <section className="space-y-5">
          <h2 className="text-2xl md:text-3xl font-bold">How to get the most out of word drills</h2>
          <ul className="space-y-4">
            {[
              ['Go in order', 'Home row → top row → bottom row → tense consonants. Each step assumes the previous one is automatic.'],
              ['Use the assigned finger', 'Slow and correct beats fast and improvised. Wrong-finger habits are what cap your speed later.'],
              ['Eyes on the screen', 'Words are short, so this is the perfect stage to stop looking at your keyboard entirely.'],
              ['Rhythm over speed', 'Type each word as one continuous motion rather than letter by letter — speed follows rhythm.'],
            ].map(([t, d]) => (
              <li key={t} className="flex items-start gap-3">
                <span className="text-amber-500 mt-1 shrink-0">✔</span>
                <span className="text-zinc-600 leading-relaxed">
                  <strong className="text-on-surface">{t}:</strong> {d}
                </span>
              </li>
            ))}
          </ul>
          <p className="text-zinc-600 leading-loose font-medium">
            The controls and results are in English; the words you type stay in Korean. New to the layout? Do{' '}
            <Link prefetch={false} href="/en/practice/position" className="text-primary font-bold underline underline-offset-2">
              key position practice
            </Link>{' '}
            first.
          </p>
        </section>

        <section className="space-y-5">
          <h2 className="text-2xl md:text-3xl font-bold">Frequently asked questions</h2>
          <div className="space-y-4">
            {FAQ.map((f) => (
              <details key={f.q} className="group bg-surface-low rounded-2xl border border-surface-high p-6 open:pb-6">
                <summary className="cursor-pointer list-none font-bold text-on-surface flex items-center justify-between gap-4">
                  {f.q}
                  <span className="text-primary transition-transform group-open:rotate-45 text-xl leading-none shrink-0">+</span>
                </summary>
                <p className="mt-4 text-sm text-zinc-600 leading-loose">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
