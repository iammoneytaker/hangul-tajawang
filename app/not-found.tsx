import React from "react";
import Link from "next/link";
import { MoveLeft, Layout, SearchX, PenTool, Sparkles } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-1000">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative mb-12">
        <div className="w-32 h-32 md:w-40 md:h-40 bg-surface-low rounded-[3rem] flex items-center justify-center text-primary/20 shadow-2xl animate-bounce">
          <SearchX size={80} strokeWidth={1} />
        </div>
        <div className="absolute -top-4 -right-4 w-12 h-12 primary-gradient rounded-2xl flex items-center justify-center text-white shadow-xl animate-pulse">
          <Sparkles size={24} />
        </div>
      </div>

      <span className="text-primary font-black text-xs uppercase tracking-[0.5em] mb-4 block underline decoration-4 decoration-primary/20 underline-offset-8">
        404 ERROR / 길을 잃은 문장
      </span>
      
      <h1 className="display-lg !text-5xl md:!text-7xl mb-6 font-myeongjo">
        찾으시는 문장이<br />지워졌거나, 존재하지 않습니다.
      </h1>
      
      <p className="text-zinc-500 text-lg md:text-xl font-medium max-w-xl mb-12 leading-relaxed">
        잘못된 경로로 접근하셨거나, 페이지의 주소가 변경되었을 수 있습니다.<br />
        다시 연습의 리듬으로 돌아가 볼까요?
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full max-w-lg">
        <Link 
          href="/" 
          className="w-full sm:w-auto px-10 py-5 bg-on-surface text-white font-black rounded-2xl hover:scale-105 transition-all shadow-2xl shadow-on-surface/20 flex items-center justify-center gap-3"
        >
          <MoveLeft size={20} /> 홈으로 돌아가기
        </Link>
        
        <Link 
          href="/practice" 
          className="w-full sm:w-auto px-10 py-5 bg-white border-2 border-zinc-100 text-on-surface font-black rounded-2xl hover:bg-zinc-50 transition-all flex items-center justify-center gap-3"
        >
          <Layout size={20} className="text-primary" /> 타자 연습하러 가기
        </Link>
      </div>

      <div className="mt-24 p-8 bg-surface-low rounded-[2.5rem] border border-zinc-100 max-w-md w-full relative group hover:shadow-xl transition-all">
        <div className="absolute -top-6 left-10 p-4 bg-white rounded-2xl shadow-lg text-primary">
          <PenTool size={24} />
        </div>
        <p className="text-sm font-myeongjo text-zinc-600 leading-loose italic">
          "길을 잃는다는 것은, 곧 새로운 길을 발견하게 된다는 의미이기도 합니다. 당신의 연습도 지금 이 순간부터 다시 시작될 수 있습니다."
        </p>
      </div>
    </div>
  );
}
