import type { Metadata } from 'next';
import { ENGLISH_OPEN_GRAPH } from '@/lib/i18n/english-metadata';
import { StairsGame } from '@/components/game/StairsGame';
import { GameJsonLd } from '@/components/seo/GameJsonLd';
import { GamePageShell } from '../GamePageShell';
import { localeAlternates } from '@/lib/i18n/alternates';

export const metadata: Metadata = {
  title: 'Word Stairs - Endless Korean Typing Game (Free)',
  description:
    'Play Word Stairs free online: type Korean words to climb an endless staircase with a tiny chick. A relaxing endless-runner typing game for building Hangul speed.',
  keywords: ['korean typing game', 'endless typing game', 'hangul typing game', 'word stairs game'],
  alternates: localeAlternates('/game/stairs', 'en'),
  openGraph: {
    ...ENGLISH_OPEN_GRAPH,
    title: 'Word Stairs - Endless Korean Typing Game',
    description: 'Type each word to climb one more step — how high can you carry the chick?',
    url: 'https://www.hangul-tajawang.com/en/game/stairs',
    locale: 'en_US',
    siteName: 'Hangul Tajawang',
  },
};

export default function EnStairsPage() {
  return (
    <>
      <GameJsonLd
        name="Word Stairs"
        alternateName="글자 계단"
        url="https://www.hangul-tajawang.com/en/game/stairs"
        description="Endless Korean typing game: type each word to climb the staircase one step at a time."
        genre={['Endless Runner', 'Typing Practice', 'Casual']}
        inLanguage={["en", "ko"]}
        publisherName="Hangul Tajawang"
        priceCurrency="USD"
      />
      <GamePageShell
        eyebrow="Korean Typing Game"
        title="Word Stairs"
        tagline="An endless staircase, a determined chick, and your typing — climb one word at a time."
        howTo={[
          'A Korean word appears on the next stair step.',
          'Type it correctly to hop up one step; the pace slowly increases.',
          'Hesitate too long and the stairs crumble — the run ends.',
          'Sign in to post your highest climb to the leaderboard.',
        ]}
      >
        <StairsGame />
      </GamePageShell>
    </>
  );
}
