import type { Metadata } from 'next';
import { ENGLISH_OPEN_GRAPH } from '@/lib/i18n/english-metadata';
import Link from 'next/link';
import { Keyboard, Monitor, Apple, Smartphone, ChevronRight } from 'lucide-react';
import { localeAlternates } from '@/lib/i18n/alternates';

const FAQ = [
  {
    q: 'Can I type Korean without a Korean keyboard?',
    a: 'Yes — every keyboard can type Korean. Hangul input is handled by software (the IME), not the physical keyboard. Enable Korean input on your OS and your QWERTY keyboard produces Hangul. Koreans themselves type on keyboards with both English and Korean printed on the keycaps, using the exact same key positions you will learn here.',
  },
  {
    q: 'Do I need keyboard stickers to learn the Korean layout?',
    a: 'No. The on-screen keyboard shows the Hangul key positions, so stickers are optional. If you use stickers at first, gradually try looking at the screen instead. Learn at your own pace; there is no fixed number of days needed to memorize the layout.',
  },
  {
    q: 'What is the difference between 2-set and 3-set Korean keyboards?',
    a: 'The 2-set (두벌식, Dubeolsik) layout is the South Korean standard — consonants on the left hand, vowels on the right — and it is what virtually everyone uses, including this site. The 3-set (세벌식) layout is a niche alternative. As a learner, choose 2-set without hesitation.',
  },
  {
    q: 'How does Hangul turn keystrokes into syllable blocks?',
    a: 'Automatically. You type letters in order — ㅎ, ㅏ, ㄴ — and the IME composes them into the syllable block 한 as you type. You never draw or select the block yourself; if you can spell the sounds in order, you can type the word.',
  },
];

export const metadata: Metadata = {
  title: 'How to Type in Korean - Setup & Layout Guide',
  description:
    'Learn how to type in Korean on any English keyboard: set up the Korean IME on Windows, Mac or phone, learn the 2-set Hangul layout, and start practicing free.',
  keywords: [
    'how to type in korean',
    'korean typing practice with english keyboard',
    'korean keyboard layout',
    'type korean on english keyboard',
    'korean ime setup',
    'hangul keyboard',
    'learn korean typing',
  ],
  alternates: localeAlternates('/guide', 'en'),
  openGraph: {
    ...ENGLISH_OPEN_GRAPH,
    title: 'How to Type in Korean - Complete Beginner Guide',
    description: 'Set up Korean input on any device, learn the Hangul layout, and start typing Korean today.',
    url: 'https://www.hangul-tajawang.com/en/guide',
    locale: 'en_US',
    siteName: 'Hangul Tajawang',
  },
};

