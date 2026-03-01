"use client";

import React, { useState } from "react";
import { Header } from "@/components/layout/Header";
import { WordPractice } from "@/components/word-practice/WordPractice";
import { ShortPractice } from "@/components/short-practice/ShortPractice";
import { PositionPractice } from "@/components/word-practice/PositionPractice";
import { LongPractice } from "@/components/long-practice/LongPractice";
import { WordGame } from "@/components/game/WordGame";
import { OpenChallenge } from "@/components/challenge/OpenChallenge";
import { SpellingQuiz } from "@/components/quiz/SpellingQuiz";
import { BetaFeedback } from "@/components/BetaFeedback";
import { Layout, PenTool, Gamepad2, Users, ChevronRight, BookOpenCheck, Keyboard, AlertTriangle } from "lucide-react";

type Mode = "home" | "position" | "word" | "short" | "long" | "game" | "challenge" | "quiz";

export default function Home() {
  const [mode, setMode] = useState<Mode>("home");

  const renderContent = () => {
    switch (mode) {
      case "position":
      case "word":
      case "short":
        return (
          <div className="w-full max-w-5xl mx-auto py-8">
            <div className="flex flex-wrap justify-center gap-2 mb-16 bg-white dark:bg-zinc-900 p-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 w-fit mx-auto shadow-sm">
              <TabButton active={mode === "position"} icon={<Keyboard size={16}/>} label="자리 연습" onClick={() => setMode("position")} />
              <TabButton active={mode === "word"} icon={<Layout size={16}/>} label="낱말 연습" onClick={() => setMode("word")} />
              <TabButton active={mode === "short"} icon={<PenTool size={16}/>} label="짧은 글 연습" onClick={() => setMode("short")} />
            </div>
            {mode === "position" && <PositionPractice />}
            {mode === "word" && <WordPractice />}
            {mode === "short" && <ShortPractice />}
          </div>
        );
      case "long":
        return (
          <div className="w-full py-8">
            <div className="flex justify-center">
              <LongPractice />
            </div>
          </div>
        );
      case "game":
        return <div className="py-8 flex flex-col items-center"><WordGame /></div>;
      case "quiz":
        return <SpellingQuiz />;
      case "challenge":
        return <OpenChallenge />;
      default:
        return (
          <>
            <div className="w-full bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-100 dark:border-yellow-900/30 py-3">
              <div className="container mx-auto px-4 flex items-center justify-center gap-2 text-yellow-700 dark:text-yellow-400 text-sm font-bold">
                <AlertTriangle size={16} />
                <span>현재 오픈 베타 버전으로 일부 기능이 정상 작동하지 않을 수 있습니다.</span>
              </div>
            </div>
            {/* 제안하기를 화면 상단으로 이동 */}
            <BetaFeedback />
            <HeroSection onStart={() => setMode("position")} />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 font-sans selection:bg-blue-100 selection:text-blue-700">
      <Header onModeChange={setMode} />
      
      <main className="min-h-[calc(100-4rem)]">
        {renderContent()}
      </main>
      
      <footer className="py-12 text-sm text-zinc-400 w-full text-center border-t border-zinc-100 dark:border-zinc-900 bg-white dark:bg-zinc-950 mt-24">
        <div className="container mx-auto max-w-7xl px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-zinc-200 dark:bg-zinc-800 rounded flex items-center justify-center text-xs font-bold text-zinc-500">한</div>
            <span>© 2026 한글타자왕 Web Edition.</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-zinc-600 transition-colors">이용약관</a>
            <a href="#" className="hover:text-zinc-600 transition-colors">개인정보처리방침</a>
            <a href="#" className="hover:text-zinc-600 transition-colors">문의하기</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function TabButton({ active, label, icon, onClick }: { active: boolean; label: string; icon?: React.ReactNode; onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`px-6 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 ${
        active 
          ? "bg-blue-600 text-white shadow-lg shadow-blue-200" 
          : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function HeroSection({ onStart }: { onStart: () => void }) {
  return (
    <div className="container mx-auto max-w-7xl px-4 lg:px-8 py-24 flex flex-col items-center text-center">
      <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-sm font-bold mb-8 animate-fade-in">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
        </span>
        한글타자왕 웹 버전 오픈 베타 진행 중
      </div>
      
      <h1 className="text-5xl md:text-7xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 mb-8 leading-tight">
        타자 연습, <br />
        <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-indigo-500">감성을 더하다.</span>
      </h1>
      
      <p className="text-xl text-zinc-500 max-w-2xl mb-12 leading-relaxed">
        아날로그의 따뜻함과 웹의 편리함이 만났습니다. <br className="hidden sm:block" />
        낱말 연습부터 감성 필사까지, 당신만의 타자 시간을 즐겨보세요.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <button 
          onClick={onStart}
          className="group px-10 py-5 bg-blue-600 hover:bg-blue-700 text-white text-xl font-black rounded-2xl shadow-xl shadow-blue-200 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
        >
          시작하기 <ChevronRight className="group-hover:translate-x-1 transition-transform" />
        </button>
        <button className="px-10 py-5 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 text-xl font-bold rounded-2xl border border-zinc-200 dark:border-zinc-800 transition-all hover:bg-zinc-50 dark:hover:bg-zinc-800">
          모드 둘러보기
        </button>
      </div>
      
      <div className="mt-32 w-full grid grid-cols-1 md:grid-cols-4 gap-6">
        <FeatureCard 
          icon={<Layout className="text-blue-600" />}
          title="직관적인 연습장"
          description="플래시카드와 포스트잇 UI로 <br/>지루하지 않은 연습 시간"
        />
        <FeatureCard 
          icon={<PenTool className="text-indigo-600" />}
          title="감성적인 필사"
          description="책장 속 노트를 펼친 듯한 <br/>환경에서 윤동주 시 필사"
        />
        <FeatureCard 
          icon={<BookOpenCheck className="text-green-600" />}
          title="맞춤법 퀴즈"
          description="자주 헷갈리는 맞춤법을 <br/>풀며 정확도 향상"
        />
        <FeatureCard 
          icon={<Users className="text-purple-600" />}
          title="오픈 챌린지"
          description="직접 텍스트를 공유하고 <br/>다른 유저들과 랭킹 경쟁"
        />
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-100 dark:border-zinc-800 text-left shadow-xs hover:shadow-lg transition-all duration-300">
      <div className="w-12 h-12 bg-zinc-50 dark:bg-zinc-800 rounded-2xl flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-black mb-4">{title}</h3>
      <p className="text-zinc-500 leading-relaxed" dangerouslySetInnerHTML={{ __html: description }}></p>
    </div>
  );
}
