import type { Metadata } from 'next';
import Link from 'next/link';
export const metadata: Metadata = { title: 'Sign-in error', robots: { index: false, follow: true } };
export default function Page() { return <section className="paper-card max-w-lg mx-auto my-16 p-8 text-center"><h1 className="text-2xl font-bold mb-4">Sign-in could not be completed</h1><p className="text-zinc-600 mb-6">Please try again. Your saved practice progress in this browser has not been removed.</p><Link href="/en/mypage" className="text-primary font-bold">Return to sign in</Link></section>; }
