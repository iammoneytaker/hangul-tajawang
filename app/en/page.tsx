import type { Metadata } from 'next';
import { ENGLISH_OPEN_GRAPH } from '@/lib/i18n/english-metadata';
import Link from 'next/link';
import { Timer, Keyboard, Gamepad2, BookOpen, ChevronRight, CheckCircle2 } from 'lucide-react';
import { localeAlternates } from '@/lib/i18n/alternates';

const FAQ = [
  {
    q: 'Is this Korean typing practice site really free?',
    a: 'Yes. Every feature — the keyboard position drills, word practice, sentence practice, the 1-minute typing speed test, and all six typing games — is completely free, with no sign-up required. Signing in only adds optional extras like saving your practice history and joining the leaderboards.',
  },
  {
    q: 'Can I practice Korean typing with an English keyboard?',
    a: 'Absolutely. You do not need a Korean physical keyboard. Enable the Korean input method (IME) on Windows or macOS, and your regular QWERTY keyboard types Hangul — each key maps to a Korean letter (for example, D types ㅇ and K types ㅏ). Our position practice mode shows you which key produces which Hangul letter, so you can learn the layout even without keycap stickers.',
  },
  {
    q: 'I am a complete beginner. Where should I start?',
    a: 'Start with keyboard position practice to learn where each Hangul letter lives, then move to word practice to build finger memory, and finally sentence practice for real typing flow. When you want to measure progress, take the 1-minute typing speed test — it reports your CPM (characters per minute) and accuracy.',
  },
  {
    q: 'How is Korean typing speed measured?',
    a: 'This site measures Korean typing speed as Hangul keystrokes per minute, also labeled CPM. The syllable 한 counts as 3 strokes: ㅎ + ㅏ + ㄴ. Accuracy is reported separately and affects your D-to-SSS tier. This is not English WPM; compare your results using the same test and settings.',
  },
];

export const metadata: Metadata = {
  title: { absolute: 'Korean Typing Practice - Learn to Type Hangul Free' },
  description:
    'Free Korean typing practice for learners: master the Hangul keyboard, drill words and sentences, play typing games, and test your speed — no sign-up needed.',
  keywords: [
    'korean typing practice',
    'korean typing test',
    'korean typing game',
    'hangul typing practice',
    'learn korean typing',
    'korean typing practice for beginners',
    'korean typing practice with english keyboard',
    'free korean typing',
  ],
  alternates: localeAlternates('/', 'en'),
  openGraph: {
    ...ENGLISH_OPEN_GRAPH,
    title: 'Korean Typing Practice - Learn to Type Hangul Free',
    description:
      'Learn the Hangul keyboard, drill words and sentences, play Korean typing games, and test your speed. 100% free.',
    url: 'https://www.hangul-tajawang.com/en',
    locale: 'en_US',
    siteName: 'Hangul Tajawang',
  },
};

const FEATURES = [
  {
    href: '/en/practice',
    icon: <Keyboard className="w-8 h-8" />,
    title: 'Typing Practice',
    description: 'Step-by-step Hangul drills: key positions → words → sentences. Built for beginners fixing hunt-and-peck habits.',
  },
  {
    href: '/en/test',
    icon: <Timer className="w-8 h-8" />,
    title: '1-Minute Speed Test',
    description: 'Measure your Korean typing speed in CPM with accuracy tracking, get a tier from D to SSS, and share your result card.',
  },
  {
    href: '/en/game',
    icon: <Gamepad2 className="w-8 h-8" />,
    title: 'Typing Games',
    description: 'Six free Korean typing games — word rain, tower defense, racing and more — with live leaderboards.',
  },
  {
    href: '/en/guide',
    icon: <BookOpen className="w-8 h-8" />,
    title: 'How to Type in Korean',
    description: 'New to Hangul input? Learn the 2-set keyboard layout and how to type Korean on your English keyboard.',
  },
];

export default function EnHomePage() {
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Hangul Tajawang - Korean Typing Practice',
      applicationCategory: 'EducationalApplication',
      operatingSystem: 'All',
      url: 'https://www.hangul-tajawang.com/en',
      description:
        'Free online Korean typing practice: Hangul keyboard drills, word and sentence practice, typing games, and a 1-minute typing speed test.',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
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
    <div className="w-full max-w-5xl mx-auto py-12 md:py-20 px-4">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero */}
      <div className="text-center mb-16 md:mb-24">
        <p className="text-xs font-semibold tracking-[0.25em] text-primary uppercase mb-4">100% Free · No Sign-up</p>
        <h1 className="serif-display text-4xl md:text-6xl font-bold mb-6 break-keep">
          Korean Typing Practice
        </h1>
        <p className="text-zinc-600 text-lg md:text-2xl leading-relaxed max-w-3xl mx-auto">
          Learn to type Hangul the right way — from key positions to full sentences.
          Practice, play typing games, and test your speed, all in one place.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            prefetch={false}
            href="/en/practice"
            className="px-8 py-4 primary-gradient text-white font-bold rounded-2xl hover:scale-105 transition-all shadow-xl flex items-center gap-2"
          >
            Start Practicing <ChevronRight size={20} />
          </Link>
          <Link
            prefetch={false}
            href="/en/test"
            className="px-8 py-4 bg-surface-low border border-surface-high text-on-surface font-bold rounded-2xl hover:border-primary/50 transition-all flex items-center gap-2"
          >
            Take the Speed Test
          </Link>
        </div>
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20 md:mb-28">
        {FEATURES.map((f) => (
          <Link
            prefetch={false}
            key={f.href}
            href={f.href}
            className="group flex flex-col bg-surface-low p-8 rounded-2xl border border-surface-high hover:border-primary/50 transition-all hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,74,198,0.1)]"
          >
            <div className="text-primary mb-5">{f.icon}</div>
            <h2 className="text-2xl font-bold text-on-surface mb-3 group-hover:text-primary transition-colors">{f.title}</h2>
            <p className="text-sm font-medium text-zinc-500 leading-relaxed mb-6">{f.description}</p>
            <span className="mt-auto flex items-center gap-1 text-sm font-semibold text-on-surface group-hover:text-primary transition-colors">
              Open <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
        ))}
      </div>

      {/* Why practice here */}
      <section className="mb-20 md:mb-28">
        <h2 className="text-2xl md:text-3xl font-bold mb-6">Why practice Korean typing here?</h2>
        <p className="text-zinc-600 leading-loose font-medium mb-8">
          Hangul Tajawang (한글타자왕, &ldquo;Korean Typing King&rdquo;) offers free typing
          practice for Korean speakers and learners. Everything you practice here
          is authentic Korean text — real words, real sentences — typed on the standard 2-set (두벌식) keyboard layout
          that virtually all Koreans use. If you are learning Korean, typing is one of the fastest ways to internalize
          Hangul: your fingers learn to break syllables like 한 into ㅎ + ㅏ + ㄴ automatically.
        </p>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            'Structured path: key positions → words → sentences',
            'Real-time CPM (characters per minute) and accuracy tracking',
            'Six arcade-style Korean typing games with leaderboards',
            'Works with any QWERTY keyboard — just enable the Korean IME',
          ].map((t) => (
            <li key={t} className="flex items-start gap-3 p-4 bg-surface-lowest rounded-xl border border-surface-high">
              <CheckCircle2 size={18} className="text-primary mt-0.5 shrink-0" />
              <span className="text-sm text-zinc-600 font-medium leading-relaxed">{t}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* FAQ */}
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
