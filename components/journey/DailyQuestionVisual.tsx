import Image from 'next/image';
import type { DailyQuestion } from '@/lib/daily-journey';

export function DailyQuestionVisual({ question }: { question: DailyQuestion }) {
  const visual = question.visual;
  switch (visual.kind) {
    case 'flag':
      return <figure className="mb-6 flex items-center gap-5 rounded-xl bg-surface-low p-5">
        <Image src={`https://flagcdn.com/w160/${visual.countryCode}.png`} alt={`${visual.country} 국기`}
          width={120} height={80} unoptimized className="h-20 w-30 shrink-0 object-contain" />
        <figcaption className="text-sm text-secondary leading-relaxed">국기와 나라를 함께 기억해요.<span className="block mt-1 font-bold text-on-surface">{visual.country}</span></figcaption>
      </figure>;
    case 'element':
      return <figure className="mb-6 flex items-center gap-5">
        <div className="h-32 w-28 shrink-0 rounded-xl border-2 border-primary bg-primary/5 p-3 text-primary" aria-label={`원자번호 ${visual.atomicNumber}, 원소기호 ${visual.symbol}`}>
          <span className="block text-sm font-semibold">{visual.atomicNumber}</span>
          <span className="block text-center text-5xl font-bold leading-tight mt-2">{visual.symbol}</span>
        </div>
        <figcaption className="text-sm text-secondary leading-relaxed">원소기호를 보고<br />한글 이름을 떠올려 보세요.</figcaption>
      </figure>;
    case 'history':
      return <figure className="mb-6 rounded-xl border-l-4 border-primary bg-surface-low p-5">
        <figcaption className="text-xs font-semibold text-secondary">조선 왕조 연대표</figcaption>
        <p className="mt-2 text-xl font-bold">제{visual.order}대 <span className="mx-2 text-primary" aria-hidden="true">·</span> {visual.year}</p>
        <p className="mt-2 text-xs text-secondary">재위 기간과 순서를 함께 기억해요.</p>
      </figure>;
  }
}
