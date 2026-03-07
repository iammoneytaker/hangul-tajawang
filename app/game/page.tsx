import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { Gamepad2, ChevronRight, Sparkles, CloudRain, ShieldAlert, Trophy } from "lucide-react";

export const metadata: Metadata = {
  title: "한글 게임 모음 - 재미있는 타자 연습 게임",
  description: "산성비 게임부터 향후 추가될 다양한 타자 게임까지! 한글타자왕에서 제공하는 재미있는 한글 게임들을 만나보세요.",
  keywords: ["한글 게임", "타자 게임", "산성비", "단어 맞추기", "온라인 타자 게임", "무료 게임"],
  openGraph: {
    title: "한글 게임 모음 - 한글타자왕",
    description: "게임처럼 즐기는 타자 연습! 다양한 한글 게임에 도전해 보세요.",
  }
};

export default function GameHubPage() {
  return (
    <div className="w-full max-w-5xl mx-auto py-12 px-4">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-black mb-4">한글 게임 센터</h1>
        <p className="text-zinc-500 font-medium text-lg">타자 연습을 게임처럼 신나게 즐겨보세요!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <GameCard 
          href="/game/acid-rain"
          icon={<CloudRain className="text-blue-500" />}
          title="산성비 게임"
          description="하늘에서 떨어지는 단어들을 <br/>바닥에 닿기 전에 입력하세요!"
          difficulty="Medium"
          color="blue"
        />
        
        {/* 향후 추가될 게임들을 위한 Placeholder */}
        <div className="group bg-zinc-50 dark:bg-zinc-900/50 p-10 rounded-[3rem] border border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-zinc-300 mb-6">
                <Gamepad2 size={32} />
            </div>
            <h3 className="text-xl font-black text-zinc-300 mb-2">Comming Soon</h3>
            <p className="text-zinc-400 text-sm">더 재미있는 게임이 <br/>준비 중입니다.</p>
        </div>
      </div>

      {/* 실시간 랭킹 유도 섹션 */}
      <div className="mt-20 p-10 bg-linear-to-br from-blue-600 to-indigo-700 rounded-[3.5rem] text-white flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-12 opacity-10">
            <Trophy size={180} />
        </div>
        <div className="relative z-10 text-center md:text-left">
            <h2 className="text-3xl font-black mb-3">내 게임 실력은 몇 등일까?</h2>
            <p className="text-blue-100 font-medium">산성비 게임 최고 점수에 도전하고 <br className="hidden sm:block" />다른 유저들과 랭킹을 겨뤄보세요.</p>
        </div>
        <Link 
            href="/game/acid-rain" 
            className="px-8 py-4 bg-white text-blue-600 font-black rounded-2xl hover:scale-105 transition-all flex items-center gap-2 shadow-xl"
        >
            게임 시작하기 <ChevronRight size={20} />
        </Link>
      </div>
    </div>
  );
}

function GameCard({ href, icon, title, description, difficulty, color }: any) {
  const colorMap: any = {
    blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600",
  };

  return (
    <Link 
      href={href}
      className="group bg-white dark:bg-zinc-900 p-10 rounded-[3rem] border border-zinc-100 dark:border-zinc-800 hover:border-blue-500 hover:shadow-2xl transition-all flex flex-col items-center text-center"
    >
      <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center mb-8 shadow-xl ${colorMap[color]}`}>
        {React.cloneElement(icon as React.ReactElement, { size: 40 })}
      </div>
      <div className="inline-flex px-2.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 text-[9px] font-black rounded uppercase mb-4 tracking-widest">Difficulty: {difficulty}</div>
      <h3 className="text-2xl font-black mb-4 group-hover:text-blue-600 transition-colors">{title}</h3>
      <p className="text-zinc-500 font-medium leading-relaxed mb-8 text-sm" dangerouslySetInnerHTML={{ __html: description }}></p>
      <div className="flex items-center gap-1 text-sm font-black text-blue-600">
        플레이하기 <ChevronRight size={16} />
      </div>
    </Link>
  );
}
