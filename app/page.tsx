"use client";

import React, { useEffect, useState } from "react";
import { BetaFeedback } from "@/components/BetaFeedback";
import { Layout, PenTool, Gamepad2, Users, ChevronRight, BookOpenCheck, Sparkles, Zap, Star, Trophy, Heart, ArrowRight, Smartphone } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { SupabaseService } from "@/lib/supabase";

export default function Home() {
  const [popularContents, setPopularContents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPopular = async () => {
      try {
        const contents = await SupabaseService.getContents('전체', '인기순');
        setPopularContents(contents.slice(0, 3)); 
      } catch (error) {
        console.error("인기 콘텐츠 로드 실패:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPopular();
  }, []);

  return (
    <div className="bg-surface overflow-x-hidden">
      <HeroSection />
      
      {/* Feature Section */}
      <section className="container mx-auto max-w-7xl px-4 md:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              <FeatureCard 
                  href="/practice"
                  icon={<Layout className="text-primary" size={28} />}
                  title="정교한 연습장"
                  description="타이포그래피 미학을 담은 <br/>몰입형 낱말 연습 환경"
                  step="01"
              />
              <FeatureCard 
                  href="/transcription"
                  icon={<PenTool className="text-secondary" size={28} />}
                  title="심도 있는 필사"
                  description="디지털 원고지 위에서 즐기는 <br/>현대 문학의 리듬감"
                  step="02"
              />
              <FeatureCard 
                  href="/quiz"
                  icon={<BookOpenCheck className="text-green-600" size={28} />}
                  title="맞춤법 인사이트"
                  description="언어의 정확도를 높이는 <br/>지적인 퀴즈 메커니즘"
                  step="03"
              />
              <FeatureCard 
                  href="/challenge"
                  icon={<Users className="text-purple-600" size={28} />}
                  title="오픈 챌린지"
                  description="커뮤니티와 함께 호흡하는 <br/>필사 및 랭킹 시스템"
                  step="04"
              />
          </div>
      </section>

      {/* Popular Challenges Section */}
      <section className="bg-surface-low/30 py-24 md:py-32">
        <div className="container mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 md:mb-20 gap-8">
              <div className="max-w-xl">
                  <span className="text-primary font-black text-[10px] uppercase tracking-[0.5em] mb-6 block">Trending Now</span>
                  <h2 className="display-lg !text-4xl md:!text-5xl text-on-surface mb-8 leading-tight tracking-[-0.02em]">인기 필사 챌린지</h2>
                  <p className="text-zinc-500 font-medium text-lg md:text-xl leading-relaxed tracking-[-0.01em]">
                      지금 다른 유저들이 가장 많이 필사하고 있는 글들입니다. <br className="hidden md:block"/>
                      아름다운 문장들을 직접 타이핑하며 감성을 채워보세요.
                  </p>
              </div>
              <Link href="/challenge" className="group flex items-center gap-3 text-on-surface font-black text-sm uppercase tracking-widest hover:text-primary transition-colors bg-surface-lowest px-8 py-4 rounded-full shadow-sm hover:shadow-md transition-all">
                  전체 보기 <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
              </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
              {loading ? (
                  Array(3).fill(0).map((_, i) => (
                      <div key={i} className="bg-surface-lowest rounded-[2.5rem] md:rounded-[3.5rem] h-64 md:h-80 animate-pulse" />
                  ))
              ) : popularContents.length > 0 ? (
                  popularContents.map((content) => (
                      <Link key={content.id} href={`/challenge/${content.id}`} className="group relative overflow-hidden bg-surface-lowest rounded-[2.5rem] md:rounded-[3.5rem] shadow-sm hover:shadow-2xl transition-all hover:-translate-y-2">
                          <div className="p-8 md:p-10 h-full flex flex-col justify-between">
                              <div>
                                  <div className="flex justify-between items-start mb-6">
                                      <span className="px-3 md:px-4 py-1.5 bg-surface-low text-primary text-[10px] font-black rounded-full uppercase tracking-widest">{content.category}</span>
                                      <div className="flex items-center gap-1.5 text-zinc-300 group-hover:text-red-500 transition-colors">
                                          <Heart size={16} className={content.like_count > 0 ? "fill-current" : ""} />
                                          <span className="text-xs font-black">{content.like_count}</span>
                                      </div>
                                  </div>
                                  <h3 className="headline-md !text-xl md:!text-2xl mb-4 group-hover:text-primary transition-colors line-clamp-2">{content.title}</h3>
                              </div>
                              <div className="flex items-center justify-between mt-6 md:mt-8 pt-6 md:pt-8 border-t border-surface-high">
                                  <div className="flex items-center gap-3">
                                      {content.profiles?.avatar_url ? (
                                          <Image src={content.profiles.avatar_url} alt="p" width={32} height={32} className="w-8 h-8 rounded-full object-cover" />
                                      ) : (
                                          <div className="w-8 h-8 bg-surface-low rounded-full flex items-center justify-center text-primary font-black text-[10px]">U</div>
                                      )}
                                      <span className="text-xs font-bold text-zinc-500">{content.profiles?.nickname || '익명'}</span>
                                  </div>
                                  <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                                      <Zap size={12} className="text-primary fill-current" /> {content.complete_count}회 완료
                                  </div>
                              </div>
                          </div>
                          <div className="absolute inset-0 primary-gradient opacity-0 group-hover:opacity-[0.03] transition-opacity" />
                      </Link>
                  ))
              ) : (
                  <div className="col-span-full py-24 text-center glass-card">
                      <p className="text-zinc-400 font-black text-xl uppercase tracking-widest opacity-30">No Challenges Found</p>
                  </div>
              )}
          </div>
        </div>
      </section>

      {/* Brand Story Section */}
      <section className="container mx-auto max-w-7xl px-4 md:px-6 lg:px-8 py-24 md:py-32">
          <div className="glass-card p-8 md:p-16 lg:p-24 flex flex-col lg:flex-row items-center gap-12 lg:gap-16 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none scale-150 text-primary">
                  <Sparkles size={240} />
              </div>
              <div className="flex-1 relative z-10 text-center lg:text-left">
                  <span className="text-primary font-black text-[10px] uppercase tracking-[0.5em] mb-6 block">The Story of Hangul Tajawang</span>
                  <h2 className="display-lg !text-4xl md:!text-5xl mb-10 leading-tight tracking-[-0.02em]">빠름보다 바름을, <br className="hidden md:block"/>소음보다 리듬을.</h2>
                  <p className="text-zinc-500 font-medium text-lg md:text-xl leading-relaxed mb-12 tracking-[-0.01em]">
                      한글타자왕은 단순히 글자를 빠르게 치는 연습을 넘어, 한글이 가진 고유의 조형미와 타이핑의 즐거움을 되찾기 위해 시작되었습니다. 
                      바쁜 일상 속에서 잠시 멈춰 문장을 음미하고, 손끝으로 전해지는 리듬에 집중하는 시간을 제공하고자 합니다.
                  </p>
                  
                  <div className="flex flex-col gap-6">
                    <p className="text-on-surface font-black text-[10px] md:text-xs uppercase tracking-[0.2em] flex items-center justify-center lg:justify-start gap-2">
                        <Smartphone size={16} className="text-primary" /> 모바일에서도 그 감동을 이어가세요
                    </p>
                    <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                        <a 
                            href="https://play.google.com/store/apps/details?id=com.moneytaker.korean_typing&hl=ko" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="px-6 md:px-8 py-3.5 md:py-4 bg-zinc-900 text-white rounded-2xl font-black text-sm flex items-center gap-3 hover:scale-105 transition-all shadow-xl shadow-zinc-900/20"
                        >
                            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.1-.124l-.012-.016a.997.997 0 01-.168-.558V2.512c0-.216.06-.432.168-.558l.012-.016a.997.997 0 01.1-.124zm11.29 11.29l2.515-2.515a.997.997 0 011.41 0l3.013 3.013a.997.997 0 010 1.41l-3.013 3.013a.997.997 0 01-1.41 0l-2.515-2.515a.997.997 0 010-1.41zm-1.096-1.096L12 10.186 5.432 3.618a1.002 1.002 0 01.076-.086l.016-.012c.126-.108.342-.168.558-.168h11.916c.216 0 .432.06.558.168l.016.012c.036.026.06.056.086.086L13.803 12.008zm0 1.096l4.805 8.374c-.026.03-.056.06-.086.086l-.016.012a.997.997 0 01-.558.168H6.082c-.216 0-.432-.06-.558-.168l-.016-.012a1.002 1.002 0 01-.076-.086L12 13.814l1.803-1.806z"/></svg>
                            Google Play
                        </a>
                        <a 
                            href="https://apps.apple.com/kr/app/%ED%95%9C%EA%B8%80%ED%83%80%EC%9E%90%EC%99%95/id6702021365" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="px-6 md:px-8 py-3.5 md:py-4 bg-zinc-100 text-zinc-900 rounded-2xl font-black text-sm flex items-center gap-3 hover:scale-105 transition-all shadow-xl shadow-zinc-100/20"
                        >
                            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.11.78.9.04 2.1-.83 3.6-.63 1.5.11 2.6.61 3.3 1.59-3.05 1.76-2.5 5.95.45 7.15-.65 1.63-1.55 3.25-2.46 4.08zM12.03 7.25c-.08-2.61 2.1-4.8 4.54-4.89.26 2.85-2.29 5.09-4.54 4.89z"/></svg>
                            App Store
                        </a>
                    </div>
                  </div>
              </div>
              <div className="flex-1 w-full max-w-sm md:max-w-md bg-surface-low rounded-[2.5rem] md:rounded-[3.5rem] p-6 md:p-8 shadow-inner relative group transition-transform hover:scale-[1.05]">
                  <div className="aspect-square bg-surface-lowest rounded-[2rem] md:rounded-[3rem] shadow-2xl flex items-center justify-center overflow-hidden p-8 md:p-12">
                      <Image 
                        src="/favicon.png" 
                        alt="favicon" 
                        width={256} 
                        height={256} 
                        className="w-full h-full object-contain filter drop-shadow-2xl animate-fade-in"
                      />
                      <div className="absolute inset-0 primary-gradient opacity-5 group-hover:opacity-10 transition-opacity" />
                  </div>
              </div>
          </div>
      </section>

      <BetaFeedback />
    </div>
  );
}

function HeroSection() {
  return (
    <section className="container mx-auto max-w-7xl px-4 md:px-6 lg:px-8 py-20 md:py-32 flex flex-col items-center text-center relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none z-0">
          <div className="absolute top-20 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      <div className="relative z-10 flex flex-col items-center w-full">
          <h1 className="display-lg text-on-surface mb-8 md:mb-10 leading-tight">
            타자 연습, <br />
            <span className="text-primary italic">감성</span>을 더하다.
          </h1>
          
          <p className="text-lg md:text-xl text-zinc-500 max-w-2xl mb-12 md:mb-16 font-medium leading-relaxed px-4">
            노력하는 당신을 존경합니다. <br className="hidden sm:block" />
            낱말연습부터 감성 필사까지 당신만의 타자 시간을 즐겨보세요.
          </p>
          
          <div className="flex flex-col items-center gap-8 w-full">
            <div className="flex flex-col sm:flex-row gap-4 md:gap-6 w-full sm:w-auto px-4">
              <Link 
                href="/practice"
                className="px-10 md:px-12 py-5 md:py-6 primary-gradient text-white text-lg md:text-xl font-black rounded-full shadow-2xl shadow-primary/20 transition-all hover:scale-[1.05] active:scale-[0.95] flex items-center justify-center gap-3"
              >
                지금 시작하기 <ChevronRight size={24} />
              </Link>
              <Link href="/game" className="px-10 md:px-12 py-5 md:py-6 bg-surface-lowest text-on-surface text-lg md:text-xl font-black rounded-full shadow-sm transition-all hover:bg-surface-low flex items-center justify-center gap-3">
                <Gamepad2 size={24} className="text-secondary" /> 게임 즐기기
              </Link>
            </div>
            <p className="text-[10px] md:text-xs text-zinc-400 font-black uppercase tracking-widest flex items-center gap-2">
              <Trophy size={14} className="text-tertiary" /> 실시간 <span className="text-primary font-black">나의 성장</span>을 시각화합니다.
            </p>
          </div>
      </div>
    </section>
  );
}

function FeatureCard({ icon, title, description, step, href }: { icon: React.ReactNode; title: string; description: string; step: string; href: string }) {
  return (
    <Link href={href} className="bg-surface-lowest p-8 md:p-10 rounded-[2rem] md:rounded-[2.5rem] text-left transition-all duration-500 hover:shadow-[0_20px_40px_rgba(21,28,39,0.06)] hover:-translate-y-2 relative group overflow-hidden">
      <div className="absolute -top-4 -right-4 text-6xl md:text-8xl font-black text-on-surface opacity-[0.02] group-hover:opacity-[0.05] transition-opacity select-none">{step}</div>
      <div className="w-14 h-14 md:w-16 md:h-16 bg-surface-low rounded-2xl flex items-center justify-center mb-8 md:mb-10 transition-colors group-hover:bg-primary/10">
        {icon}
      </div>
      <h3 className="headline-md !text-xl md:!text-2xl mb-3 md:mb-4 group-hover:text-primary transition-colors">{title}</h3>
      <p className="text-zinc-500 font-medium text-sm md:text-base leading-relaxed mb-6 md:mb-8" dangerouslySetInnerHTML={{ __html: description }}></p>
      <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">
          바로가기 <ChevronRight size={14} />
      </div>
    </Link>
  );
}
