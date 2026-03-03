import { Metadata } from "next";
import Link from "next/link";
import { Keyboard, Layout, PenTool, Gamepad2, BookOpenCheck, Users, ChevronRight, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "기능 안내 - 한글 타자 연습 및 속도 측정 사이트 활용법",
  description: "한글타자왕의 다양한 타자 연습 모드를 소개합니다. 자리 연습부터 낱말, 짧은 글, 긴 글 연습, 그리고 재미있는 아케이드 게임까지 모두 무료로 이용하세요.",
  keywords: ["한글타자연습 사용법", "타자 속도 측정 방법", "온라인 타자 연습 가이드", "무료 타자 게임 안내"],
};

export default function GuidePage() {
  return (
    <div className="w-full max-w-5xl mx-auto py-16 px-4">
      <header className="text-center mb-20">
        <h1 className="text-4xl md:text-5xl font-black mb-6">한글타자왕 <span className="text-blue-600">활용 가이드</span></h1>
        <p className="text-xl text-zinc-500 max-w-2xl mx-auto leading-relaxed">
          초보자부터 전문가까지, 단계별로 실력을 키울 수 있는 <br className="hidden md:block" />
          다양한 타자 연습 모드를 확인해보세요.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <GuideSection 
          icon={<Keyboard className="text-blue-600" />}
          title="자리 연습 (Position Practice)"
          desc="타자의 기본은 정확한 손가락 위치입니다. 자음과 모음의 위치를 익히며 기본기를 탄탄하게 다집니다."
          href="/practice"
        />
        <GuideSection 
          icon={<Layout className="text-indigo-600" />}
          title="낱말 연습 (Word Practice)"
          desc="플래시카드 스타일의 UI에서 단어를 입력하며 실력을 키웁니다. 오타 시 흔들림 효과로 즉각적인 피드백을 제공합니다."
          href="/practice"
        />
        <GuideSection 
          icon={<PenTool className="text-purple-600" />}
          title="짧은 글 연습 (Short Practice)"
          desc="포스트잇 감성의 명언과 속담을 입력합니다. 문장을 완성할 때마다 날아가는 애니메이션과 함께 타수(WPM)를 측정합니다."
          href="/practice"
        />
        <GuideSection 
          icon={<BookOpenCheck className="text-blue-500" />}
          title="긴 글 연습 (Long Practice)"
          desc="윤동주, 서정주의 시부터 동화까지, 원고지 느낌의 뷰어에서 정성스럽게 필사하며 집중력을 높여보세요."
          href="/transcription"
        />
        <GuideSection 
          icon={<Gamepad2 className="text-orange-500" />}
          title="아케이드 (Arcade Game)"
          desc="전설적인 '산성비' 게임 모드입니다. 하늘에서 떨어지는 단어를 빠르게 입력하여 높은 점수와 랭킹에 도전하세요."
          href="/game"
        />
        <GuideSection 
          icon={<Users className="text-green-600" />}
          title="오픈 챌린지 (Open Challenge)"
          desc="나만의 연습 문장을 만들고 다른 유저들과 공유하세요. 커뮤니티가 직접 만든 방대한 콘텐츠를 즐길 수 있습니다."
          href="/challenge"
        />
      </div>

      <div className="mt-24 p-10 bg-blue-600 rounded-[3rem] text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-blue-200">
        <div>
            <h2 className="text-3xl font-black mb-2">지금 바로 시작해보세요!</h2>
            <p className="opacity-90 font-medium text-lg">한글타자왕은 별도의 설치 없이 웹에서 바로 이용 가능합니다.</p>
        </div>
        <Link href="/practice" className="px-10 py-5 bg-white text-blue-600 rounded-2xl font-black text-xl flex items-center gap-2 hover:scale-105 transition-all">
            연습장 가기 <ChevronRight />
        </Link>
      </div>
    </div>
  );
}

function GuideSection({ icon, title, desc, href }: { icon: any, title: string, desc: string, href: string }) {
    return (
        <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-xl transition-all group">
            <div className="w-14 h-14 bg-zinc-50 dark:bg-zinc-800 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">{icon}</div>
            <h3 className="text-2xl font-black mb-4">{title}</h3>
            <p className="text-zinc-500 leading-relaxed mb-8">{desc}</p>
            <Link href={href} className="text-blue-600 font-bold flex items-center gap-1 hover:underline">
                직접 체험하기 <ChevronRight size={16} />
            </Link>
        </div>
    );
}
