import type { Metadata } from 'next';
import { ENGLISH_OPEN_GRAPH } from '@/lib/i18n/english-metadata';
import { WordGame } from '@/components/game/WordGame';
import { GameJsonLd } from '@/components/seo/GameJsonLd';
import { GamePageShell } from '../GamePageShell';
import { localeAlternates } from '@/lib/i18n/alternates';

export const metadata: Metadata = {
  title: 'Acid Rain - Korean Word Rain Typing Game (Free)',
  description:
    "Play Acid Rain (산성비), Korea's classic word-rain typing game, free online. Type falling Korean words before they hit the ground and climb the live leaderboard.",
  keywords: ['acid rain typing game', 'korean typing game', 'word rain game', 'hangul typing game', 'korean word game'],
  alternates: localeAlternates('/game/acid-rain', 'en'),
  openGraph: {
    ...ENGLISH_OPEN_GRAPH,
    title: 'Acid Rain - Korean Word Rain Typing Game',
    description: 'Type falling Korean words before they hit the ground — the classic Korean typing game, free online.',
    url: 'https://www.hangul-tajawang.com/en/game/acid-rain',
    locale: 'en_US',
    siteName: 'Hangul Tajawang',
  },
};

export default function EnAcidRainPage() {
  return (
    <>
      <GameJsonLd
        name="Acid Rain (Korean Word Rain)"
        alternateName="산성비 게임"
        url="https://www.hangul-tajawang.com/en/game/acid-rain"
        description="Classic Korean word-rain typing game: type falling Hangul words before they reach the ground."
        genre={['Word Rain', 'Typing Practice', 'Casual']}
        inLanguage={["en", "ko"]}
        publisherName="Hangul Tajawang"
        priceCurrency="USD"
      />
      <GamePageShell
        eyebrow="Korean Typing Game"
        title="Acid Rain"
        tagline="Korea's classic typing game — words fall from the sky, and only your typing can stop them."
        howTo={[
          'Korean words fall from the top of the screen at increasing speed.',
          'Type a falling word exactly and press Enter to destroy it.',
          'Any word that touches the ground costs you a life — survive as long as you can.',
          'Sign in to post your score to the live leaderboard shared with Korean players.',
        ]}
      >
        <WordGame />
      </GamePageShell>
    </>
  );
}
