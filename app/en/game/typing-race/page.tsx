import type { Metadata } from 'next';
import { ENGLISH_OPEN_GRAPH } from '@/lib/i18n/english-metadata';
import { TypingRaceGame } from '@/components/game/TypingRaceGame';
import { GameJsonLd } from '@/components/seo/GameJsonLd';
import { GamePageShell } from '../GamePageShell';
import { localeAlternates } from '@/lib/i18n/alternates';

export const metadata: Metadata = {
  title: 'Typing Race - Korean Typing Speed Race Game (Free)',
  description:
    'Play Typing Race free online: race a turtle, rabbit, and cheetah by typing Korean words. See your real CPM compared live — the friendliest Korean typing game for beginners.',
  keywords: ['korean typing game', 'typing race game', 'typing speed game', 'hangul typing game for beginners'],
  alternates: localeAlternates('/game/typing-race', 'en'),
  openGraph: {
    ...ENGLISH_OPEN_GRAPH,
    title: 'Typing Race - Korean Typing Speed Race',
    description: 'Race AI animals to the finish line and see how your Korean typing speed stacks up.',
    url: 'https://www.hangul-tajawang.com/en/game/typing-race',
    locale: 'en_US',
    siteName: 'Hangul Tajawang',
  },
};

export default function EnTypingRacePage() {
  return (
    <>
      <GameJsonLd
        name="Korean Typing Race"
        alternateName="타자 레이스"
        url="https://www.hangul-tajawang.com/en/game/typing-race"
        description="Race AI opponents at fixed speeds by typing Korean words — a beginner-friendly way to benchmark your CPM."
        genre={['Racing', 'Typing Practice', 'Casual']}
        inLanguage={["en", "ko"]}
        publisherName="Hangul Tajawang"
        priceCurrency="USD"
      />
      <GamePageShell
        eyebrow="Korean Typing Game"
        title="Typing Race"
        tagline="Turtle, rabbit, or cheetah — which one can your typing speed actually beat?"
        howTo={[
          'Type the Korean words shown to push your racer toward the finish line.',
          'The turtle, rabbit, and cheetah race at fixed speeds (roughly 200, 350, and 500 CPM).',
          'Beat an animal and you know your real typing level — no test anxiety required.',
          'The friendliest place to start if time-pressure games feel stressful.',
        ]}
      >
        <TypingRaceGame />
      </GamePageShell>
    </>
  );
}
