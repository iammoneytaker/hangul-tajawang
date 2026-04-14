import { Metadata } from 'next';
import { QUIZ_DATA } from '@/lib/quiz-data';
import Link from 'next/link';
import { BookOpen, AlertTriangle } from 'lucide-react';

export const metadata: Metadata = {
  title: "자주 틀리는 한글 맞춤법 사전 및 퀴즈",
  description: "한국인이 가장 자주 헷갈리는 맞춤법(바람/바램, 낫다/낳다 등)을 퀴즈로 풀고 상세한 해설을 확인하세요.",
  keywords: ["맞춤법 퀴즈", "한글 타자 연습", "바람 바램", "낫다 낳다", "되 돼 구분", "띄어쓰기 앱"],
  openGraph: {
    title: "자주 틀리는 한글 맞춤법 사전 | 한글타자왕",
    description: "헷갈리는 맞춤법, 더 이상 틀리지 마세요. 퀴즈와 해설로 완벽 마스터!",
  }
};

export default function QuizListPage() {
  return (
    <div className="w-full max-w-6xl mx-auto py-16 px-6">
      <div className="text-center mb-16 animate-in slide-in-from-bottom duration-700">
        <h1 className="text-5xl font-black mb-6">📝 한글 맞춤법 집중 공략</h1>
        <p className="text-zinc-600 dark:text-zinc-400 font-medium text-xl leading-relaxed">
          어른들도 자주 헷갈리는 필수 맞춤법과 띄어쓰기 논란을 모았습니다. <br className="hidden md:block" />
          가장 취약한 문제를 골라 퀴즈를 풀고 검색 엔진이 추천하는 완벽한 해설을 확인해보세요.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {QUIZ_DATA.map((item, i) => (
          <Link 
            key={item.id} 
            href={`/quiz/${item.id}`}
            className="group flex flex-col bg-surface-low p-8 rounded-[2.5rem] border border-surface-high hover:border-blue-500/50 transition-all hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(59,130,246,0.1)] relative overflow-hidden"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:-rotate-6 group-hover:scale-110">
              <AlertTriangle size={120} />
            </div>
            
            <div className="flex items-center gap-2 mb-6 relative z-10">
              <span className="text-xs font-black px-4 py-1.5 bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400 rounded-full">맞춤법 난제 #{i + 1}</span>
            </div>
            
            <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors relative z-10 line-clamp-1">{item.aeoQuestion}</h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-8 relative z-10 line-clamp-2">{item.question.replace("___", "[ ? ]")}</p>
            
            <div className="mt-auto flex items-center justify-between text-sm font-bold text-blue-600 dark:text-blue-400 relative z-10">
              <span className="flex items-center gap-2"><BookOpen size={16} />퀴즈 풀고 해설 보기</span>
              <span className="group-hover:translate-x-2 transition-transform">→</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
