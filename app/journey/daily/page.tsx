import type { Metadata } from 'next';
import Link from 'next/link';
import { DailyJourney } from '@/components/journey/DailyJourney';

export const metadata: Metadata = {
  title: '오늘의 지식타자 5문제',
  description: '국기·수도·역사·과학을 매일 다섯 문제씩 타자로 익혀보세요. 헷갈린 문제는 다음날 복습하고, 중간에 멈춰도 이어서 풀 수 있습니다.',
  alternates: { canonical: 'https://www.hangul-tajawang.com/journey/daily' },
  openGraph: {
    title: '오늘의 지식타자 5문제 - 한글타자왕',
    description: '국기와 수도, 조선 왕조 연대표, 원소기호를 타자로 익히는 매일 다섯 문제.',
    url: 'https://www.hangul-tajawang.com/journey/daily',
  },
};

export default function DailyJourneyPage() {
  return <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:py-12">
    <header className="mb-6">
      <Link href="/journey" prefetch={false} className="text-sm font-semibold text-secondary hover:text-primary">← 지식타자 코스</Link>
      <p className="mt-6 mb-2 text-xs font-semibold tracking-widest text-primary">하루 다섯 문제 · 지식을 쌓는 타자 연습</p>
      <h1 className="serif-display text-3xl sm:text-4xl font-bold text-on-surface">오늘의 지식타자 5문제</h1>
      <p className="mt-3 text-sm sm:text-base text-secondary leading-relaxed">국기 속 나라 이름, 세계의 수도, 조선 왕조, 주기율표를 한글로 입력하며 익혀보세요. 헷갈린 문제는 다음날부터 복습 문제로 다시 만납니다.</p>
    </header>
    <DailyJourney />
    <section className="mt-10 border-t border-outline-variant pt-6" aria-labelledby="daily-guide">
      <h2 id="daily-guide" className="text-lg font-bold">어떤 지식을 배우나요?</h2>
      <ul className="mt-4 space-y-4 text-sm text-secondary leading-relaxed">
        <li><Link href="/journey/flag-quiz" prefetch={false} className="font-bold text-primary underline underline-offset-4">국기 보고 나라 맞히기</Link> · 국기의 색과 무늬를 보고 나라·지역 이름을 직접 입력해요.</li>
        <li><Link href="/journey/world-capitals" prefetch={false} className="font-bold text-primary underline underline-offset-4">세계 수도</Link> · 국기를 보고 나라와 수도를 연결해요. 예를 들어 대한민국의 수도는 서울입니다.</li>
        <li><Link href="/journey/periodic-table" prefetch={false} className="font-bold text-primary underline underline-offset-4">주기율표</Link> · 원자번호와 원소기호를 함께 익혀요. 원자번호 1번, H는 수소입니다.</li>
        <li><Link href="/journey/joseon-kings" prefetch={false} className="font-bold text-primary underline underline-offset-4">조선 왕조</Link> · 재위 기간과 순서를 연결해요. 조선의 첫 번째 왕은 태조입니다.</li>
      </ul>
      <p className="mt-5 text-sm text-secondary leading-relaxed">하루의 기준은 한국 시간 자정입니다. 정답을 입력한 뒤 Enter 또는 정답 확인을 누르세요. 힌트를 사용하거나 틀린 문제는 먼저 복습하고, 혼자 맞힌 문제는 간격을 늘려 복습합니다.</p>
      <noscript><p className="mt-4">문제를 풀고 진도를 저장하려면 JavaScript를 켜 주세요. 위 코스 링크에서는 학습 내용을 살펴볼 수 있습니다.</p></noscript>
    </section>
  </div>;
}
