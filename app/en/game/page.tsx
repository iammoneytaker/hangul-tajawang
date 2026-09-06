import React from 'react';
import type { Metadata } from 'next';
import { ENGLISH_OPEN_GRAPH } from '@/lib/i18n/english-metadata';
import Link from 'next/link';
import { ChevronRight, Trophy } from 'lucide-react';
import { localeAlternates } from '@/lib/i18n/alternates';

const FAQ = [
  {
    q: 'Do typing games actually improve Korean typing skill?',
    a: 'Yes. Games add time pressure — words falling from the sky, enemies marching at your castle — which trains instant recall of key positions far better than passive repetition. And because they are fun, you naturally practice longer.',
  },
  {
    q: 'Which Korean typing game should I start with?',
    a: 'Typing Race is the gentlest start: you race AI bots at fixed speeds so you always know where you stand. Once comfortable, move to Acid Rain or Block Pop for time pressure, then Castle Defense for the full challenge.',
  },
  {
    q: 'Are there leaderboards?',
    a: 'Yes — sign in (Kakao account, free) and your best score in each game is posted to the live rankings, where you compete with native Korean typists. Chasing a target score is a surprisingly effective practice motivator.',
  },
];

export const metadata: Metadata = {
  title: 'Korean Typing Games - 6 Free Online Hangul Games',
  description:
    'Play six free Korean typing games online: word rain (acid rain), tower defense, racing, memory cards and more. A fun way to build Hangul typing speed, with live leaderboards.',
  keywords: [
    'korean typing game',
    'korean typing games',
    'hangul typing game',
    'acid rain typing game',
    'korean typing practice game',
    'free typing games korean',
  ],
  alternates: localeAlternates('/game', 'en'),
  openGraph: {
    ...ENGLISH_OPEN_GRAPH,
    title: 'Korean Typing Games - Free Online Arcade',
    description: 'Six free Hangul typing games with leaderboards — practice that feels like play.',
    url: 'https://www.hangul-tajawang.com/en/game',
    locale: 'en_US',
    siteName: 'Hangul Tajawang',
  },
};

const GAMES = [
  {
    href: '/en/game/acid-rain',
    icon: <span className="text-5xl" aria-hidden>🌧️</span>,
    title: 'Acid Rain',
    description: 'The classic Korean word-rain game: type falling words before they hit the ground.',
    difficulty: 'Medium',
  },
  {
    href: '/en/game/stairs',
    icon: (
      // eslint-disable-next-line @next/next/no-img-element
      <img src="/game/stairs/card-chick.png" alt="Chick climbing stairs" width={64} height={64} draggable={false} className="w-16 h-16 object-contain select-none pointer-events-none drop-shadow" />
    ),
    title: 'Word Stairs',
    description: 'An endless climb — type each word to carry the chick up one more step.',
    difficulty: 'Medium',
  },
  {
    href: '/en/game/castle-defense',
    icon: (
      // eslint-disable-next-line @next/next/no-img-element
      <img src="/game/castle-defense/castle.png" alt="Pixel-art castle gate" width={64} height={64} draggable={false} className="cd-pixel w-16 h-16 object-contain select-none pointer-events-none drop-shadow-lg" />
    ),
    title: 'Castle Defense',
    description: 'Typing tower defense: type enemy words to fire arrows and survive the waves.',
    difficulty: 'Hard',
  },
  {
    href: '/en/game/card-flip',
    icon: <span className="text-5xl" aria-hidden>🃏</span>,
    title: 'Memory Flip',
    description: 'Flip cards by typing and match the pairs — memory and typing in one game.',
    difficulty: 'Hard',
  },
  {
    href: '/en/game/block-pop',
    icon: <span className="text-5xl" aria-hidden>🧱</span>,
    title: 'Block Pop',
    description: 'Word blocks rise from below — pop them by typing before they reach the ceiling.',
    difficulty: 'Medium',
  },
  {
    href: '/en/game/typing-race',
    icon: <span className="text-5xl" aria-hidden>🏁</span>,
    title: 'Typing Race',
    description: 'Race a turtle, rabbit, and cheetah to the finish line — type words to speed up.',
    difficulty: 'Easy',
  },
];

export default function EnGameHubPage() {
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

      <div className="text-center mb-16">
        <p className="text-xs font-semibold tracking-[0.25em] text-primary uppercase mb-3">Games</p>
        <h1 className="serif-display text-4xl md:text-5xl font-bold mb-4">Korean Typing Games</h1>
        <p className="text-zinc-500 font-medium text-lg">Six free ways to make Hangul typing practice feel like play.</p>
      </div>

      <div className="hub-panel grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {GAMES.map((g) => (
          <Link prefetch={false} key={g.href} href={g.href} className="group keycap-card p-8 flex flex-col">
            <div className="flex items-start justify-between mb-6">
              <div className="w-16 h-16 flex items-center justify-center">{g.icon}</div>
              <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest pt-1">{g.difficulty}</span>
            </div>
            <h2 className="serif-display text-2xl font-bold mb-3 group-hover:text-primary transition-colors">{g.title}</h2>
            <p className="text-zinc-600 leading-relaxed mb-6 text-sm">{g.description}</p>
            <div className="mt-auto flex items-center gap-1 text-sm font-semibold text-on-surface group-hover:text-primary transition-colors">
              Play <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-20 p-10 bg-on-surface rounded-2xl text-white flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
          <Trophy size={180} />
        </div>
        <div className="relative z-10 text-center md:text-left">
          <h2 className="text-3xl font-bold mb-3">Can you beat the Korean players?</h2>
          <p className="text-blue-100 font-medium">
            Every game has a live leaderboard shared with native Korean typists. <br className="hidden sm:block" />
            Set a high score and claim your spot.
          </p>
        </div>
        <Link
          prefetch={false}
          href="/en/game/acid-rain"
          className="relative z-10 px-8 py-4 bg-white text-blue-600 font-bold rounded-2xl hover:scale-105 transition-all flex items-center gap-2 shadow-xl"
        >
          Start Playing <ChevronRight size={20} />
        </Link>
      </div>

      <div className="mt-24 border-t border-zinc-200 pt-16 space-y-16 text-left">
        <section className="space-y-5">
          <h2 className="text-2xl md:text-3xl font-bold">Practice that doesn&rsquo;t feel like practice</h2>
          <p className="text-zinc-600 leading-loose font-medium">
            Repetitive drills build accuracy, but games build <strong className="text-on-surface">speed under
            pressure</strong> — the skill that makes typing feel effortless. Each game uses real Korean words, so
            learners get vocabulary exposure with every round. The game interface is in English here — only the words you
            type are Korean — and every game follows one universal rule: <em>type the word you see</em>.
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
