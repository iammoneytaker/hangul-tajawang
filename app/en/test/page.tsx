import type { Metadata } from 'next';
import { ENGLISH_OPEN_GRAPH } from '@/lib/i18n/english-metadata';
import Link from 'next/link';
import { SpeedTest } from '@/components/test/SpeedTest';
import { localeAlternates } from '@/lib/i18n/alternates';

const FAQ = [
  {
    q: 'How does the Korean typing speed test work?',
    a: 'Press start and type the Korean sentences shown on screen. The 60-second timer starts the moment you type your first character, and each completed sentence automatically loads the next one. When time is up you get your CPM (characters per minute), accuracy, and a typing tier.',
  },
  {
    q: 'How is CPM calculated for Korean?',
    a: 'The test counts Hangul keystrokes in the text you enter during 60 seconds, including mistyped text. The syllable 한 counts as 3 strokes: ㅎ + ㅏ + ㄴ. Accuracy is measured separately by comparing your entered characters with the target. CPM here is not English WPM.',
  },
  {
    q: 'What do the typing tiers mean?',
    a: 'At 95% accuracy or higher, 600+ CPM is SSS, 500+ SS, 400+ S, 300+ A, 200+ B, 100+ C, and below 100 is D. At 90–94% accuracy, the tier score is 90% of CPM and capped below A, so B is the highest possible tier. Below 90% accuracy, the tier is D regardless of speed.',
  },
  {
    q: 'The test is in Korean — can I still use it as a learner?',
    a: 'Yes, that is the point: the test uses real Korean sentences, which is exactly what you need to practice. If the sentences feel too hard, warm up with word practice first, then come back to measure your progress.',
  },
];

export const metadata: Metadata = {
  title: 'Korean Typing Speed Test - Free 1-Minute CPM Test',
  description:
    'Test your Korean typing speed free in 60 seconds. Type real Korean sentences, get your CPM (characters per minute) and accuracy, and earn a typing tier from D to SSS.',
  keywords: [
    'korean typing test',
    'korean typing speed test',
    'korean wpm test',
    'korean cpm test',
    'hangul typing test',
    'free korean typing test',
  ],
  alternates: localeAlternates('/test', 'en'),
  openGraph: {
    ...ENGLISH_OPEN_GRAPH,
    title: 'Korean Typing Speed Test - What Is Your Tier?',
    description: 'Measure your Korean typing speed and accuracy in 1 minute and share your tier card.',
    url: 'https://www.hangul-tajawang.com/en/test',
    locale: 'en_US',
    siteName: 'Hangul Tajawang',
  },
};

export default function EnSpeedTestPage() {
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Korean Typing Speed Test',
      applicationCategory: 'EducationalApplication',
      operatingSystem: 'All',
      url: 'https://www.hangul-tajawang.com/en/test',
      description:
        'Free 60-second Korean typing speed test measuring CPM (characters per minute) and accuracy, with a shareable typing tier.',
      author: { '@type': 'Organization', name: 'Hangul Tajawang' },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: FAQ.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
  ];

  return (
    <div className="w-full py-6 md:py-12 text-on-surface">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="text-center mb-6 md:mb-10 px-4">
        <p className="text-xs font-semibold tracking-[0.25em] text-primary uppercase mb-3">Speed Test · 60s</p>
        <h1 className="serif-display text-3xl md:text-5xl font-bold mb-4">Korean Typing Speed Test</h1>
        <p className="text-zinc-600 text-base md:text-xl leading-relaxed break-keep">
          How fast can you type Hangul? Measure your <strong className="text-on-surface">CPM and accuracy</strong> in
          60 seconds and get your typing tier. The test controls below are currently in Korean; press 테스트 시작하기 to start.
        </p>
      </div>

      <div lang="ko"><SpeedTest /></div>

      <div className="max-w-4xl mx-auto mt-16 md:mt-24 px-6 grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-surface-high pt-12 md:pt-16">
        <section>
          <h2 className="text-lg font-bold mb-4 pb-2 border-b-2 border-primary inline-block">Per-jamo measurement</h2>
          <p className="text-sm text-zinc-500 leading-relaxed">
            Speed is counted per Hangul letter, the standard used by Korean typing tutors: 한 = ㅎ + ㅏ + ㄴ = 3
            keystrokes. Typos reduce your accuracy score, so the result reflects your real skill.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-bold mb-4 pb-2 border-b-2 border-tertiary inline-block">Shareable tier card</h2>
          <p className="text-sm text-zinc-500 leading-relaxed">
            When the test ends you receive a tier from D up to SSS on a result card you can save as an image and share
            — challenge your friends or your study group.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-bold mb-4 pb-2 border-b-2 border-success inline-block">Measure, then improve</h2>
          <p className="text-sm text-zinc-500 leading-relaxed">
            Want to improve your own previous score? Build speed with{' '}
            <Link prefetch={false} href="/en/practice" className="text-primary font-bold underline underline-offset-2">
              step-by-step practice
            </Link>{' '}
            or make it fun with{' '}
            <Link prefetch={false} href="/en/game" className="text-primary font-bold underline underline-offset-2">
              typing games
            </Link>
            .
          </p>
        </section>
      </div>

      <div className="max-w-4xl mx-auto mt-12 md:mt-16 px-6">
        <h2 className="text-2xl font-bold mb-6">Frequently asked questions</h2>
        <dl className="divide-y divide-outline-variant border-y border-outline-variant">
          {FAQ.map((f) => (
            <div key={f.q} className="py-5 px-1">
              <dt className="font-bold mb-2">{f.q}</dt>
              <dd className="text-sm text-zinc-600 leading-relaxed">{f.a}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
