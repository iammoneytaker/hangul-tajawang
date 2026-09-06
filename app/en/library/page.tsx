import type { Metadata } from 'next';
import { EnglishLibrary } from '@/components/library/EnglishLibrary';
export const metadata: Metadata = { title: 'My Library', description: 'Your completed Korean works and saved transcription progress.', robots: { index: false, follow: true } };
export default function Page() { return <div className="py-10"><h1 className="text-3xl font-bold text-center">My Library</h1><EnglishLibrary /></div>; }
