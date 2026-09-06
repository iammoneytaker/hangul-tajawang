"use client";

import { useIsEnRoute } from '@/lib/i18n/game-ui';
import React from "react";
import { AdSenseUnit } from "./AdSenseUnit";
import { Sparkles } from "lucide-react";

interface KeyboardAdBannerProps {
  className?: string;
}

export const KeyboardAdBanner: React.FC<KeyboardAdBannerProps> = ({ className = "" }) => {
  const isEn = useIsEnRoute();
  return (
    <div className={`w-full max-w-5xl mx-auto px-4 py-8 ${className}`}>
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-surface-high rounded-full text-primary font-bold text-xs tracking-widest uppercase mb-4">
          <Sparkles size={14} /> {isEn ? "Sponsored" : "스폰서 광고"}
        </div>
      </div>

      <div className="w-full bg-surface-lowest rounded-2xl p-4 md:p-6 shadow-sm border border-outline-variant flex flex-col items-center justify-center overflow-hidden">
        {/* PC용 (728x90) */}
        <div className="hidden md:flex w-full justify-center">
          <AdSenseUnit label="content-banner-pc" width={728} height={90} />
        </div>

        {/* 모바일용 (320x100) */}
        <div className="flex md:hidden w-full justify-center">
          <AdSenseUnit label="content-banner-mobile" width={320} height={100} />
        </div>
      </div>
    </div>
  );
};
