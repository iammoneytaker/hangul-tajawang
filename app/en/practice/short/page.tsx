import type { Metadata } from 'next';
import { ENGLISH_OPEN_GRAPH } from '@/lib/i18n/english-metadata';
import Link from 'next/link';
import { Quote, ArrowRight } from 'lucide-react';
import { SHORT_TEXT_DB } from '@/lib/short-text-data';
import { localeAlternates } from '@/lib/i18n/alternates';

// 테마 카드에 붙일 영어 설명 (지문 데이터 자체는 한글 그대로)
import { THEME_LABELS_EN } from '@/lib/i18n/practice-content';

const FAQ = [
  {
    q: 'How does Korean sentence practice work?',
    a: 'Pick a theme and Korean sentences appear one at a time. Type each sentence exactly as shown; completing one loads the next. Your CPM (characters per minute) and accuracy are tracked live — no installation or sign-up needed.',
  },
  {
    q: 'Why practice with short sentences instead of long texts?',
    a: 'A short sentence finishes in one breath, so you get frequent completion feedback and can squeeze practice into spare minutes. It is also the sweet spot for automating finger movement — long enough for real rhythm, short enough to stay focused.',
  },
  {
    q: 'Which theme is best for Korean learners?',
    a: 'Start with proverbs: the sentences are the shortest and expose you to classic expressions every Korean knows. Move to healing and motivation themes as longer sentence rhythms start to feel comfortable.',
  },
];

export const metadata: Metadata = {
  title: 'Korean Sentence Typing Practice - Short Text Drills',
  description:
    'Practice typing real Korean sentences by theme — proverbs, quotes, and encouraging lines — with live CPM and accuracy tracking. Free short-text Hangul typing practice.',
  keywords: [
    'korean sentence typing practice',
    'korean typing practice',
    'hangul sentence practice',
    'type korean sentences',
    'korean typing speed',
  ],
  alternates: localeAlternates('/practice/short', 'en'),
  openGraph: {
    ...ENGLISH_OPEN_GRAPH,
    title: 'Korean Sentence Typing Practice by Theme',
    description: 'Proverbs, quotes and healing lines — pick a theme and build your Korean typing flow.',
    url: 'https://www.hangul-tajawang.com/en/practice/short',
    locale: 'en_US',
    siteName: 'Hangul Tajawang',
  },
};

export default function EnShortPracticeListPage() {
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

      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold mb-6">Korean Sentence Typing Practice</h1>
        <p className="text-zinc-500 font-medium text-xl leading-relaxed">
          Type real Korean sentences, one at a time, with live speed and accuracy tracking.{' '}
          <br className="hidden md:block" />
          Pick a theme and find your typing rhythm. Controls and results are in English.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {SHORT_TEXT_DB.map((theme) => {
          const en = THEME_LABELS_EN[theme.id];
          return (
            <Link
              prefetch={false}
              key={theme.id}
              href={`/en/practice/short/${theme.id}`}
              className="group flex flex-col bg-surface-low p-8 rounded-2xl border border-surface-high hover:border-primary/50 transition-all hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,74,198,0.1)]"
            >
              <div className="flex items-center gap-3 mb-4">
                <Quote size={20} className="text-primary" />
                <span className="text-[10px] font-bold uppercase text-primary tracking-widest">{en?.title ?? 'Korean Sentences'}</span>
              </div>
              <h2 className="text-2xl font-bold text-on-surface mb-2 group-hover:text-primary transition-colors">
                {en?.title ?? theme.category}
              </h2>
              <p className="text-sm font-medium text-zinc-500 mb-6">
                {en?.description ?? `${theme.sentences.length} Korean sentences to type.`}
              </p>
              <div className="mt-auto flex items-center justify-between p-4 bg-surface-lowest rounded-xl border border-surface-high">
                <span className="text-xs font-bold text-zinc-500 line-clamp-1 flex-1">&ldquo;{theme.sentences[0]}&rdquo;</span>
                <ArrowRight size={16} className="text-primary group-hover:translate-x-1 transition-transform ml-4" />
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-24 border-t border-zinc-200 pt-16 space-y-16 text-left">
        <section className="space-y-5">
          <h2 className="text-2xl md:text-3xl font-bold">Why sentences are the final step</h2>
          <p className="text-zinc-600 leading-loose font-medium">
            Once individual keys and words are automatic, sentences teach the last skill: <strong className="text-on-surface">
            sustained rhythm</strong> — spacing, punctuation, and keeping accuracy while your speed climbs. Focus on
            typing without errors first; speed follows accuracy, never the other way around. The practice screens are
            shared with our Korean users and appear in Korean, but the flow is simple: type the sentence shown. If
            sentences still feel like a stretch, warm up with{' '}
            <Link prefetch={false} href="/en/practice/word" className="text-primary font-bold underline underline-offset-2">
              word practice
            </Link>{' '}
            first, or measure where you stand with the{' '}
            <Link prefetch={false} href="/en/test" className="text-primary font-bold underline underline-offset-2">
              1-minute speed test
            </Link>
            .
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
