import type { Metadata } from 'next';
import { ENGLISH_OPEN_GRAPH } from '@/lib/i18n/english-metadata';
import { CardFlipGame } from '@/components/game/CardFlipGame';
import { GameJsonLd } from '@/components/seo/GameJsonLd';
import { GamePageShell } from '../GamePageShell';
import { localeAlternates } from '@/lib/i18n/alternates';

export const metadata: Metadata = {
  title: 'Memory Flip - Korean Typing Card Matching Game',
  description:
    'Play Memory Flip free online: flip cards by typing Korean words and match the pairs. A brain-training typing game that sharpens memory and Hangul speed at once.',
  keywords: ['korean typing game', 'memory card game', 'typing memory game', 'hangul typing game'],
  alternates: localeAlternates('/game/card-flip', 'en'),
  openGraph: {
    ...ENGLISH_OPEN_GRAPH,
    title: 'Memory Flip - Korean Typing Card Game',
    description: 'No mouse allowed — flip every card by typing and find the matching pairs.',
    url: 'https://www.hangul-tajawang.com/en/game/card-flip',
    locale: 'en_US',
    siteName: 'Hangul Tajawang',
  },
};

export default function EnCardFlipPage() {
  return (
    <>
      <GameJsonLd
        name="Memory Flip Typing Game"
        alternateName="기억력 타자"
        url="https://www.hangul-tajawang.com/en/game/card-flip"
        description="Card-matching memory game played entirely by typing: type a card's Korean word to flip it and find the pairs."
        genre={['Memory', 'Typing Practice', 'Puzzle']}
        inLanguage={["en", "ko"]}
        publisherName="Hangul Tajawang"
        priceCurrency="USD"
      />
      <GamePageShell
        eyebrow="Korean Typing Game"
        title="Memory Flip"
        tagline="A memory card game with a twist: your keyboard is the only way to flip a card."
        howTo={[
          'Each face-down card is labeled with a Korean word.',
          'Type a word and press Enter to flip that card over.',
          'Flip two matching cards in a row to clear the pair — clear the board to win.',
          'Fewer flips and faster times mean a higher score on the leaderboard.',
        ]}
      >
        <CardFlipGame />
      </GamePageShell>
    </>
  );
}
