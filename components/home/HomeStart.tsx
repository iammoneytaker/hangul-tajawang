'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Play } from 'lucide-react';
import { useHydrated } from '@/hooks/useHydrated';
import { getLatestActivity } from '@/lib/resume-activity';
import { loadDailyState } from '@/lib/daily-journey-storage';
import { useDailyAccount } from '@/hooks/useDailyAccount';

export function HomeStart() {
  const hydrated = useHydrated();
  const userId = useDailyAccount();
  return <div className="w-full max-w-3xl text-left">
    {hydrated && userId !== undefined && <ReturningActivity key={userId || 'guest'} userId={userId} />}
    <nav aria-label="목적별 바로 시작" className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {[
        { href: '/practice', title: '타자 실력 키우기', description: '자리부터 낱말까지 차근차근', key: '연' },
        { href: '/journey/daily', title: '지식 외우기', description: '오늘의 다섯 문제로 가볍게', key: '지' },
        { href: '/transcription', title: '좋은 글 필사하기', description: '마음에 남는 문장 한 편', key: '필' },
      ].map(item => <Link key={item.href} href={item.href} prefetch={false} className="group flex items-center gap-3 rounded-xl border border-outline-variant bg-surface-lowest px-4 py-4 hover:border-primary focus-visible:outline-2 focus-visible:outline-primary">
        <span className="keycap flex h-10 w-10 shrink-0 items-center justify-center font-bold text-primary">{item.key}</span>
        <span><span className="block font-bold group-hover:text-primary">{item.title}</span><span className="mt-1 block text-xs text-secondary">{item.description}</span></span>
      </Link>)}
    </nav>
    <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 mt-5 text-sm font-semibold text-secondary">
      <Link href="/test" prefetch={false} className="hover:text-primary">내 실력은? 1분 테스트 →</Link>
      <Link href="/game" prefetch={false} className="hover:text-primary">게임 즐기기 →</Link>
      <Link href="/challenge" prefetch={false} className="hover:text-primary">필사 챌린지 →</Link>
    </div>
  </div>;
}

function ReturningActivity({ userId }: { userId: string | null }) {
  const [activity] = useState(() => getLatestActivity(userId));
  const [daily] = useState(() => loadDailyState(new Date(), userId).session);
  if (!activity && !daily?.completedAt) return null;
  return <Link href={activity?.href || '/journey/daily'} prefetch={false} className="flex items-center gap-4 rounded-xl bg-primary text-white p-5 mb-4 hover:bg-blue-700">
    <Play size={20} className="shrink-0" />
    <span className="flex-1 min-w-0"><span className="block text-xs mb-1 opacity-90">{activity ? '최근 하던 활동 이어하기' : '오늘의 목표를 마쳤어요'}</span><span className="block font-bold truncate">{activity?.title || '지식타자 다섯 문제 완료'}</span><span className="text-xs opacity-90">{activity?.progress || '오늘 배운 내용 확인하기'}</span></span>
    <ArrowRight size={20} className="shrink-0" />
  </Link>;
}
