import { Metadata } from "next";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import ClientChallengeWrapper from "./ClientChallengeWrapper";
import { WeeklyChallenges } from '@/components/challenge/WeeklyChallenges';
import { loadWeeklyPopularity } from '@/lib/weekly-popularity';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "필사 챌린지 - 유저 생성 타자 연습",
  description: "다른 유저들이 직접 창작하고 공유한 글을 필사하며 타자 실력을 키워보세요. 나만의 명문을 공유하고 랭킹에 도전하는 필사 챌린지.",
  alternates: {
    canonical: 'https://www.hangul-tajawang.com/challenge',
  },
  openGraph: {
    title: "필사 챌린지 - 한글타자왕",
    description: "함께 쓰고 함께 성장하는 필사 커뮤니티. 지금 참여해 보세요!",
    url: "https://www.hangul-tajawang.com/challenge",
  },
};

/**
 * [SEO 핵심] 서버 컴포넌트에서 챌린지 목록을 SSR로 가져와
 * 정적 <Link prefetch={false}> 태그로 렌더링합니다.
 * 
 * 이를 통해 구글봇이 JS 실행 없이도 120개+ 챌린지 페이지의
 * 내부 링크를 발견하고 크롤링할 수 있게 됩니다.
 */
async function fetchChallengesForSEO() {
  try {
    const { data } = await supabase
      .from('typing_contents')
      .select('id, title, category, complete_count, created_at')
      .lt('report_count', 10)
      .order('created_at', { ascending: false })
      .limit(200); // 최대 200개 링크 노출
    return data || [];
  } catch {
    return [];
  }
}

export default async function ChallengePage() {
  const [challenges, popularity] = await Promise.all([
    fetchChallengesForSEO(),
    loadWeeklyPopularity(supabase).catch(() => {
      console.error('Weekly popularity could not be loaded.');
      return null;
    }),
  ]);

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4">
      <header className="mb-8">
        <h1 className="serif-display text-3xl font-bold">필사 챌린지</h1>
        <p className="mt-3 text-secondary leading-relaxed">함께 나눈 글을 필사하며 타자 실력을 키워보세요.</p>
      </header>
      <WeeklyChallenges popularity={popularity} />
      
      {/* 
        [SEO 크롤링 링크 섹션]
        이 섹션은 구글봇을 위한 표준 <a> 태그 링크 목록입니다.
        시각적으로는 접히는 summary/details 안에 있지만,
        크롤러는 이 링크를 정상적으로 파싱합니다.
      */}
      {challenges.length > 0 && (
        <section aria-label="챌린지 글 목록" className="mb-8">
          <details className="group bg-surface-low rounded-2xl border border-surface-high overflow-hidden">
            <summary className="flex items-center justify-between p-5 cursor-pointer list-none select-none">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-on-surface">
                  전체 챌린지 목록 ({challenges.length}개)
                </span>
              </div>
              <span className="text-zinc-400 text-xs font-bold group-open:rotate-180 transition-transform">
                ▼
              </span>
            </summary>
            <div className="px-5 pb-5">
              <p className="text-xs text-zinc-400 mb-4 font-medium">
                아래 목록에서 원하는 글을 바로 선택하거나, 위의 카드 뷰를 통해 탐색하세요.
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {challenges.map((item) => (
                  <li key={item.id}>
                    <Link prefetch={false}
                      href={`/challenge/${item.id}`}
                      className="flex items-center gap-2 p-3 rounded-xl hover:bg-surface-high transition-colors group/link"
                    >
                      <span className="text-[9px] font-bold uppercase bg-blue-50 text-blue-500 px-2 py-0.5 rounded-md shrink-0">
                        {item.category || 'UGC'}
                      </span>
                      <span className="text-sm font-bold text-on-surface group-hover/link:text-primary transition-colors line-clamp-1">
                        {item.title}
                      </span>
                      <span className="ml-auto text-[10px] text-zinc-400 font-medium shrink-0">
                        {item.complete_count || 0}명
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </details>
        </section>
      )}

      {/* 기존 클라이언트 사이드 챌린지 인터랙티브 UI */}
      <ClientChallengeWrapper />
    </div>
  );
}
