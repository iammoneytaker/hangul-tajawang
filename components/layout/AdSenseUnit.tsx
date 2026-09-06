"use client";

import { useIsEnRoute } from '@/lib/i18n/game-ui';
import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { BookOpenText, Brain, Gamepad2, Sparkles, ArrowRight } from 'lucide-react';

const AD_CLIENT = 'ca-pub-6359187702715364'; // 블루커뮤니케이션즈

// 지면(label)별 광고 단위 — 애드센스 보고서에서 위치별 수익을 구분하기 위해 분리
const AD_SLOTS: Record<string, string> = {
  'top-banner-pc': '3566458458',     // 블루_한글타자왕_상단배너
  'top-banner-mobile': '3566458458',
  'sidebar-left': '2253376787',      // 블루_한글타자왕_사이드바
  'sidebar-right': '2253376787',
  'content-banner-pc': '9940295116', // 블루_한글타자왕_본문
  'content-banner-mobile': '9940295116',
  'keyboard-sidebar': '9940295116',
};
const DEFAULT_SLOT = '6851097346';   // 블루_한글타자왕_웹_디스플레이 (예비/공용)

interface AdSenseUnitProps {
  width: number;
  height: number;
  /** GA4 하우스배너 집계용 지면 이름 (예: "sidebar-left") */
  label: string;
  disabled?: boolean;
  /** 미충족(unfilled) 시 하우스배너 대신 아무것도 렌더하지 않음 */
  noFallback?: boolean;
  /** 상하 여백(my-4) 제거 — 모바일/좁은 지면용 */
  tight?: boolean;
}

// 미충족 슬롯을 자사 3대 축(필사·지식타자·게임) 홍보로 회수하기 위한 배너 정의.
// "타자를 치는 행위 자체를 가치 있게" 철학에 맞춰 장비가 아닌 콘텐츠로 연결한다.
const PILLAR_PROMOS = [
  {
    href: '/transcription',
    icon: BookOpenText,
    tall: ['생각이 남는', '필사'],
    thin: '좋은 문장을 치면 생각이 남습니다 — 온라인 필사',
    square: ['좋은 문장을 치면', '생각이 남습니다'],
    cta: '필사 시작',
  },
  {
    href: '/journey',
    icon: Brain,
    tall: ['배움이 남는', '지식타자'],
    thin: '좋은 지식을 치면 배움이 남습니다 — 지식타자',
    square: ['좋은 지식을 치면', '배움이 남습니다'],
    cta: '지식타자 시작',
  },
  {
    href: '/game',
    icon: Gamepad2,
    tall: ['실력이 남는', '타자 게임'],
    thin: '좋은 게임을 즐기면 실력이 남습니다 — 한글 게임',
    square: ['좋은 게임을 즐기면', '실력이 남습니다'],
    cta: '게임 즐기기',
  },
] as const;

/**
 * 애드센스 미충족(unfilled) 폴백 하우스 배너.
 * 광고가 채워지지 않은 슬롯을 버리지 않고 자사 3대 축(필사·지식타자·게임)
 * 홍보 배너로 회수한다. 지면(unit)별로 축을 순환시켜 고르게 노출한다.
 */
