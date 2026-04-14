import { Metadata } from 'next';
import { SHORT_TEXT_DB } from '@/lib/short-text-data';
import Link from 'next/link';
import { Quote, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: "한글 짧은 글 연습 목록 - 테마별 감성 문장 타자",
  description: "명언, 힐링, 동기부여, K-POP 가사 등 다양한 카테고리의 짧은 글을 선택하여 한글 타자 연습을 매일 새롭게 즐겨보세요.",
  keywords: ["짧은 글 타자 연습", "한글 문장 연습", "타자 속도 측정", "주제별 타자 연습", "감성 문장 타자"],
  openGraph: {
    title: "한글 짧은 글 타자 연습 테마 목록 | 한글타자왕",
    description: "원하는 테마별로 짧은 문장들을 쳐보며 타자 실력을 쑥쑥 올려보세요.",
  }
};

export default function ShortPracticeListPage() {
  return (
    <div className="w-full max-w-6xl mx-auto py-16 px-6">
      <div className="text-center mb-16 animate-in slide-in-from-bottom duration-700">
        <h1 className="text-5xl font-black mb-6">테마별 짧은 글 타자 연습</h1>
        <p className="text-zinc-400 font-medium text-xl leading-relaxed">
          오늘 나의 기분과 감성에 맞는 주제를 선택해 문장 타자 연습을 시작해보세요. <br className="hidden md:block" />
          짧은 시간을 투자하여 빠르고 정확하게 타이핑하는 습관을 기를 수 있습니다.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {SHORT_TEXT_DB.map((item, i) => (
          <Link 
            key={item.id} 
            href={`/practice/short/${item.id}`}
            className="group flex flex-col bg-surface-low p-10 rounded-[2.5rem] border border-surface-high hover:border-primary/50 transition-all hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,74,198,0.1)] relative overflow-hidden"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:rotate-12 group-hover:scale-110">
              <Quote size={120} />
            </div>
            
            <div className="flex justify-between items-start mb-6 relative z-10">
              <span className="flex items-center gap-2 text-sm font-black px-4 py-1.5 bg-primary/10 text-primary rounded-full"><Sparkles size={14} /> {item.category}</span>
              <span className="text-xs font-bold text-zinc-500 bg-surface-lowest px-4 py-2 rounded-full">총 {item.sentences.length}문장</span>
            </div>
            
            <h2 className="text-3xl font-black text-on-surface mb-6 group-hover:text-primary transition-colors relative z-10">{item.category} 타자 연습 시작하기</h2>
            
            <div className="mt-auto px-6 py-5 bg-surface-lowest rounded-2xl border border-surface-high text-sm font-medium text-zinc-400 text-center relative z-10">
              "{item.sentences[0]}" 등...
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
