"use client";

import React from "react";
import Link from "next/link";

export const Footer: React.FC = () => {
  return (
    <footer className="py-12 text-sm text-zinc-400 w-full text-center border-t border-zinc-100 dark:border-zinc-900 bg-white dark:bg-zinc-950 mt-24">
      <div className="container mx-auto max-w-7xl px-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-zinc-200 dark:bg-zinc-800 rounded flex items-center justify-center text-xs font-bold text-zinc-500">한</div>
          <span>© 2026 한글타자왕 Web Edition.</span>
        </div>
        <div className="flex gap-6">
          <Link href="/terms" className="hover:text-zinc-600 transition-colors">이용약관</Link>
          <Link href="/privacy" className="hover:text-zinc-600 transition-colors">개인정보처리방침</Link>
          <Link href="/contact" className="hover:text-zinc-600 transition-colors">문의하기</Link>
        </div>
      </div>
    </footer>
  );
};
