import { BetaFeedback } from "@/components/BetaFeedback";
import { Layout, PenTool, Gamepad2, Users, ChevronRight, BookOpenCheck } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <HeroSection />
      <BetaFeedback />
    </>
  );
}

function HeroSection() {
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
      
      <div className="flex flex-col items-center gap-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <Link 
            href="/practice"
            className="group px-10 py-5 bg-blue-600 hover:bg-blue-700 text-white text-xl font-black rounded-2xl shadow-xl shadow-blue-200 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            시작하기 <ChevronRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="/challenge" className="px-10 py-5 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 text-xl font-bold rounded-2xl border border-zinc-200 dark:border-zinc-800 transition-all hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center justify-center">
            모드 둘러보기
          </Link>
        </div>
        <p className="text-sm text-zinc-400 font-medium">
          로그인하면 나의 <span className="text-blue-500 font-bold">최고 타수</span>와 <span className="text-blue-500 font-bold">연습 기록</span>을 관리할 수 있습니다.
        </p>
      </div>
      
      <div className="mt-32 w-full grid grid-cols-1 md:grid-cols-4 gap-6">
        <FeatureCard 
          icon={<Layout className="text-blue-600" />}
          title="직관적인 연습장"
          description="플래시카드와 포스트잇 UI로 <br/>지루하지 않은 연습 시간"
        />
        <FeatureCard 
          icon={<PenTool className="text-indigo-600" />}
          title="긴 글 연습"
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
