import type { Metadata } from 'next';
import { EnglishAccount } from '@/components/layout/EnglishAccount';
export const metadata: Metadata = { title: 'My Account', robots: { index: false, follow: true } };
export default function Page() { return <EnglishAccount />; }
