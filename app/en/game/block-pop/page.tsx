import type { Metadata } from 'next';
import { ENGLISH_OPEN_GRAPH } from '@/lib/i18n/english-metadata';
import { BlockPopGame } from '@/components/game/BlockPopGame';
import { GameJsonLd } from '@/components/seo/GameJsonLd';
import { GamePageShell } from '../GamePageShell';
import { localeAlternates } from '@/lib/i18n/alternates';

export const metadata: Metadata = {
  title: 'Block Pop - Korean Word Block Typing Game (Free)',
  description:
    'Play Block Pop free online: Korean word blocks rise from the bottom — type them to pop them before they reach the ceiling. A fast arcade game for Hangul typing speed.',
  keywords: ['korean typing game', 'block typing game', 'word block game', 'hangul typing game'],
  alternates: localeAlternates('/game/block-pop', 'en'),
  openGraph: {
    ...ENGLISH_OPEN_GRAPH,
    title: 'Block Pop - Korean Word Block Typing Game',
    description: 'Pop the rising word blocks before they reach the ceiling — pure typing arcade.',
    url: 'https://www.hangul-tajawang.com/en/game/block-pop',
    locale: 'en_US',
    siteName: 'Hangul Tajawang',
  },
};

export default function EnBlockPopPage() {
  return (
    <>
      <GameJsonLd
        name="Block Pop Typing Game"
        alternateName="블록 팝핑"
        url="https://www.hangul-tajawang.com/en/game/block-pop"
        description="Arcade Korean typing game: word blocks stack up from the bottom — type their words to pop them before they hit the ceiling."
        genre={['Arcade', 'Typing Practice', 'Casual']}
        inLanguage={["en", "ko"]}
        publisherName="Hangul Tajawang"
        priceCurrency="USD"
      />
      <GamePageShell
        eyebrow="Korean Typing Game"
        title="Block Pop"
        tagline="The blocks keep rising. Your typing is the only thing keeping the ceiling clear."
        howTo={[
          'Rows of Korean word blocks push up from the bottom of the screen.',
          "Type a block's word and press Enter to pop it.",
          'If any block touches the ceiling, the game ends — keep the stack low.',
          'Speed rises over time; sign in to post your score to the leaderboard.',
        ]}
      >
        <BlockPopGame />
      </GamePageShell>
    </>
  );
}
