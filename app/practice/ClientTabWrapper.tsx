"use client";

import React, { useState } from "react";
import { PositionPractice } from "@/components/word-practice/PositionPractice";
import { WordPractice } from "@/components/word-practice/WordPractice";
import { ShortPractice } from "@/components/short-practice/ShortPractice";
import { Keyboard, Layout, PenTool } from "lucide-react";

export default function ClientTabWrapper() {
  const [mode, setMode] = useState<"position" | "short">("position");

  return (
    <div className="flex flex-col items-center">
      <div className="flex flex-wrap justify-center gap-2 mb-16 bg-white dark:bg-zinc-900 p-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 w-fit mx-auto shadow-sm z-10">
        <TabButton active={mode === "position"} icon={<Keyboard size={16}/>} label="기초 연습 (자리/낱말)" onClick={() => setMode("position")} />
        <TabButton active={mode === "short"} icon={<PenTool size={16}/>} label="짧은 글 연습" onClick={() => setMode("short")} />
      </div>
      
      {/* key를 부여하여 모드 변경 시 컴포넌트를 완전히 새로 렌더링 (상태 꼬임 방지) */}
      <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
        {mode === "position" && <PositionPractice key="pos" />}
        {mode === "short" && <ShortPractice key="short" />}
      </div>
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
          : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
