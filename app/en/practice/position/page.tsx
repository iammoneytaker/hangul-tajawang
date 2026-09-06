import type { Metadata } from 'next';
import { ENGLISH_OPEN_GRAPH } from '@/lib/i18n/english-metadata';
import { Keyboard } from 'lucide-react';
import { PositionPractice } from '@/components/word-practice/PositionPractice';
import { localeAlternates } from '@/lib/i18n/alternates';

export const metadata: Metadata = {
  title: 'Korean Keyboard Practice - Learn Hangul Key Positions',
  description:
    'Learn the Korean keyboard layout by typing: free drills teach where every consonant and vowel lives on the 2-set (Dubeolsik) layout — no keycap stickers needed.',
  keywords: [
    'korean keyboard practice',
    'hangul keyboard layout',
    'korean keyboard layout practice',
    'learn korean keyboard',
    'dubeolsik layout',
    'korean typing for beginners',
  ],
  alternates: localeAlternates('/practice/position', 'en'),
  openGraph: {
    ...ENGLISH_OPEN_GRAPH,
    title: 'Korean Keyboard Position Practice',
    description: 'Master the Hangul keyboard layout step by step, with the correct finger for every key.',
    url: 'https://www.hangul-tajawang.com/en/practice/position',
    locale: 'en_US',
    siteName: 'Hangul Tajawang',
  },
};

export default function EnPositionPracticePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Korean Keyboard Position Practice',
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'All',
    url: 'https://www.hangul-tajawang.com/en/practice/position',
    description:
      'Free web drills for memorizing the Korean 2-set (Dubeolsik) keyboard layout and the correct finger for each Hangul letter.',
    author: { '@type': 'Organization', name: 'Hangul Tajawang' },
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="flex flex-col items-center">
        <p className="text-sm text-zinc-600 px-6 mb-4">The drill controls below are in Korean. Type the highlighted key to practice each keyboard row.</p>
        <div lang="ko" className="w-full"><PositionPractice initialPhase="keys" /></div>

        <article className="mt-20 w-full px-6 lg:px-8 animate-in fade-in duration-1000">
          <h1 className="text-3xl font-bold mb-8 border-b border-surface-high pb-4 flex items-center gap-4">
            <Keyboard className="text-primary w-8 h-8" /> Learn the Korean Keyboard Layout by Typing
          </h1>

          <div className="prose prose-lg text-zinc-700 max-w-none">
            <p className="leading-relaxed mb-8">
              Every Korean letter has a fixed home on the keyboard, and the fastest way to memorize it is not staring
              at a layout chart — it is typing. This drill shows you one Hangul letter at a time, highlights the key
              and <strong>the correct finger to press it with</strong>, and builds up row by row until the whole layout
              is in your muscle memory. It works with any QWERTY keyboard once the Korean input method is enabled.
            </p>

            <div className="bg-surface-low p-10 rounded-2xl leading-loose font-medium border border-surface-high shadow-inner mb-8 text-base">
              <h2 className="text-2xl font-bold mb-6 text-primary">How the 2-set (Dubeolsik) layout works</h2>
              <p className="mb-4">
                The standard Korean layout is beautifully logical: <strong>consonants sit under your left hand,
                vowels under your right</strong>. Place your index fingers on <code>F (ㄹ)</code> and{' '}
                <code>J (ㅓ)</code> — both keys have a small bump so you can find them without looking.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-zinc-700 font-medium">
                <li>
                  <strong>Left-hand home row:</strong> from the pinky — <code>A (ㅁ)</code>, <code>S (ㄴ)</code>,{' '}
                  <code>D (ㅇ)</code>, <code>F (ㄹ)</code>
                </li>
                <li>
                  <strong>Right-hand home row:</strong> from the index finger — <code>J (ㅓ)</code>,{' '}
                  <code>K (ㅏ)</code>, <code>L (ㅣ)</code>
                </li>
                <li>
                  <strong>Thumbs:</strong> rest naturally on the space bar.
                </li>
              </ul>
            </div>

            <div className="bg-surface-lowest p-8 rounded-2xl border border-surface-high">
              <h3 className="text-xl font-bold mb-4 text-on-surface">The four stages of this drill</h3>
              <ol className="list-decimal pl-6 space-y-4 text-zinc-700 font-medium">
                <li>
                  <strong>Home row:</strong> the most frequent letters — ㅁ, ㄴ, ㅇ, ㄹ and the basic vowels — where
                  your fingers always return.
                </li>
                <li>
                  <strong>Top row:</strong> reaching up for ㅂ, ㅈ, ㄷ, ㄱ, ㅅ and the vowels ㅛ, ㅕ, ㅑ.
                </li>
                <li>
                  <strong>Bottom row:</strong> the trickier reaches — ㅋ, ㅌ, ㅊ, ㅍ and ㅠ, ㅜ, ㅡ.
                </li>
                <li>
                  <strong>Tense consonants (Shift):</strong> holding Shift with your pinky to type ㄲ, ㄸ, ㅃ, ㅆ, ㅉ —
                  the final step to typing any Korean word.
                </li>
              </ol>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
