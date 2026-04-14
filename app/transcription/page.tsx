import { Metadata } from "next";
import { LONG_TEXT_DB } from "@/lib/long-text-data";
import Link from "next/link";
import { BookOpen, Edit3, Keyboard } from "lucide-react";

export const metadata: Metadata = {
  title: "긴 글 연습 및 감성 필사 목록",
  description: "다양한 문학 작품, 시, 소설, 수필 등을 원고지 타자로 연습할 수 있는 감성 한글 타자 연습 리스트입니다. 나만의 타자 속도와 정확도를 측정해보세요.",
  keywords: ["긴 글 타자 연습", "한글 타자 연습 목록", "감성 필사 목록", "타자 속도 측정", "무료 한글 타자 사이트"],
  openGraph: {
    title: "긴 글 타자 연습 및 감성 필사 - 한글타자왕",
    description: "원고지에 써내려가는 명문. 아날로그 감성으로 타자 속도와 정확도를 측정해보세요.",
  }
};

export default function TranscriptionPage() {
  return (
    <div className="w-full max-w-6xl mx-auto py-16 px-6">
      <div className="text-center mb-16 animate-in slide-in-from-bottom duration-700">
        <h1 className="text-5xl font-black mb-6">긴 글 연습 및 감성 필사</h1>
        <p className="text-zinc-400 font-medium text-xl leading-relaxed">
          원하는 작품을 선택하여 한글 타자 연습을 시작하세요. <br className="hidden md:block" />
          실시간으로 타수(속도)와 정확도를 측정해 드립니다.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {LONG_TEXT_DB.map((text, i) => (
          <Link 
            key={text.id} 
            href={`/transcription/${text.id}`}
            className="group flex flex-col bg-surface-low p-8 rounded-[2.5rem] border border-surface-high hover:border-primary/50 transition-all hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,74,198,0.1)] relative overflow-hidden"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:rotate-12 group-hover:scale-110">
              <Edit3 size={100} />
            </div>
            
            <div className="flex justify-between items-start mb-6 relative z-10">
              <span className="text-[11px] font-black px-4 py-1.5 bg-surface-high text-zinc-300 rounded-full">{text.category}</span>
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-500 bg-surface-lowest px-3 py-1.5 rounded-full"><Keyboard size={12}/> {text.wordCount}자</span>
            </div>
            
            <h2 className="text-2xl font-black text-on-surface mb-3 group-hover:text-primary transition-colors relative z-10">{text.title}</h2>
            <p className="text-sm font-bold text-zinc-400 flex items-center gap-2 mb-8 relative z-10"><BookOpen size={14}/> {text.author}</p>
            
            <div className="mt-auto pt-6 border-t border-surface-high text-sm font-medium text-zinc-500 line-clamp-3 leading-loose relative z-10">
              {text.content}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
