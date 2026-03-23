"use client";

import React from "react";
import Link from "next/link";

export const Footer: React.FC = () => {
  return (
    <footer className="py-16 text-sm text-zinc-400 w-full bg-surface-lowest mt-32">
      <div className="container mx-auto max-w-7xl px-8 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 primary-gradient rounded-lg flex items-center justify-center text-white font-black text-sm shadow-sm">한</div>
          <span className="font-medium">© 2026 한글타자왕 Web Edition.</span>
        </div>
        <div className="flex gap-8">
          <Link href="/terms" className="hover:text-primary transition-colors font-medium">이용약관</Link>
          <Link href="/privacy" className="hover:text-primary transition-colors font-medium">개인정보처리방침</Link>
          <Link href="/contact" className="hover:text-primary transition-colors font-medium">문의하기</Link>
        </div>
      </div>
    </footer>
  );
};
