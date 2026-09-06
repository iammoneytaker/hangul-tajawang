"use client";

import { usePracticeT } from '@/lib/i18n/practice-ui';
import React, { useState } from "react";
import { Share2, Check } from "lucide-react";

/**
 * 공유 버튼 — 모바일은 시스템 공유 시트(navigator.share),
 * 미지원 환경은 클립보드 복사로 폴백한다.
 */
export function ShareButton({
  url,
  title,
  text,
  label = "공유하기",
  className = "",
}: {
  url: string;
  title: string;
  text?: string;
  label?: string;
  className?: string;
}) {
  const { isEn, t } = usePracticeT();
  const [copied, setCopied] = useState(false);

  const share = async () => {
    (window as { dataLayer?: Record<string, unknown>[] }).dataLayer?.push({ event: "book_share", work: title });
    if (navigator.share) {
      try {
        await navigator.share({ title, text: text || title, url });
        return;
      } catch {
        return; // 사용자가 공유 시트를 닫음
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* 클립보드 접근 불가 — 조용히 무시 */
    }
  };

  return (
    <button type="button" onClick={share} className={className} aria-label={isEn ? `Share ${title}` : `${title} 공유하기`}>
      {copied ? <Check size={15} /> : <Share2 size={15} />}
      {copied ? t("링크 복사됨!") : t(label)}
    </button>
  );
}
