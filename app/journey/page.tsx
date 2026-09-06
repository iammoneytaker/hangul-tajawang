import { Metadata } from 'next';
import Link from 'next/link';
import { Brain, Lightbulb, Repeat, Sparkles, ArrowRight } from 'lucide-react';
import { JOURNEY_COURSES, getCourseStations } from '@/lib/journey-data';
import { JourneyHubProgress } from '@/components/journey/JourneyHubProgress';

export const metadata: Metadata = {
  title: '지식타자 - 지식을 쌓으며 타자 실력을 높이는 암기 타자',
  description:
    '조선 왕조 27대(태정태세문단세), 세계 수도, 주기율표까지 — 순서가 있는 지식을 한 항목씩 타자로 정복하며 외웁니다. 초성 힌트로 다음 항목을 떠올리고, 핵심 지식 한 줄을 손으로 새기며 암기하세요.',
  keywords: [
    '지식타자',
    '태정태세문단세',
    '조선왕조 계보 외우기',
    '세계 수도 외우기',
    '주기율표 외우기',
    '암기 타자 게임',
    '역사 암기 게임',
    '한글 타자 연습',
    '한글타자왕',
  ],
  alternates: {
    canonical: 'https://www.hangul-tajawang.com/journey',
  },
  openGraph: {
    title: '지식타자 - 지식을 쌓으며 타자 실력까지 | 한글타자왕',
    description:
      '순서가 있는 지식을 한 항목씩 타자로 정복! 조선 왕조 27대, 세계 수도, 주기율표 코스에 도전해보세요.',
    url: 'https://www.hangul-tajawang.com/journey',
  },
};

// 허브 진열 순서 — 수도 → 조선 → 국기 → 주기율표 → 삼국
const COURSE_ORDER = ['world-capitals', 'joseon-kings', 'flag-quiz', 'map-quiz', 'periodic-table', 'three-kingdoms'];
const orderIndex = (id: string) => {
  const i = COURSE_ORDER.indexOf(id);
  return i === -1 ? 999 : i;
};

export default function JourneyHubPage() {
  const orderedCourses = [...JOURNEY_COURSES].sort((a, b) => orderIndex(a.id) - orderIndex(b.id));
  return (
    <div className="w-full max-w-4xl mx-auto py-10 px-4">
      <h1 className="sr-only">지식타자 - 지식을 쌓으며 타자 실력을 높이는 암기 타자, 조선 왕조·세계 수도·주기율표</h1>

      {/* 헤더 */}
      <div className="text-center mb-12">
        <span className="text-primary font-semibold text-xs uppercase tracking-[0.25em] mb-3 block">
          Knowledge Typing
        </span>
        <h2 className="serif-display text-4xl md:text-5xl font-bold text-on-surface mb-4">
          지식타자
        </h2>
        <p className="text-secondary font-medium max-w-xl mx-auto leading-relaxed">
          순서가 있는 지식을 한 항목씩 타자로 정복하세요. 다음 항목을 직접 입력해
          이동하고, 도착하면 공개되는 핵심 지식 한 줄까지 새겨야 다음으로 넘어갑니다.
          눈으로 외우지 말고, 손으로 외우세요.
        </p>
      </div>

      {/* 코스 카드 */}
      <Link href="/journey/daily" prefetch={false} className="flex items-center justify-between gap-4 bg-primary text-white p-6 rounded-2xl mb-6 hover:bg-blue-700">
        <span><span className="block font-bold text-xl">오늘의 지식타자 5문제</span><span className="block text-sm mt-2 opacity-90">짧게 배우고, 헷갈린 문제는 내일 다시 복습해요.</span></span>
        <ArrowRight className="shrink-0" size={24} />
      </Link>
      <div className="hub-panel grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
        {orderedCourses.map((course) => {
          const stations = getCourseStations(course);
          return (
            <Link
              key={course.id}
              prefetch={false}
              href={`/journey/${course.id}`}
              className="group keycap-card p-8"
            >
              <div className="flex items-start justify-between mb-6">
                <span className="text-5xl" aria-hidden>{course.emoji}</span>
                <div className="flex flex-col items-end gap-2">
                  <span className="px-3 py-1 rounded-full bg-surface-low text-secondary text-[11px] font-bold">
                    {course.category} · {stations.length}개
                  </span>
                  <JourneyHubProgress courseId={course.id} totalStations={stations.length} />
                </div>
              </div>
              <h3 className="serif-display text-2xl font-bold mb-1">{course.title}</h3>
              <p className="text-sm font-bold text-primary mb-3">{course.subtitle}</p>
              <p className="text-sm text-secondary leading-relaxed mb-6">{course.description}</p>
              <span className="inline-flex items-center gap-2 text-sm font-bold text-on-surface group-hover:gap-3 transition-all">
                코스 시작하기 <ArrowRight size={16} />
              </span>
            </Link>
          );
        })}

        {/* 다음 코스 예고 */}
        <div className="p-8 bg-surface-low rounded-2xl flex flex-col items-center justify-center text-center gap-3">
          <div className="text-4xl opacity-60">🚧</div>
          <p className="font-bold text-secondary/70">새 코스 준비 중</p>
          <p className="text-xs text-secondary/70 font-medium leading-relaxed">
            한국사 연표 등 새 코스가
            <br />
            차례로 추가될 예정입니다.
          </p>
        </div>
      </div>

      {/* SEO 및 정보 섹션 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-outline-variant pt-16 pb-10">
        <section className="space-y-4">
          <div className="flex items-center gap-3 text-primary">
            <Brain size={24} />
            <h2 className="text-xl font-bold">손으로 외우는 지식</h2>
          </div>
          <p className="text-sm text-secondary leading-relaxed font-medium">
            태정태세문단세처럼 순서가 생명인 지식은 눈으로 읽는 것보다 손으로 직접
            입력할 때 훨씬 오래 남습니다. 지식타자는 암기할 항목을 한 걸음씩 코스로
            바꿔, 다음 항목을 직접 타이핑해야 앞으로 나아가는 학습 방식입니다.
          </p>
        </section>
        <section className="space-y-4">
          <div className="flex items-center gap-3 text-amber-500">
            <Lightbulb size={24} />
            <h2 className="text-xl font-bold">초성 힌트 시스템</h2>
          </div>
          <p className="text-sm text-secondary leading-relaxed font-medium">
            다음 항목의 이름은 초성만 보입니다. &ldquo;ㅅㅈ&rdquo;을 보고 세종을
            떠올리는 과정 자체가 인출 연습(retrieval practice)이라 단순 반복보다
            기억 정착 효과가 큽니다. 도저히 생각나지 않으면 힌트 버튼으로 정답을
            확인할 수 있어요.
          </p>
        </section>
        <section className="space-y-4">
          <div className="flex items-center gap-3 text-green-600">
            <Repeat size={24} />
            <h2 className="text-xl font-bold">이어가기와 재완주</h2>
          </div>
          <p className="text-sm text-secondary leading-relaxed font-medium">
            중간에 멈춰도 진행한 곳까지 자동 저장되어 언제든 이어갈 수 있습니다.
            완주 기록은 계속 쌓이므로, 며칠 간격을 두고 다시 완주하면 장기 기억으로
            넘어가는 간격 반복 학습이 됩니다.
          </p>
        </section>
      </div>

      <div className="flex items-center justify-center gap-2 text-xs font-bold text-secondary/70 pb-10">
        <Sparkles size={14} />
        타자 연습과 암기 학습을 한 번에 — 한글타자왕 지식타자
      </div>
    </div>
  );
}
