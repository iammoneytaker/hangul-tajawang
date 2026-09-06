"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { localeFromPathname, switchLocaleHref } from "@/lib/i18n/routes";
import { getChromeDict } from "@/lib/i18n/chrome";

export const Footer: React.FC = () => {
  const pathname = usePathname();
  const locale = localeFromPathname(pathname);
  const t = getChromeDict(locale);
  // 약관·개인정보·문의는 한국어 원본만 존재 — en에서도 원본으로 연결
  const guideHref = locale === "en" ? "/en/guide" : "/guide";

  return (
    <footer className="py-10 md:py-16 text-sm text-zinc-400 w-full bg-surface-lowest mt-20 md:mt-32">
      <div className="container mx-auto max-w-7xl px-8 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 primary-gradient rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm">한</div>
          <span className="font-medium">{t.footerCopyright}</span>
        </div>
        <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-center sm:flex sm:gap-8">
          <Link href={guideHref} prefetch={false} className="hover:text-primary transition-colors font-medium">{t.footerGuide}</Link>
          <Link href={locale === "en" ? "/en/terms" : "/terms"} prefetch={false} className="hover:text-primary transition-colors font-medium">{t.footerTerms}</Link>
          <Link href={locale === "en" ? "/en/privacy" : "/privacy"} prefetch={false} className="hover:text-primary transition-colors font-medium">{t.footerPrivacy}</Link>
          <Link href={locale === "en" ? "/en/contact" : "/contact"} prefetch={false} className="hover:text-primary transition-colors font-medium">{t.footerContact}</Link>
          {/* 언어 전환 — 실제 <a> 링크 (크롤러 발견 경로) */}
          <a href={switchLocaleHref(pathname)} className="hover:text-primary transition-colors font-medium">{t.languageSwitch}</a>
        </div>
      </div>
    </footer>
  );
};
