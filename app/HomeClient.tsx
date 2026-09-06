'use client';

import React, { useEffect, useState } from 'react';
import {
  ChevronRight,
  Sparkles,
  Zap,
  Heart,
  ArrowRight,
  Smartphone,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { SupabaseService } from '@/lib/supabase';
import { KeyboardAdBanner } from '@/components/layout/KeyboardAdBanner';
import { HomeStart } from '@/components/home/HomeStart';

interface Props {
  initialPopular: any[];
}

export default function HomeClient({ initialPopular }: Props) {
  const [popularContents, setPopularContents] = useState<any[]>(initialPopular);
  const [loading, setLoading] = useState(initialPopular.length === 0);

  useEffect(() => {
    // 초기 SSR 데이터가 없을 때만 클라이언트 fetch
    if (initialPopular.length > 0) return;
    const fetchPopular = async () => {
      try {
        const contents = await SupabaseService.getContents('전체', '인기순');
        setPopularContents(contents.slice(0, 3));
      } catch (error) {
        console.error('인기 콘텐츠 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPopular();
  }, [initialPopular]);

  return (
    <div className="bg-surface overflow-x-hidden">
      <HeroSection />

      {/* 3대 축 섹션 — 철학이 곧 제품: 필사 · 지식타자 · 게임 */}
      <section className="container mx-auto max-w-7xl px-4 md:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-outline-variant border border-outline-variant rounded-2xl overflow-hidden">
          <PillarCard
            href="/journey"
            keycap="🌏"
            eyebrow="배움이 남는 타자"
            title="지식타자"
            description="태정태세문단세부터 세계 수도까지. 눈으로 외우지 말고 손으로 외우면 지식이 배움으로 남습니다."
            cta="지식타자 시작하기"
          />
          <PillarCard
            href="/challenge"
            keycap="✍️"
            eyebrow="생각이 남는 타자"
            title="필사 챌린지"
            description="좋은 문장을 함께 필사하고 실시간 랭킹을 겨룹니다. 내가 고른 글로 나만의 챌린지를 만들 수도 있어요."
            cta="필사 챌린지 시작하기"
          />
          <PillarCard
            href="/game"
            keycap="🎮"
            eyebrow="실력이 남는 타자"
            title="한글 게임"
            description="산성비, 성문방어, 글자 계단. 좋은 게임에 몰입하는 사이 타자 실력이 조용히 쌓입니다."
            cta="게임 즐기기"
          />
        </div>
      </section>

      {/* Popular Challenges Section */}
      <section className="bg-surface-low/30 py-24 md:py-32">
        <div className="container mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 md:mb-20 gap-8">
            <div className="max-w-xl">
              <span className="text-primary font-bold text-[10px] uppercase tracking-[0.5em] mb-6 block">
                Trending Now
              </span>
              <h2 className="display-lg !text-4xl md:!text-5xl text-on-surface mb-8 leading-tight tracking-[-0.02em]">
                인기 필사 챌린지
              </h2>
              <p className="text-zinc-500 font-medium text-lg md:text-xl leading-relaxed tracking-[-0.01em]">
                지금 다른 유저들이 가장 많이 필사하고 있는 글들입니다.{' '}
                <br className="hidden md:block" />
                아름다운 문장들을 직접 타이핑하며 감성을 채워보세요.
              </p>
            </div>
            <Link prefetch={false}
              href="/challenge"
              
              className="group flex items-center gap-3 text-on-surface font-bold text-sm uppercase tracking-widest hover:text-primary transition-colors bg-surface-lowest px-8 py-4 rounded-full shadow-sm hover:shadow-md transition-all"
            >
              전체 보기{' '}
              <ArrowRight
                size={18}
                className="group-hover:translate-x-2 transition-transform"
              />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
            {loading ? (
              Array(3)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    className="bg-surface-lowest rounded-2xl md:rounded-2xl h-64 md:h-80 animate-pulse"
                  />
                ))
            ) : popularContents.length > 0 ? (
              popularContents.slice(0, 3).map((content) => (
                <Link prefetch={false}
                  key={content.id}
                  href={`/challenge/${content.id}`}
                  
                  className="group relative overflow-hidden bg-surface-lowest rounded-2xl md:rounded-2xl shadow-sm hover:shadow-2xl transition-all hover:-translate-y-2"
                >
                  <div className="p-8 md:p-10 h-full flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-6">
                        <span className="px-3 md:px-4 py-1.5 bg-surface-low text-primary text-[10px] font-bold rounded-full uppercase tracking-widest">
                          {content.category}
                        </span>
                        <div className="flex items-center gap-1.5 text-zinc-300 group-hover:text-red-500 transition-colors">
                          <Heart
                            size={16}
                            className={
                              content.like_count > 0 ? 'fill-current' : ''
                            }
                          />
                          <span className="text-xs font-bold">
                            {content.like_count}
                          </span>
                        </div>
                      </div>
                      <h3 className="headline-md !text-xl md:!text-2xl mb-4 group-hover:text-primary transition-colors line-clamp-2">
                        {content.title}
                      </h3>
                    </div>
                    <div className="flex items-center justify-between mt-6 md:mt-8 pt-6 md:pt-8 border-t border-surface-high">
                      <div className="flex items-center gap-3">
                        {content.profiles?.avatar_url ? (
                          <Image
                            src={content.profiles.avatar_url}
                            alt="p"
                            width={32}
                            height={32}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-surface-low rounded-full flex items-center justify-center text-primary font-bold text-[10px]">
                            U
                          </div>
                        )}
                        <span className="text-xs font-bold text-zinc-500">
                          {content.profiles?.nickname || '익명'}
                        </span>
                      </div>
                      <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Zap size={12} className="text-primary fill-current" />{' '}
                        {content.complete_count}회 완료
                      </div>
                    </div>
                  </div>
                  <div className="absolute inset-0 primary-gradient opacity-0 group-hover:opacity-[0.03] transition-opacity" />
                </Link>
              ))
            ) : (
              <div className="col-span-full py-24 text-center glass-card">
                <p className="text-zinc-400 font-bold text-xl uppercase tracking-widest opacity-30">
                  No Challenges Found
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 도구 스트립 — 코어를 받치는 도구들 (검색 유입 82%의 유통망, 삭제 금지) */}
      <section className="container mx-auto max-w-7xl px-4 md:px-6 lg:px-8 py-16 md:py-24">
        <p className="text-zinc-400 font-bold text-[10px] uppercase tracking-[0.4em] mb-4">Tools · 도구</p>
        <div className="divide-y divide-outline-variant border-y border-outline-variant">
          {[
            { href: '/practice', key: '연', title: '타자 연습장', description: '자리·낱말·짧은 글 — 기본기를 다지는 몰입형 연습 환경' },
            { href: '/test', key: '초', title: '1분 타자 테스트', description: '지금 내 타수를 1분 만에 측정하고 등급 확인' },
            { href: '/transcription', key: '필', title: '원고지 필사', description: '디지털 원고지 위에 긴 글을 또박또박 옮겨 쓰기' },
            { href: '/quiz', key: '맞', title: '맞춤법 퀴즈', description: '어른도 헷갈리는 맞춤법을 퀴즈로 풀고 해설로 다지기' },
          ].map((f) => (
            <Link
              key={f.href}
              prefetch={false}
              href={f.href}
              className="group flex items-center gap-6 py-6 px-2 hover:bg-surface-low transition-colors"
            >
              <span className="keycap w-12 h-12 text-xl shrink-0 group-hover:border-primary group-hover:text-primary transition-colors">{f.key}</span>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold group-hover:text-primary transition-colors">{f.title}</h3>
                <p className="mt-0.5 text-sm text-zinc-600 leading-relaxed break-keep">{f.description}</p>
              </div>
              <ChevronRight size={18} className="text-zinc-400 group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
            </Link>
          ))}
        </div>
      </section>

      {/* Brand Story Section */}
      <section className="container mx-auto max-w-7xl px-4 md:px-6 lg:px-8 py-24 md:py-32">
        <div className="glass-card p-8 md:p-16 lg:p-24 flex flex-col lg:flex-row items-center gap-12 lg:gap-16 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none scale-150 text-primary">
            <Sparkles size={240} />
          </div>
          <div className="flex-1 relative z-10 text-center lg:text-left">
            <span className="text-primary font-bold text-[10px] uppercase tracking-[0.5em] mb-6 block">
              The Story of Hangul Tajawang
            </span>
            <h2 className="display-lg !text-4xl md:!text-5xl mb-10 leading-tight tracking-[-0.02em]">
              빠름보다 바름을, <br className="hidden md:block" />
              소음보다 리듬을.
            </h2>
            <p className="text-zinc-500 font-medium text-lg md:text-xl leading-relaxed mb-12 tracking-[-0.01em] break-keep">
              한글타자왕은 <strong className="text-on-surface">타자를 치는 행위 자체를 가치 있게</strong> 만듭니다.
              좋은 문장을 쳐서 생각이 남는 필사, 좋은 지식을 쳐서 배움이 남는
              지식타자, 좋은 게임을 즐기며 실력이 남는 타자. 단순한 입력으로
              끝내지 않고, 타자를 치는 당신의 시간을 더 가치 있게 만드는 것 —
              그것이 우리가 이 서비스를 만드는 이유입니다.
            </p>

            <div className="flex flex-col gap-6">
              <p className="text-on-surface font-bold text-[10px] md:text-xs uppercase tracking-[0.2em] flex items-center justify-center lg:justify-start gap-2">
                <Smartphone size={16} className="text-primary" /> 모바일에서도
                그 감동을 이어가세요
              </p>
              <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                <a
                  href="https://play.google.com/store/apps/details?id=com.moneytaker.korean_typing&hl=ko"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 md:px-8 py-3.5 md:py-4 bg-zinc-900 text-white rounded-2xl font-bold text-sm flex items-center gap-3 hover:scale-105 transition-all shadow-xl shadow-zinc-900/20"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                    <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.1-.124l-.012-.016a.997.997 0 01-.168-.558V2.512c0-.216.06-.432.168-.558l.012-.016a.997.997 0 01.1-.124zm11.29 11.29l2.515-2.515a.997.997 0 011.41 0l3.013 3.013a.997.997 0 010 1.41l-3.013 3.013a.997.997 0 01-1.41 0l-2.515-2.515a.997.997 0 010-1.41zm-1.096-1.096L12 10.186 5.432 3.618a1.002 1.002 0 01.076-.086l.016-.012c.126-.108.342-.168.558-.168h11.916c.216 0 .432.06.558.168l.016.012c.036.026.06.056.086.086L13.803 12.008zm0 1.096l4.805 8.374c-.026.03-.056.06-.086.086l-.016.012a.997.997 0 01-.558.168H6.082c-.216 0-.432-.06-.558-.168l-.016-.012a1.002 1.002 0 01-.076-.086L12 13.814l1.803-1.806z" />
                  </svg>
                  Google Play
                </a>
                <a
                  href="https://apps.apple.com/kr/app/%ED%95%9C%EA%B8%80%ED%83%80%EC%9E%90%EC%99%95/id6702021365"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 md:px-8 py-3.5 md:py-4 bg-zinc-100 text-zinc-900 rounded-2xl font-bold text-sm flex items-center gap-3 hover:scale-105 transition-all shadow-xl shadow-zinc-100/20"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.11.78.9.04 2.1-.83 3.6-.63 1.5.11 2.6.61 3.3 1.59-3.05 1.76-2.5 5.95.45 7.15-.65 1.63-1.55 3.25-2.46 4.08zM12.03 7.25c-.08-2.61 2.1-4.8 4.54-4.89.26 2.85-2.29 5.09-4.54 4.89z" />
                  </svg>
                  App Store
                </a>
              </div>
            </div>
          </div>
          <div className="flex-1 w-full max-w-sm md:max-w-md bg-surface-low rounded-2xl md:rounded-2xl p-6 md:p-8 shadow-inner relative group transition-transform hover:scale-[1.05]">
            <div className="aspect-square bg-surface-lowest rounded-2xl md:rounded-2xl shadow-2xl flex items-center justify-center overflow-hidden p-8 md:p-12">
              <Image
                src="/thumbnail.png"
                alt="thumbnail"
                width={256}
                height={256}
                className="w-full h-full object-contain filter drop-shadow-2xl animate-fade-in"
              />
              <div className="absolute inset-0 primary-gradient opacity-5 group-hover:opacity-10 transition-opacity" />
            </div>
          </div>
        </div>
      </section>

      <div className="mt-16 pt-16 border-t border-outline-variant/60 w-full">
        <KeyboardAdBanner />
      </div>

    </div>
  );
}

function HeroSection() {
  return (
    <section className="container mx-auto max-w-7xl px-4 md:px-6 lg:px-8 py-8 md:py-14 flex flex-col items-center text-center">
      <div className="flex flex-col items-center w-full">
        {/* 커서 블링크 모티프 — 타자 제품의 정체성 */}
        <h1 className="serif-display text-3xl md:text-5xl lg:text-6xl text-on-surface mb-4 md:mb-6 leading-[1.3] break-keep">
          한글 타자 연습, <br />
          타자 치는 <span className="text-primary underline decoration-[3px] decoration-primary/30 underline-offset-8">시간</span>을 가치 있게
          <span className="inline-block w-[3px] h-[0.9em] bg-primary align-[-0.12em] ml-1.5 animate-pulse" aria-hidden />
        </h1>

        <p className="text-base md:text-lg text-zinc-600 max-w-2xl mb-6 md:mb-8 leading-relaxed break-keep">
          연습하고, 배우고, 마음에 남는 문장을 써보세요.
        </p>
        <HomeStart />
      </div>
    </section>
  );
}

// 3대 축(필사·지식타자·게임) 대형 카드 — 철학 문구를 앞세운 대표 진입점
function PillarCard({
  href,
  keycap,
  keycapImage,
  eyebrow,
  title,
  description,
  cta,
}: {
  href: string;
  /** 아이콘 대신 키캡에 새길 한 글자 (타자 제품 고유 모티프) */
  keycap: string;
  /** 키캡 위에 올릴 이미지 (있으면 글자 대신 표시 — 예: 게임 픽셀 성) */
  keycapImage?: string;
  eyebrow: string;
  title: string;
  description: string;
  cta: string;
}) {
  return (
    <Link
      prefetch={false}
      href={href}
      className="group bg-surface-lowest p-10 md:p-12 text-left transition-colors hover:bg-surface-low"
    >
      <span className="keycap w-14 h-14 text-2xl mb-8 group-hover:border-primary group-hover:text-primary transition-colors">
        {keycapImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={keycapImage} alt={keycap} className="cd-pixel" />
        ) : (
          keycap
        )}
      </span>
      <span className="block text-[11px] font-semibold tracking-[0.25em] mb-3 text-primary">
        {eyebrow}
      </span>
      <h2 className="serif-display text-3xl md:text-4xl font-bold mb-4 group-hover:text-primary transition-colors">
        {title}
      </h2>
      <p className="text-zinc-600 text-sm md:text-base leading-relaxed mb-8 break-keep">
        {description}
      </p>
      <span className="inline-flex items-center gap-2 font-bold text-sm text-on-surface group-hover:text-primary transition-colors">
        {cta} <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
      </span>
    </Link>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  step,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  step: string;
  href: string;
}) {
  return (
    <Link prefetch={false}
      href={href}
      
      className="bg-surface-lowest p-8 md:p-10 rounded-2xl md:rounded-2xl text-left transition-all duration-500 hover:shadow-[0_20px_40px_rgba(21,28,39,0.06)] hover:-translate-y-2 relative group overflow-hidden"
    >
      <div className="absolute -top-4 -right-4 text-6xl md:text-8xl font-bold text-on-surface opacity-[0.02] group-hover:opacity-[0.05] transition-opacity select-none">
        {step}
      </div>
      <div className="w-14 h-14 md:w-16 md:h-16 bg-surface-low rounded-2xl flex items-center justify-center mb-8 md:mb-10 transition-colors group-hover:bg-primary/10">
        {icon}
      </div>
      <h3 className="headline-md !text-xl md:!text-2xl mb-3 md:mb-4 group-hover:text-primary transition-colors">
        {title}
      </h3>
      <p
        className="text-zinc-500 font-medium text-sm md:text-base leading-relaxed mb-6 md:mb-8"
        dangerouslySetInnerHTML={{ __html: description }}
      ></p>
      <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">
        바로가기 <ChevronRight size={14} />
      </div>
    </Link>
  );
}
