"use client";

import React from "react";
import { Keyboard, ShieldCheck, VolumeX, Sparkles, ShoppingCart, Zap, ArrowRight, Info, CheckCircle2, Play, ChevronLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function AbkoMk108Page() {
  const coupangLink = "https://link.coupang.com/a/d95o22";

  return (
    <div className="bg-surface overflow-x-hidden min-h-screen pb-24">
      {/* Header / Navigation Back */}
      <nav className="container mx-auto max-w-7xl px-4 md:px-6 lg:px-8 py-8">
        <Link href="/recommend" className="inline-flex items-center gap-2 text-zinc-400 hover:text-primary transition-colors font-black text-xs uppercase tracking-widest group">
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Collection
        </Link>
      </nav>

      {/* Hero: Emotional Hook */}
      <section className="container mx-auto max-w-7xl px-4 md:px-6 lg:px-8 pb-16 md:pb-24">
        <div className="flex flex-col items-center text-center">
          <span className="text-primary font-black text-[10px] uppercase tracking-[0.5em] mb-6 block">The First Choice</span>
          <h1 className="display-lg text-on-surface mb-12 leading-tight tracking-[-0.02em]">
            ABKO MK108: <br />
            <span className="text-primary italic">입문의 정석</span>을 만나다
          </h1>
        </div>

        {/* Marketing Technique 1: 타건음 선제 공개 (Sensory Experience) */}
        <div className="relative group max-w-4xl mx-auto w-full">
          <div className="bg-on-surface rounded-[3rem] md:rounded-[4rem] p-4 shadow-2xl overflow-hidden relative group">
            <div className="aspect-video bg-zinc-900 rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden relative group">
              <iframe 
                className="w-full h-full border-none"
                src="https://www.youtube.com/embed/ewoXHDKhMaU"
                title="ABKO MK108 Sound Test"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
              <div className="absolute inset-0 bg-on-surface/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                 <Play size={64} className="text-white opacity-80" />
                 <span className="text-white font-black text-xs uppercase tracking-[0.3em] mt-4">Play Sound Test</span>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-white px-8 py-4 rounded-full shadow-xl flex items-center gap-3">
             <VolumeX size={18} className="text-primary" />
             <span className="text-on-surface font-black text-[10px] uppercase tracking-widest whitespace-nowrap">소리에 집중해 보세요</span>
          </div>
        </div>
      </section>

      {/* Marketing Technique 2: 멤브레인에 대한 이해 (Educational Rationale) */}
      <section className="bg-on-surface py-32 md:py-48 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-24 opacity-5 pointer-events-none">
           <Zap size={400} />
        </div>
        <div className="container mx-auto max-w-4xl px-4 md:px-6 lg:px-8 relative z-10 text-center">
          <span className="text-primary font-black text-[10px] uppercase tracking-[0.5em] mb-8 block underline decoration-4 decoration-primary/20 underline-offset-8">Understanding the Mechanism</span>
          <h2 className="display-lg !text-3xl md:!text-5xl mb-12 leading-tight tracking-[-0.02em]">
            가성비라고 무시했다간 손해입니다. <br className="hidden md:block"/>
            왜 '멤브레인'이 연습에 최적인가요?
          </h2>
          
          <div className="space-y-16 text-zinc-400 font-medium text-lg md:text-xl leading-relaxed tracking-[-0.01em]">
            <p>
              키보드를 누르는 순간의 <span className="text-white font-bold">'묵직함'</span>과<br className="hidden md:block" /> 
              끝까지 닿았을 때의 <span className="text-white font-bold">'부드러움'</span>.<br /><br />
              멤브레인 특유의 이 감각은<br className="hidden md:block" /> 
              고무 돔(러버돔)이라는 구조 덕분입니다.
            </p>
            <p>
              기계식처럼 찰칵거리는 소음 대신<br className="hidden md:block" /> 
              조용한 정숙함을 제공하기에,<br /><br />
              사무실이나 늦은 밤 서재에서<br className="hidden md:block" /> 
              오직 당신의 <span className="text-primary font-bold">리듬</span>에만 집중하게 만들어줍니다.
            </p>
            <p>
              또한 얇은 플라스틱 막으로 구성된 시트 구조는<br className="hidden md:block" /> 
              액체 오염으로부터 비교적 안전하여,<br /><br />
              실수로 물이나 커피를 쏟아도<br className="hidden md:block" /> 
              당신의 도구를 안전하게 지켜줍니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24">
            <RationaleCard icon={<VolumeX />} label="저소음" desc="도서관에서도 가능한 정숙함" />
            <RationaleCard icon={<ShieldCheck />} label="안정성" desc="생활 방수 기본 지원" />
            <RationaleCard icon={<Zap />} label="합리성" desc="부담 없는 입문의 시작" />
          </div>
        </div>
      </section>

      {/* Product Details & Conversion */}
      <section className="container mx-auto max-w-7xl px-4 md:px-6 lg:px-8 py-32 md:py-48">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">
          
          {/* Product Image */}
          <div className="lg:col-span-5 relative">
            <div className="aspect-square bg-surface-low rounded-[4rem] p-12 relative overflow-hidden shadow-inner group transition-all hover:scale-[1.02]">
              <Image 
                src="/keyboard/abko.png" 
                alt="ABKO MK108" 
                fill
                className="object-contain p-8 group-hover:rotate-3 transition-transform duration-700"
              />
              <div className="absolute inset-0 primary-gradient opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none" />
            </div>
            {/* Design Callout */}
            <div className="mt-12 space-y-4 text-center lg:text-left">
              <h3 className="editorial-heading text-2xl">Visual Harmony</h3>
              <p className="text-zinc-500 font-medium leading-relaxed">
                오트밀 베이스에 감각적인 포인트 컬러. <br/>
                인테리어 소품으로도 손색없는 미니멀한 디자인을 즐겨보세요.
              </p>
            </div>
          </div>

          {/* Features & CTA */}
          <div className="lg:col-span-7 space-y-12">
            <div>
              <span className="text-primary font-black text-[10px] uppercase tracking-[0.5em] mb-4 block">Product Spotlight</span>
              <h2 className="display-lg !text-5xl lg:!text-6xl mb-8 leading-tight tracking-[-0.02em]">ABKO MK108</h2>
              <div className="flex flex-wrap gap-3 mb-10">
                <Badge label="RGB Backlight" />
                <Badge label="Volume Controls" />
                <Badge label="Full Size Layout" />
              </div>
              <p className="text-zinc-500 font-medium text-xl leading-relaxed tracking-tight">
                "디자인과 성능, 가격의 완벽한 밸런스." <br/>
                타자 연습을 처음 시작하는 분들에게 ABKO MK108은 후회 없는 선택이 될 것입니다. 
                3시간 연속 타이핑에도 무리 없는 편안함을 경험하세요.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-surface-low p-8 rounded-[2.5rem]">
                <h4 className="text-primary font-black text-xs uppercase tracking-widest mb-6 flex items-center gap-2">
                  <CheckCircle2 size={16} /> Key Merits
                </h4>
                <ul className="space-y-4 text-on-surface text-sm font-bold">
                  <li>• 질리지 않는 감성적인 디자인</li>
                  <li>• 쫀득하고 부드러운 멤브레인 키감</li>
                  <li>• 편리한 멀티미디어 조절 키</li>
                  <li>• RGB 감성까지 담은 가성비</li>
                </ul>
              </div>
              <div className="bg-surface-highest p-8 rounded-[2.5rem]">
                <h4 className="text-zinc-400 font-black text-xs uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Info size={16} /> The Trade-off
                </h4>
                <ul className="space-y-4 text-zinc-400 text-sm font-bold">
                  <li>• 유선 연결 케이블의 존재</li>
                  <li>• 깊고 명확한 기계식 클릭감 부재</li>
                </ul>
              </div>
            </div>

            <div className="pt-12 border-t border-surface-high">
              <div className="flex flex-col gap-8">
                <a 
                  href={coupangLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group px-12 py-7 primary-gradient text-white text-xl font-black rounded-full shadow-2xl shadow-primary/30 transition-all hover:scale-[1.05] active:scale-[0.95] flex items-center justify-between w-full"
                >
                  <span>최저가로 지금 바로 시작하기</span>
                  <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                </a>
                <div className="text-center">
                  <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest leading-relaxed">
                    💡 이 포스팅은 쿠팡 파트너스 활동의 일환으로,<br className="sm:hidden"/> 이에 따른 일정액의 수수료를 제공받습니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function RationaleCard({ icon, label, desc }: { icon: React.ReactNode; label: string; desc: string }) {
  return (
    <div className="p-8 bg-white/5 rounded-3xl text-center backdrop-blur-sm">
      <div className="w-12 h-12 bg-primary/20 text-primary rounded-xl flex items-center justify-center mx-auto mb-4">
        {icon}
      </div>
      <h4 className="font-black text-lg mb-2">{label}</h4>
      <p className="text-zinc-500 text-sm font-medium">{desc}</p>
    </div>
  );
}

function Badge({ label }: { label: string }) {
  return (
    <span className="px-4 py-2 bg-surface-low text-on-surface text-[10px] font-black rounded-xl uppercase tracking-widest border border-surface-high shadow-sm">
      {label}
    </span>
  );
}
