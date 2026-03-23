"use client";

import React from "react";
import { Keyboard, ArrowRight, Sparkles, Zap, ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function RecommendIndexPage() {
  return (
    <div className="bg-surface min-h-screen pb-24">
      {/* Hero Section */}
      <section className="container mx-auto max-w-7xl px-4 md:px-6 lg:px-8 py-20 md:py-28 flex flex-col items-center text-center">
        <span className="text-primary font-black text-[10px] uppercase tracking-[0.5em] mb-6 block">The Scholar's Tool</span>
        <h1 className="display-lg text-on-surface mb-8 leading-tight tracking-[-0.02em]">
          장비의 미학: <br />
          <span className="text-primary italic">선별된</span> 키보드 컬렉션
        </h1>
        <p className="text-lg md:text-xl text-zinc-500 max-w-2xl mb-12 font-medium leading-relaxed tracking-[-0.01em]">
          수많은 키보드 중 오직 타자 연습의 리듬과 <br className="hidden sm:block" />
          집중력을 높여줄 제품들만 엄선했습니다.
        </p>
      </section>

      {/* Keyboard Grid */}
      <section className="container mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
          
          {/* ABKO MK108 Card */}
          <Link href="/recommend/abko-mk108" className="group block">
            <div className="bg-surface-lowest rounded-[3rem] p-8 md:p-10 shadow-sm hover:shadow-2xl transition-all hover:-translate-y-2 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform">
                <Keyboard size={120} />
              </div>
              
              <div className="aspect-square bg-surface-low rounded-[2rem] mb-8 overflow-hidden relative">
                <Image 
                  src="/keyboard/abko.png" 
                  alt="ABKO MK108" 
                  fill
                  className="object-contain p-8 group-hover:scale-110 transition-transform duration-700"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black rounded-full uppercase tracking-widest">Entry King</span>
                  <span className="px-3 py-1 bg-zinc-100 text-zinc-400 text-[10px] font-black rounded-full uppercase tracking-widest">Membrane</span>
                </div>
                <h3 className="headline-md !text-2xl group-hover:text-primary transition-colors">ABKO MK108</h3>
                <p className="text-zinc-500 text-sm leading-relaxed line-clamp-2">
                  오트밀 감성의 세련된 디자인과 쫀득한 멤브레인 타건감. 2만원대 입문용 최강자.
                </p>
                <div className="pt-4 flex items-center gap-2 text-primary font-black text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0">
                  리뷰 및 타건음 보기 <ArrowRight size={14} />
                </div>
              </div>
            </div>
          </Link>

          {/* Coming Soon Placeholder */}
          <div className="bg-surface-low/30 rounded-[3rem] p-8 md:p-10 flex flex-col items-center justify-center text-center border-2 border-dashed border-zinc-200">
             <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-zinc-300 mb-6">
                <Sparkles size={24} />
             </div>
             <h3 className="headline-md !text-xl text-zinc-400 mb-2">Next Curation</h3>
             <p className="text-zinc-400 text-sm font-medium">프리미엄 기계식 라인업 <br/>준비 중입니다.</p>
          </div>

        </div>
      </section>
    </div>
  );
}
