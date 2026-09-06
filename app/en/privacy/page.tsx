import type { Metadata } from 'next';
import { EnglishLegal } from '@/components/layout/EnglishLegal';
import { PRIVACY_EN } from '@/lib/i18n/legal-en';
import { localeAlternates } from '@/lib/i18n/alternates';
import { ENGLISH_OPEN_GRAPH } from '@/lib/i18n/english-metadata';
export const metadata: Metadata = { title: 'Privacy Policy', description: 'English translation of the Hangul Tajawang privacy policy.', alternates: localeAlternates('/privacy', 'en'), openGraph: { ...ENGLISH_OPEN_GRAPH, title: 'Privacy Policy', url: 'https://www.hangul-tajawang.com/en/privacy' } };
export default function Page() { return <EnglishLegal title="Privacy Policy" source="/privacy" sections={PRIVACY_EN} />; }
