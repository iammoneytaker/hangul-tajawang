import type { Metadata } from 'next';
import { ENGLISH_OPEN_GRAPH } from '@/lib/i18n/english-metadata';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { localeAlternates } from '@/lib/i18n/alternates';

const FAQ = [
  {
    q: 'In what order should I practice Korean typing?',
    a: 'If you do not know the Hangul keyboard yet, go in order: key position practice → word practice → sentence practice. Your fingers need to memorize where each letter lives before words and sentences feel natural. If you already know the layout, jump straight into words or sentences.',
  },
  {
    q: 'How long should I practice each day?',
    a: 'Try a manageable routine, such as 10–15 minutes a day. Practice accurately, take breaks when your hands feel tired, and compare your own results over time. Progress depends on your starting point and how consistently you practice.',
  },
  {
    q: 'Do I need to install anything or create an account?',
    a: 'No. Everything runs in your browser and is free without sign-up. You only need the Korean input method (IME) enabled on your computer — see our guide on how to type in Korean if you have not set it up yet.',
  },
];

export const metadata: Metadata = {
  title: 'Korean Typing Practice for Beginners',
  description:
    'Free step-by-step Korean typing practice: learn Hangul key positions, drill real Korean words, and type full sentences with an English guide for beginners.',
  keywords: [
    'korean typing practice',
    'korean typing practice for beginners',
    'hangul typing practice',
    'learn korean typing',
    'korean keyboard practice',
    'korean typing lessons',
  ],
  alternates: localeAlternates('/practice', 'en'),
  openGraph: {
    ...ENGLISH_OPEN_GRAPH,
    title: 'Korean Typing Practice - Choose Your Mode',
    description: 'Key positions, words, or sentences — pick a mode and start building Korean typing speed.',
    url: 'https://www.hangul-tajawang.com/en/practice',
    locale: 'en_US',
    siteName: 'Hangul Tajawang',
  },
};

const MODES = [
  {
    href: '/en/practice/position',
    key: 'ㅁ',
    title: 'Key Position Practice',
    description:
      'Learn where every Hangul letter lives on the keyboard, row by row, with the correct finger for each key. Start here if you are new to the Korean layout.',
    level: 'Beginner',
  },
  {
    href: '/en/practice/word',
    key: '말',
    title: 'Word Practice',
    description:
      'Type real Korean words grouped by keyboard row. This is where finger memory turns into actual speed — the most important stage for beginners.',
    level: 'Beginner–Intermediate',
  },
  {
    href: '/en/practice/short',
    key: '글',
    title: 'Sentence Practice',
    description:
      'Type short Korean sentences — proverbs, quotes, and encouraging lines — with live CPM and accuracy tracking. Great for rhythm and flow.',
    level: 'Intermediate',
  },
  {
    href: '/en/transcription',
    key: '책',
    title: 'Literature Transcription',
    description:
      'The final stage: transcribe full Korean poems and stories on a manuscript-paper screen. Long-form endurance, real vocabulary, lasting records.',
    level: 'Intermediate–Advanced',
  },
];

export default function EnPracticeHubPage() {
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
        <p className="text-xs font-semibold tracking-[0.25em] text-primary uppercase mb-3">Practice Modes</p>
        <h1 className="serif-display text-4xl md:text-5xl font-bold mb-6">Korean Typing Practice for Beginners</h1>
        <p className="text-zinc-500 font-medium text-lg leading-relaxed">
          Four stages, one path: learn the keys, master words, flow through sentences, then transcribe real literature.{' '}
          <br className="hidden md:block" />
          All practice text is Korean, with English explanations to help you get started.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
        {MODES.map((m) => (
          <Link
            prefetch={false}
            key={m.href}
            href={m.href}
            className="group flex flex-col bg-surface-low p-8 rounded-2xl border border-surface-high hover:border-primary/50 transition-all hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,74,198,0.1)]"
          >
            <div className="w-14 h-14 mb-6 primary-gradient rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {m.key}
            </div>
            <span className="text-[10px] font-bold uppercase text-primary tracking-widest mb-2">{m.level}</span>
            <h2 className="text-2xl font-bold text-on-surface mb-3 group-hover:text-primary transition-colors">{m.title}</h2>
            <p className="text-sm font-medium text-zinc-500 leading-relaxed mb-6">{m.description}</p>
            <span className="mt-auto flex items-center gap-1 text-sm font-semibold text-on-surface group-hover:text-primary transition-colors">
              Start <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
        ))}
      </div>

      <section className="mb-16">
        <h2 className="text-2xl md:text-3xl font-bold mb-5">The proven path to Korean typing speed</h2>
        <p className="text-zinc-600 leading-loose font-medium">
          Korean typing is easier than it looks: the standard 2-set (두벌식) layout puts all consonants under your left
          hand and all vowels under your right, so syllables fall into a natural left-right rhythm. The mistake most
          learners make is skipping straight to sentences. Follow the order Koreans themselves learn in —{' '}
          <strong className="text-on-surface">positions, then words, then sentences</strong> — and you will type without
          looking at the keyboard within weeks. Ready to check your progress? Take the{' '}
          <Link prefetch={false} href="/en/test" className="text-primary font-bold underline underline-offset-2">
            1-minute Korean typing speed test
          </Link>
          .
        </p>
      </section>

      <section>
        <h2 className="text-2xl md:text-3xl font-bold mb-6">Frequently asked questions</h2>
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
  );
}
