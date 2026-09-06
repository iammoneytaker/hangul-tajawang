import type { Metadata } from 'next';
import { EnglishLegal } from '@/components/layout/EnglishLegal';
import { TERMS_EN } from '@/lib/i18n/legal-en';
import { localeAlternates } from '@/lib/i18n/alternates';
import { ENGLISH_OPEN_GRAPH } from '@/lib/i18n/english-metadata';
export const metadata: Metadata = { title: 'Terms of Service', description: 'English translation of the Hangul Tajawang terms of service.', alternates: localeAlternates('/terms', 'en'), openGraph: { ...ENGLISH_OPEN_GRAPH, title: 'Terms of Service', url: 'https://www.hangul-tajawang.com/en/terms' } };
export default function Page() { return <EnglishLegal title="Terms of Service" source="/terms" sections={TERMS_EN} />; }
