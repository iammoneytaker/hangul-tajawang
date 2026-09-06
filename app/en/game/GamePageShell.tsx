import React from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

/**
 * /en 게임 상세 페이지 공통 골격 — 영어 h1/설명/조작법 + 실제 게임 컴포넌트(한국어 UI 공유).
 * 게임별 카피만 페이지에서 주입한다.
 */
export function GamePageShell({
  eyebrow,
  title,
  tagline,
  howTo,
  children,
}: {
  eyebrow: string;
  title: string;
  tagline: string;
  howTo: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <p className="text-xs font-semibold tracking-[0.25em] text-primary uppercase mb-3">{eyebrow}</p>
        <h1 className="serif-display text-3xl md:text-5xl font-bold mb-4">{title}</h1>
        <p className="text-zinc-600 text-base md:text-xl leading-relaxed">{tagline}</p>
      </div>

      {children}

      <div className="max-w-3xl mx-auto mt-16 border-t border-surface-high pt-12">
        <h2 className="text-2xl font-bold mb-6">How to play</h2>
        <ol className="list-decimal pl-6 space-y-3 text-zinc-600 font-medium leading-relaxed">
          {howTo.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <p className="mt-8 text-sm text-zinc-500 leading-relaxed">
          The game runs in English on this page — only the words you type are Korean, and that is the practice.
          You need the Korean input method (IME) enabled; new to that? Read{' '}
          <Link prefetch={false} href="/en/guide" className="text-primary font-bold underline underline-offset-2">
            how to type in Korean
          </Link>
          .
        </p>
        <Link
          prefetch={false}
          href="/en/game"
          className="mt-10 inline-flex items-center gap-1 text-sm font-semibold text-on-surface hover:text-primary transition-colors"
        >
          <ChevronLeft size={16} /> All Korean typing games
        </Link>
      </div>
    </div>
  );
}
