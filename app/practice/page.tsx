import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { Keyboard, Layout, PenTool, MousePointer2, ChevronRight, Star, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "타자 연습 모드 선택 - 자리/낱말/짧은글",
  description: "기초 자리 연습부터 실전 낱말, 감성 짧은 글 연습까지! 나에게 맞는 연습 모드를 선택해 타자 실력을 키워보세요.",
  openGraph: {
    title: "연습 모드 선택 - 한글타자왕",
    description: "한글 타자 마스터를 위한 첫 걸음, 모드를 선택하세요.",
  }
};

export default function PracticePage() {
  return (
    <div className="w-full max-w-5xl mx-auto py-12 px-4">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-black mb-4">연습 모드 선택</h1>
        <p className="text-zinc-500 font-medium text-lg">기초부터 탄탄하게, 실력에 맞는 모드를 골라보세요.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <PracticeModeCard 
          href="/practice/position"
          icon={<Keyboard className="text-blue-600" />}
          title="자리 연습"
          description="ㅁㄴㅇㄹ 기본 자리부터 <br/>자판 위치를 정확히 익힙니다."
          color="blue"
        />
        <PracticeModeCard 
          href="/practice/word"
          icon={<Layout className="text-indigo-600" />}
          title="낱말 연습"
          description="실전 단어를 치며 <br/>정확도와 속도를 높입니다."
          color="indigo"
        />
        <PracticeModeCard 
          href="/practice/short"
          icon={<PenTool className="text-purple-600" />}
          title="짧은 글 연습"
          description="시구, 명언, 가사 등 <br/>짧은 문장을 연습합니다."
          color="purple"
        />
      </div>

      <div className="mt-20 p-8 bg-zinc-900 rounded-[2.5rem] text-white flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-10">
            <Sparkles size={120} />
        </div>
        <div className="relative z-10">
            <h2 className="text-2xl font-black mb-2 flex items-center gap-2">
                <Star size={24} className="text-yellow-400 fill-yellow-400" /> 긴 글 연습도 해볼까요?
            </h2>
            <p className="text-zinc-400 font-medium">원고지에 써내려가는 감성 필사, 긴 글 연습 페이지로 이동합니다.</p>
        </div>
        <Link 
            href="/transcription" 
            className="px-8 py-4 bg-white text-zinc-900 font-black rounded-2xl hover:scale-105 transition-all flex items-center gap-2 whitespace-nowrap"
        >
            긴 글 연습 바로가기 <ChevronRight size={20} />
        </Link>
      </div>
    </div>
  );
}

function PracticeModeCard({ href, icon, title, description, color }: any) {
  const colorMap: any = {
    blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 shadow-blue-100 dark:shadow-none",
    indigo: "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 shadow-indigo-100 dark:shadow-none",
    purple: "bg-purple-50 dark:bg-purple-900/20 text-purple-600 shadow-purple-100 dark:shadow-none",
  };

  return (
    <Link 
      href={href}
      className="group bg-white dark:bg-zinc-900 p-10 rounded-[3rem] border border-zinc-100 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-2xl hover:-translate-y-2 transition-all flex flex-col items-center text-center shadow-sm"
    >
      <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center mb-8 shadow-xl ${colorMap[color]}`}>
        {React.cloneElement(icon, { size: 40 })}
      </div>
      <h3 className="text-2xl font-black mb-4 group-hover:scale-110 transition-transform">{title}</h3>
      <p className="text-zinc-500 font-medium leading-relaxed mb-8" dangerouslySetInnerHTML={{ __html: description }}></p>
      <div className="flex items-center gap-1 text-sm font-black opacity-0 group-hover:opacity-100 transition-opacity">
        시작하기 <ChevronRight size={16} />
      </div>
    </Link>
  );
}
