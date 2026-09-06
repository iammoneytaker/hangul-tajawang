import type { Metadata } from 'next';
import { ENGLISH_OPEN_GRAPH } from '@/lib/i18n/english-metadata';
import { TypingDefenseGame } from '@/components/game/TypingDefenseGame';
import { GameJsonLd } from '@/components/seo/GameJsonLd';
import { GamePageShell } from '../GamePageShell';
import { localeAlternates } from '@/lib/i18n/alternates';

export const metadata: Metadata = {
  title: 'Castle Defense - Korean Typing Tower Defense Game',
  description:
    'Play Castle Defense free online: a Korean typing tower defense game. Type enemy words to fire arrows, survive waves and bosses, and defend your gate with pure typing speed.',
  keywords: ['korean typing game', 'typing tower defense', 'typing defense game', 'hangul typing game'],
  alternates: localeAlternates('/game/castle-defense', 'en'),
  openGraph: {
    ...ENGLISH_OPEN_GRAPH,
    title: 'Castle Defense - Korean Typing Tower Defense',
    description: 'Type enemy words to fire arrows and hold the gate through waves and bosses.',
    url: 'https://www.hangul-tajawang.com/en/game/castle-defense',
    locale: 'en_US',
    siteName: 'Hangul Tajawang',
  },
};

export default function EnCastleDefensePage() {
  return (
    <>
      <GameJsonLd
        name="Castle Defense Typing Game"
        alternateName="성문방어"
        url="https://www.hangul-tajawang.com/en/game/castle-defense"
        description="Korean typing tower defense: type enemy words to fire arrows and defend the castle gate through escalating waves."
        genre={['Tower Defense', 'Typing Practice', 'Action']}
        inLanguage={["en", "ko"]}
        publisherName="Hangul Tajawang"
        priceCurrency="USD"
      />
      <GamePageShell
        eyebrow="Korean Typing Game"
        title="Castle Defense"
        tagline="Enemies march on your gate carrying Korean words — type them to fire arrows and hold the line."
        howTo={[
          'Enemies advance toward your castle, each carrying a Korean word.',
          "Type an enemy's word and press Enter to shoot it down.",
          'Waves get faster and bosses appear — accuracy under pressure is everything.',
          'Sign in to post your best wave to the leaderboard.',
        ]}
      >
        <TypingDefenseGame />
      </GamePageShell>
    </>
  );
}