const HouseAdFallback: React.FC<{ width: number; height: number; unit: string }> = ({ width, height, unit }) => {
  const isEn = useIsEnRoute();
  useEffect(() => {
    (window as any).dataLayer?.push({ event: 'house_ad_impression', ad_unit: unit, ad_size: `${width}x${height}` });
  }, [unit, width, height]);

  const handleClick = () => {
    (window as any).dataLayer?.push({ event: 'house_ad_click', ad_unit: unit, ad_size: `${width}x${height}` });
  };

  // 지면 이름 해시로 축 선택 — 같은 지면은 항상 같은 축(하이드레이션 안정), 지면끼리는 분산
  const promos = isEn ? [
    { href: '/en/transcription', icon: BookOpenText, tall: ['Type Korean', 'literature'], thin: 'Read closely. Type Korean literature.', square: ['Practice with', 'Korean literature'], cta: 'Start typing' },
    { href: '/en/practice', icon: Brain, tall: ['Learn the keys', 'Build your skills'], thin: 'Learn Hangul, one keystroke at a time.', square: ['Learn the keys', 'Build your skills'], cta: 'Practice' },
    { href: '/en/game', icon: Gamepad2, tall: ['Play and learn', 'Typing games'], thin: 'Build Korean typing skills through play.', square: ['Play and learn', 'Typing games'], cta: 'Play now' },
  ] : PILLAR_PROMOS;
  const promo = promos[Math.abs([...unit].reduce((a, c) => a + c.charCodeAt(0), 0)) % PILLAR_PROMOS.length];
  const Icon = promo.icon;

  const isVertical = height > width * 1.5;   // 160x600 스카이스크래퍼
  const isThin = height <= 120;              // 320x100, 728x90 띠배너

  if (isVertical) {
    return (
      <Link prefetch={false} href={promo.href} onClick={handleClick}
        className="group flex flex-col items-center justify-between bg-gradient-to-b from-blue-600 to-indigo-700 text-white rounded-2xl p-5 text-center overflow-hidden relative hover:scale-[1.02] transition-transform"
        style={{ width: `${width}px`, height: `${height}px`, maxWidth: '100%' }}
      >
        <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-blue-200">{isEn ? "Hangul Tajawang" : "한글타자왕"}</span>
        <div className="flex flex-col items-center gap-4">
          <Icon size={48} className="opacity-90 group-hover:-rotate-6 transition-transform" />
          <p className="font-bold text-lg leading-snug break-keep">{promo.tall[0]}<br />{promo.tall[1]}</p>
          <p className="text-[11px] text-blue-200 font-medium leading-relaxed break-keep">{isEn ? <>Make every<br />keystroke count</> : <>타자를 치는 시간을<br />가치 있게</>}</p>
        </div>
        <span className="px-4 py-2 bg-white text-blue-700 rounded-full text-[11px] font-bold flex items-center gap-1">
          {promo.cta} <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
        </span>
      </Link>
    );
  }

  if (isThin) {
    return (
      <Link prefetch={false} href={promo.href} onClick={handleClick}
        className="group flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl px-5 overflow-hidden relative hover:scale-[1.01] transition-transform"
        style={{ width: `${width}px`, height: `${height}px`, maxWidth: '100%' }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <Icon size={28} className="shrink-0 opacity-90" />
          <p className="font-bold text-sm leading-tight break-keep truncate">{promo.thin}</p>
        </div>
        <span className="shrink-0 px-3 py-1.5 bg-white text-blue-700 rounded-full text-[10px] font-bold flex items-center gap-1">
          {isEn ? 'Explore' : '보기'} <ArrowRight size={11} />
        </span>
      </Link>
    );
  }

  // 사각형 (300x250 등)
  return (
    <Link prefetch={false} href={promo.href} onClick={handleClick}
      className="group flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl p-6 text-center overflow-hidden relative hover:scale-[1.02] transition-transform"
      style={{ width: `${width}px`, height: `${height}px`, maxWidth: '100%' }}
    >
      <span className="absolute top-3 left-1/2 -translate-x-1/2 text-[9px] font-bold uppercase tracking-[0.3em] text-blue-200 flex items-center gap-1"><Sparkles size={10} /> {isEn ? "Hangul Tajawang" : "한글타자왕"}</span>
      <Icon size={40} className="opacity-90 group-hover:-rotate-6 transition-transform" />
      <p className="font-bold text-lg leading-snug break-keep">{promo.square[0]}<br />{promo.square[1]}</p>
      <span className="px-4 py-2 bg-white text-blue-700 rounded-full text-[11px] font-bold flex items-center gap-1">
        {promo.cta} <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
      </span>
    </Link>
  );
};

export const AdSenseUnit: React.FC<AdSenseUnitProps> = ({ width, height, label, disabled = false, noFallback = false, tight = false }) => {
  const marginClass = tight ? 'my-0' : 'my-4';
  const insRef = useRef<HTMLModElement>(null);
  const pushedRef = useRef(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    // React Strict Mode 이중 실행 방지 + disabled 모드
    if (disabled || pushedRef.current || !insRef.current) return;
    pushedRef.current = true;

    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch {
      setFailed(true);
      return;
    }

    // 애드센스는 채움 결과를 ins의 data-ad-status 속성으로 알려준다 → unfilled면 하우스 배너로 회수
    const ins = insRef.current;
    const check = () => {
      if (ins.getAttribute('data-ad-status') === 'unfilled') {
        setFailed(true);
        if (process.env.NODE_ENV !== 'production') {
          console.warn(`[adsense] unfilled slot at ${label} → house ad fallback`);
        }
        return true;
      }
      return false;
    };
    if (check()) return;
    const observer = new MutationObserver(() => { if (check()) observer.disconnect(); });
    observer.observe(ins, { attributes: true, attributeFilter: ['data-ad-status'] });
    return () => observer.disconnect();
  }, [disabled, label]);

  if (disabled) {
    return (
      <div
        className="flex flex-col items-center justify-center bg-surface-high border-2 border-dashed border-outline-variant text-zinc-400 text-sm font-bold rounded-2xl p-4 text-center my-4"
        style={{ width: `${width}px`, height: `${height}px`, maxWidth: '100%' }}
      >
        <span>AdSense 영역</span>
        <span className="text-xs font-normal mt-1 opacity-70">{width} x {height}</span>
      </div>
    );
  }

  if (failed) {
    if (noFallback) return null; // 키보드 추천 하우스배너 없이 그냥 비움
    return (
      <div className={`flex items-center justify-center w-full ${marginClass} overflow-hidden`} style={{ minHeight: `${height}px` }}>
        <HouseAdFallback width={width} height={height} unit={label} />
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center w-full ${marginClass} overflow-hidden`} style={{ minHeight: `${height}px` }}>
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={{ display: 'inline-block', width: `${width}px`, height: `${height}px`, maxWidth: '100%' }}
        data-ad-client={AD_CLIENT}
        data-ad-slot={AD_SLOTS[label] ?? DEFAULT_SLOT}
      ></ins>
    </div>
  );
};
