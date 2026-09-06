import Link from 'next/link';
import { ArrowRight, BookOpen } from 'lucide-react';
import type { WeeklyPopularity } from '@/lib/weekly-popularity';

export function WeeklyChallenges({ popularity }: { popularity: WeeklyPopularity | null }) {
  const updated = popularity ? new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false,
  }).format(new Date(popularity.asOf)) : null;
  return <section aria-labelledby="weekly-challenges-title" className="mb-8">
    <div className="flex flex-wrap items-end justify-between gap-2 mb-3">
      <h2 id="weekly-challenges-title" className="serif-display text-2xl font-bold">최근 7일 인기 필사</h2>
      {updated && <p className="text-xs text-secondary"><time dateTime={popularity?.asOf}>{updated}</time> 기준 · 한국 시간</p>}
    </div>
    <p className="text-sm text-secondary leading-relaxed mb-5">최근 7일간 완주한 로그인 사용자 수로 선정합니다. 같은 글의 반복 완주는 한 명으로 세며, 동률이면 최근 완주 순입니다. 1시간 간격으로 갱신됩니다.</p>
    {!popularity ? <p className="rounded-2xl bg-surface-low p-5 text-sm text-secondary">인기 필사를 잠시 불러오지 못했어요. 아래 목록에서 글을 골라보세요.</p>
      : !popularity.items.length ? <p className="rounded-2xl bg-surface-low p-5 text-sm text-secondary">최근 7일간 완주 기록이 아직 없어요. 아래에서 마음에 드는 글을 골라 첫 완주를 남겨보세요.</p> :
    <div className="grid gap-3 sm:grid-cols-3">
      {popularity.items.map((item, index) => <Link key={item.id} href={`/challenge/${item.id}`} prefetch={false}
        className="group flex flex-col rounded-2xl border border-outline-variant bg-surface-lowest p-5 hover:border-primary focus-visible:outline-2 focus-visible:outline-primary">
        <div className="flex items-center justify-between text-primary mb-4"><span className="text-xs font-bold">{index + 1}위 · {item.category || '함께 쓰는 글'}</span><BookOpen size={18} /></div>
        <h3 className="text-lg font-bold leading-relaxed break-keep group-hover:text-primary">{item.title}</h3>
        <p className="mt-3 text-sm text-secondary">최근 7일 <strong className="text-on-surface">{item.participants}명</strong> 완주</p>
        <span className="flex items-center gap-2 text-sm font-semibold text-secondary mt-auto pt-5">필사 시작하기 <ArrowRight size={15} /></span>
      </Link>)}
    </div>}
  </section>;
}
