import { Metadata } from 'next';
import { PositionPractice } from '@/components/word-practice/PositionPractice';
import { Keyboard } from 'lucide-react';

export const metadata: Metadata = {
  title: "한글 자판 자리 연습 - 독수리 타법 탈출 기초",
  description: "ㅁㄴㅇㄹ 기본 자리부터 쌍자음까지, 한글 자판 위치를 단계별로 빠르게 익혀보세요. 독수리 타법을 교정하고 타수를 급격히 올리는 가장 쉬운 타자 연습 사이트입니다.",
  keywords: ["한글 자리 연습", "자판 위치 익히기", "타자 기초", "ㅁㄴㅇㄹ 연습", "한글 자판 연습", "독수리 타법 교정", "키보드 자리 외우기", "두벌식 자판"],
  openGraph: {
    title: "한글 자판 자리 연습 - 한글타자왕",
    description: "독수리 타법 탈출! 단계별 자리 연습으로 한글 자판을 하루 만에 마스터하세요.",
  }
};

export default function PositionPracticePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "한글 자판 자리 연습",
    "applicationCategory": "EducationalApplication",
    "operatingSystem": "All",
    "description": "한글 키보드(두벌식)의 자리와 위치를 외우기 위한 기초 타자 연습 웹 프로그램입니다. 독수리 타법을 빠르게 교정할 수 있습니다.",
    "author": {
      "@type": "Organization",
      "name": "한글타자왕"
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      
      <div className="flex flex-col items-center">
        <PositionPractice initialPhase="keys" />

        <article className="mt-20 w-full px-6 lg:px-8 animate-in fade-in duration-1000">
            <h1 className="text-3xl font-black mb-8 border-b border-surface-high pb-4 flex items-center gap-4">
               <Keyboard className="text-primary w-8 h-8"/> 한글 자판 자리 연습: 독수리 타법 완벽 교정 가이드
            </h1>
            
            <div className="prose dark:prose-invert prose-lg text-zinc-700 dark:text-zinc-300 max-w-none">
                <p className="leading-relaxed mb-8">
                    컴퓨터나 노트북을 처음 접하거나, 아직도 두 손가락으로만 타자를 치는 소위 <strong>'독수리 타법'</strong>을 사용하고 계신가요? 
                    타자 속도(타수)를 올리고 오타율을 줄이기 위해서는 <strong>키보드의 자판 위치</strong>를 정확하게 외우고, 각 키를 눌러야 하는 올바른 손가락을 익히는 것이 무엇보다 중요합니다.
                </p>

                <div className="bg-surface-low p-10 rounded-[2.5rem] leading-loose font-medium border border-surface-high shadow-inner mb-8 text-base">
                    <h2 className="text-2xl font-bold mb-6 text-primary">올바른 한글(두벌식) 자판 위치 및 손가락 배치법</h2>
                    <p className="mb-4">
                        한글 두벌식 키보드에서 제일 기본이 되는 <strong>'기본 자리'</strong>는 중간 줄(A~L)입니다.<br/>
                        양손의 검지(집게손가락)를 키보드 자판의 <code>F(ㄹ)</code>와 <code>J(ㅓ)</code> 키 위에 올려보세요. 이 두 키에는 작은 돌기가 튀어나와 있어 화면만 보고도 손가락의 위치를 잡을 수 있습니다.
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-zinc-700 dark:text-zinc-300 font-medium">
                        <li><strong>왼손 기본 자리:</strong> 새끼손가락부터 차례대로 <code>A(ㅁ)</code>, <code>S(ㄴ)</code>, <code>D(ㅇ)</code>, <code>F(ㄹ)</code></li>
                        <li><strong>오른손 기본 자리:</strong> 검지부터 차례대로 <code>J(ㅓ)</code>, <code>K(ㅏ)</code>, <code>L(ㅣ)</code>, <code>;(;)</code></li>
                        <li><strong>엄지손가락:</strong> 스페이스바(Space Bar) 위에 자연스럽게 둡니다.</li>
                    </ul>
                </div>

                <div className="bg-surface-lowest p-8 rounded-[2.5rem] border border-surface-high">
                    <h3 className="text-xl font-bold mb-4 text-on-surface">단계별 학습 전략</h3>
                    <p className="text-zinc-700 dark:text-zinc-300 mb-4 font-normal">본 '한글타자왕'의 자리 연습 모드는 다음과 같이 구성되어 있습니다.</p>
                    <ol className="list-decimal pl-6 space-y-4 text-zinc-700 dark:text-zinc-300 font-medium">
                        <li><strong>기본 자리 (중간 줄):</strong> 가장 빈번하게 사용되며 손가락의 중심이 되는 ㅁ, ㄴ, ㅇ, ㄹ 위치를 연습합니다.</li>
                        <li><strong>윗 자리 (상단 줄):</strong> ㅂ, ㅈ, ㄷ, ㄱ, ㅅ 등 자음이 모여 있는 윗줄로 손가락을 뻗는 연습을 진행합니다.</li>
                        <li><strong>밑 자리 (하단 줄):</strong> ㅋ, ㅌ, ㅊ, ㅍ 등 상대적으로 빈도가 낮지만 정확하게 누르기 까다로운 하단 자음을 숙달합니다.</li>
                        <li><strong>쌍자음 연습 (Shift 키):</strong> 새끼손가락으로 Shift키를 누르면서 동시에 반대편 손가락으로 ㄲ, ㄸ, ㅃ 등을 입력하는 고급 기술을 훈련합니다.</li>
                    </ol>
                </div>
            </div>
        </article>
      </div>
    </div>
  );
}
