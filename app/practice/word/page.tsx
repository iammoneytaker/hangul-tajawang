import { Metadata } from 'next';
import { BASIC_PRACTICE_STEPS } from '@/lib/word-data';
import Link from 'next/link';
import { Keyboard, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: "한글 낱말 연습 목록 - 단계별 자판 단어 연습",
  description: "중간 줄, 상단 줄, 하단 줄 등 키보드 자판 위치별로 구성된 한글 낱말 타자 연습을 통해 타이핑 실력을 체계적으로 높여보세요. 독수리 타법 교정에 필수적인 코스입니다.",
  keywords: ["낱말 타자 연습", "한글 자판 연습", "단어 타자", "독수리 타법 교정", "타수 늘리기", "단계별 타자"],
  openGraph: {
    title: "한글 낱말 타자 연습 단계별 목록 | 한글타자왕",
    description: "키보드 위치별로 맞춤형 낱말 연습을 진행해보세요.",
  }
};

export default function WordPracticeListPage() {
  return (
    <div className="w-full max-w-6xl mx-auto py-16 px-6">
      <div className="text-center mb-16 animate-in slide-in-from-bottom duration-700">
        <h1 className="text-5xl font-black mb-6">단계별 낱말 타자 연습</h1>
        <p className="text-zinc-400 font-medium text-xl leading-relaxed">
          키보드의 각 위치(중간 줄, 윗 줄, 아랫 줄) 영역별로 구성된 낱말을 연습합니다. <br className="hidden md:block" />
          손가락의 위치를 자연스럽게 익히고 타수를 폭발적으로 올릴 수 있는 가장 중요한 훈련 과정입니다.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {BASIC_PRACTICE_STEPS.map((step, i) => (
          <Link 
            key={step.id} 
            href={`/practice/word/${step.id}`}
            className="group flex flex-col bg-surface-low p-8 rounded-[2rem] border border-surface-high hover:border-primary/50 transition-all hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,74,198,0.1)] relative overflow-hidden"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:rotate-12 group-hover:scale-110">
              <Keyboard size={80} />
            </div>
            
            <div className="mb-4 relative z-10">
              <span className="text-[10px] font-black uppercase text-primary tracking-widest bg-primary/10 px-3 py-1 rounded-full">Step {i + 1}</span>
            </div>
            
            <h2 className="text-2xl font-black text-on-surface mb-2 group-hover:text-primary transition-colors relative z-10">{step.title}</h2>
            <p className="text-sm font-medium text-zinc-400 mb-6 relative z-10">{step.description}</p>
            
            <div className="mt-auto flex items-center justify-between relative z-10 p-4 bg-surface-lowest rounded-xl border border-surface-high">
                <span className="text-xs font-bold text-zinc-500 line-clamp-1 flex-1">'{step.words[0]}', '{step.words[1]}' 등</span>
                <ArrowRight size={16} className="text-primary group-hover:translate-x-1 transition-transform ml-4" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