export default function EnGuidePage() {
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: 'How to Type in Korean on an English Keyboard',
      description:
        'Enable the Korean input method on your device, learn the 2-set Hangul keyboard layout, and practice typing Korean.',
      step: [
        { '@type': 'HowToStep', name: 'Enable Korean input', text: 'Add Korean (Microsoft IME or 2-Set Korean) in your OS language settings.' },
        { '@type': 'HowToStep', name: 'Learn to switch languages', text: 'Toggle between English and Korean with Right Alt (Windows) or Caps Lock / Control-Space (Mac).' },
        { '@type': 'HowToStep', name: 'Learn the layout', text: 'Memorize the 2-set layout: consonants on the left hand, vowels on the right.' },
        { '@type': 'HowToStep', name: 'Practice daily', text: 'Drill key positions, then words, then sentences, 10–15 minutes a day.' },
      ],
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
    <div className="w-full max-w-4xl mx-auto py-16 px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <article className="prose prose-lg max-w-none text-zinc-700">
        <div className="text-center mb-14 not-prose">
          <p className="text-xs font-semibold tracking-[0.25em] text-primary uppercase mb-3">Beginner Guide</p>
          <h1 className="serif-display text-4xl md:text-5xl font-bold mb-5 text-on-surface">How to Type in Korean</h1>
          <p className="text-zinc-600 text-lg md:text-xl leading-relaxed">
            Everything you need to go from &ldquo;I can read Hangul&rdquo; to typing Korean comfortably —
            on the English keyboard you already own.
          </p>
        </div>

        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-on-surface mb-4">
            You don&rsquo;t need a Korean keyboard
          </h2>
          <p className="leading-loose mb-4">
            The most common misconception about Korean typing: that you need special hardware. You don&rsquo;t. Korean
            input works through an <strong>IME (Input Method Editor)</strong> — a piece of software built into every
            operating system that turns ordinary QWERTY keystrokes into Hangul. Press the key labeled{' '}
            <code>D</code> and the IME writes <code>ㅇ</code>; press <code>K</code> and it writes <code>ㅏ</code>; the
            two compose into 아 on their own. Every Korean speaker types this way, on the same physical keyboard you
            have.
          </p>
        </section>

        <section className="mb-12 not-prose">
          <h2 className="text-2xl md:text-3xl font-bold text-on-surface mb-6">Step 1 — Enable Korean input on your device</h2>
          <div className="space-y-4">
            <div className="bg-surface-low p-6 rounded-2xl border border-surface-high">
              <h3 className="font-bold text-on-surface mb-2 flex items-center gap-2">
                <Monitor size={18} className="text-primary" /> Windows
              </h3>
              <p className="text-sm text-zinc-600 leading-relaxed">
                Settings → Time &amp; Language → Language &amp; Region → <strong>Add a language → 한국어 (Korean)</strong>.
                Windows installs the Microsoft Korean IME automatically. Switch between English and Hangul with{' '}
                <strong>Right&nbsp;Alt</strong> (labeled 한/영 on Korean keyboards) or <strong>Win + Space</strong>.
              </p>
            </div>
            <div className="bg-surface-low p-6 rounded-2xl border border-surface-high">
              <h3 className="font-bold text-on-surface mb-2 flex items-center gap-2">
                <Apple size={18} className="text-primary" /> macOS
              </h3>
              <p className="text-sm text-zinc-600 leading-relaxed">
                System Settings → Keyboard → Input Sources → Edit → <strong>+ → Korean → 2-Set Korean</strong>.
                Switch input with <strong>Control + Space</strong> or the Caps Lock key (configurable). Choose 2-Set —
                it is the standard layout this site teaches.
              </p>
            </div>
            <div className="bg-surface-low p-6 rounded-2xl border border-surface-high">
              <h3 className="font-bold text-on-surface mb-2 flex items-center gap-2">
                <Smartphone size={18} className="text-primary" /> iPhone &amp; Android
              </h3>
              <p className="text-sm text-zinc-600 leading-relaxed">
                Add the Korean keyboard in your keyboard settings. On phones, the <strong>standard (QWERTY-style) Korean
                keyboard</strong> mirrors the desktop 2-set layout — practicing on desktop transfers directly to your
                phone.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-on-surface mb-4">Step 2 — Understand the 2-set Hangul layout</h2>
          <p className="leading-loose mb-4">
            The South Korean standard layout is called <strong>2-set (두벌식, Dubeolsik)</strong>, and it has one
            elegant rule that makes it easy to learn: <strong>consonants live under your left hand, vowels under your
            right</strong>. Since every Korean syllable alternates consonant–vowel, your hands fall into a natural
            left-right-left rhythm — one reason Korean is genuinely pleasant to type.
          </p>
          <ul className="leading-loose">
            <li>
              <strong>Home row:</strong> ㅁㄴㅇㄹ under the left fingers (A S D F), ㅓㅏㅣ under the right (J K L).
              The bumps on F and J are your anchors.
            </li>
            <li>
              <strong>Shift for tense consonants:</strong> ㄲ ㄸ ㅃ ㅆ ㅉ are Shift + the basic consonant. Compound
              vowels like ㅘ are typed as their parts: ㅗ then ㅏ.
            </li>
            <li>
              <strong>Syllables build themselves:</strong> type ㅎ ㅏ ㄴ and the IME composes 한. No special keys, no
              selecting from menus.
            </li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-on-surface mb-4">Step 3 — Practice, in the right order</h2>
          <p className="leading-loose mb-6">
            Reading about the layout gets you nothing; typing it does. Follow the same path Korean schoolkids use, 10–15
            minutes a day:
          </p>
          <ol className="leading-loose list-decimal pl-6">
            <li>
              <Link prefetch={false} href="/en/practice/position" className="text-primary font-bold underline underline-offset-2">
                Key position practice
              </Link>{' '}
              — learn where every letter lives, with the correct finger. 2–3 days.
            </li>
            <li>
              <Link prefetch={false} href="/en/practice/word" className="text-primary font-bold underline underline-offset-2">
                Word practice
              </Link>{' '}
              — chain letters into real Korean words until syllables flow. 1–2 weeks.
            </li>
            <li>
              <Link prefetch={false} href="/en/practice/short" className="text-primary font-bold underline underline-offset-2">
                Sentence practice
              </Link>{' '}
              — build sustained rhythm with proverbs and quotes.
            </li>
            <li>
              <Link prefetch={false} href="/en/test" className="text-primary font-bold underline underline-offset-2">
                Speed test
              </Link>{' '}
              — measure your CPM weekly and watch the tier climb. Mix in{' '}
              <Link prefetch={false} href="/en/game" className="text-primary font-bold underline underline-offset-2">
                typing games
              </Link>{' '}
              whenever drills feel dry.
            </li>
          </ol>
        </section>

        <section className="mb-16 not-prose">
          <h2 className="text-2xl md:text-3xl font-bold text-on-surface mb-6">Frequently asked questions</h2>
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

        <div className="not-prose text-center p-10 bg-on-surface rounded-2xl text-white">
          <Keyboard className="w-10 h-10 mx-auto mb-4 opacity-80" />
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Korean input enabled? Start typing.</h2>
          <p className="text-blue-100 font-medium mb-8">Five minutes of position practice beats an hour of reading about it.</p>
          <Link
            prefetch={false}
            href="/en/practice/position"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 font-bold rounded-2xl hover:scale-105 transition-all shadow-xl"
          >
            Start Position Practice <ChevronRight size={20} />
          </Link>
        </div>
      </article>
    </div>
  );
}
