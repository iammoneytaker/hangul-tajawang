import type { Metadata } from 'next';
import { ENGLISH_OPEN_GRAPH } from '@/lib/i18n/english-metadata';
import Link from 'next/link';
import { BookOpen, PenTool, ArrowRight, Sparkles } from 'lucide-react';
import { localeAlternates } from '@/lib/i18n/alternates';

// 학습자에게 소개할 대표작 — 개별 화면(/transcription/[id])은 한국어 UI 공유
import { FEATURED_WORKS } from '@/lib/i18n/practice-content';

const FAQ = [
  {
    q: 'What is pilsa (transcription practice)?',
    a: 'Pilsa (필사) is the Korean tradition of copying out good writing word by word — here, by typing. You read each sentence slowly as you type it, which quietly drills sentence structure, spelling, and vocabulary into memory. It is a beloved study method in Korea, and it doubles as the best long-form typing practice there is.',
  },
  {
    q: 'Is my Korean good enough for literature?',
    a: 'If you can read Hangul, yes. Transcription is copying, not composing — the text is always in front of you. Start with a beginner poem like Azaleas (진달래꽃): short lines, repeated words, and you will have typed a masterpiece of Korean literature on your first day.',
  },
  {
    q: 'Why type full literary works instead of drill sentences?',
    a: 'Long texts train endurance and rhythm that short drills cannot: page-length focus, natural punctuation, and the varied vocabulary of real writing. Your CPM, accuracy, and completion history are tracked, so each finished work becomes a record of progress.',
  },
];

export const metadata: Metadata = {
  title: 'Type Korean Literature - Pilsa Practice',
  description:
    'Practice long-form Korean typing by transcribing real literature — poems by Yun Dong-ju and Kim So-wol, tales, and novel excerpts. Free pilsa practice.',
  keywords: [
    'korean transcription practice',
    'type korean literature',
    'korean long text typing practice',
    'pilsa',
    'korean poems typing',
    'korean typing practice',
  ],
  alternates: localeAlternates('/transcription', 'en'),
  openGraph: {
    ...ENGLISH_OPEN_GRAPH,
    title: 'Type Korean Literature - Transcription Practice',
    description: 'Transcribe Korean poems and stories on a manuscript-paper screen — the final stage of Korean typing practice.',
    url: 'https://www.hangul-tajawang.com/en/transcription',
    locale: 'en_US',
    siteName: 'Hangul Tajawang',
  },
};

export default function EnTranscriptionPage() {
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
    <div className="w-full max-w-4xl mx-auto py-12 px-4">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="text-center mb-14">
        <p className="text-xs font-semibold tracking-[0.25em] text-primary uppercase mb-3">Transcription · 필사</p>
        <h1 className="serif-display text-4xl md:text-5xl font-bold mb-6">Type Korean Literature</h1>
        <p className="text-zinc-500 font-medium text-lg md:text-xl leading-relaxed">
          The final stage of Korean typing practice: transcribe real poems and stories,{' '}
          <br className="hidden md:block" />
          on a manuscript-paper screen. English controls guide you from start to finish.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-16">
        {FEATURED_WORKS.map((w) => (
          <Link
            prefetch={false}
            key={w.id}
            href={`/en/transcription/${w.id}`}
            className="group flex flex-col bg-surface-low p-7 rounded-2xl border border-surface-high hover:border-primary/50 transition-all hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,74,198,0.1)]"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase text-primary tracking-widest bg-primary/10 px-3 py-1 rounded-full">
                {w.type} · {w.level}
              </span>
              <PenTool size={16} className="text-zinc-300 group-hover:text-primary transition-colors" />
            </div>
            <h2 className="text-2xl font-bold text-on-surface group-hover:text-primary transition-colors">{w.ko}</h2>
            <p className="text-sm font-medium text-zinc-500 mb-4">
              {w.en} — {w.author}
            </p>
            <span className="mt-auto flex items-center gap-1 text-sm font-semibold text-on-surface group-hover:text-primary transition-colors">
              Start transcribing <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
        ))}
      </div>

      <div className="p-8 bg-surface-lowest rounded-2xl border border-surface-high mb-16 flex items-start gap-4">
        <Sparkles size={22} className="text-primary shrink-0 mt-1" />
        <p className="text-sm text-zinc-600 leading-relaxed font-medium">
          These six are learner-friendly picks from our library of <strong className="text-on-surface">55+ complete
          Korean works</strong>. Browse the full collection (poems, essays, novels, tales) on the{' '}
          <Link prefetch={false} href="/transcription" className="text-primary font-bold underline underline-offset-2">
            Korean transcription page
          </Link>
          (Korean interface). The six picks above have English practice screens.
        </p>
      </div>

      <div className="space-y-16">
        <section className="space-y-5">
          <div className="flex items-center gap-3 text-primary">
            <BookOpen size={26} />
            <h2 className="text-2xl md:text-3xl font-bold">Why transcription is a learner&rsquo;s secret weapon</h2>
          </div>
          <p className="text-zinc-600 leading-loose font-medium">
            Koreans call it pilsa (필사) — copying great writing to absorb it. Typing a poem forces you to read every
            syllable at typing speed: slow enough to notice particles and spelling, fast enough to stay in flow. You
            finish with measurable typing stats <em>and</em> a Korean masterpiece you have read more closely than any
            skim could manage. Warm up with{' '}
            <Link prefetch={false} href="/en/practice/short" className="text-primary font-bold underline underline-offset-2">
              sentence practice
            </Link>{' '}
            if full works feel too long.
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
