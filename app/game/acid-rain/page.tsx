import { Metadata } from 'next';
import { WordGame } from '@/components/game/WordGame';
import {
  Info,
  Zap,
  ShieldCheck,
  Trophy,
  Target,
  MousePointer2,
} from 'lucide-react';

export const metadata: Metadata = {
  title: '한글 산성비 게임 - 추억의 타자 게임 온라인 무료',
  description:
    '하늘에서 내려오는 단어들을 빠르게 입력하여 제거하세요! 추억의 산성비 게임을 현대적인 감각으로 재해석했습니다. 실시간 랭킹과 다양한 아이템 기믹을 지원합니다.',
  keywords: [
    '산성비 게임',
    '한글 산성비',
    '단어 게임',
    '타자 속도 게임',
    '온라인 산성비',
    '무료 타자 게임',
    '한글타자왕 게임',
  ],
  openGraph: {
    title: '한글 산성비 게임 - 한글타자왕',
    description:
      '한순간도 방심할 수 없는 긴장감! 산성비 게임으로 당신의 타자 실력을 증명하세요.',
  },
};

export default function AcidRainPage() {
  return (
    <div className="w-full max-w-6xl mx-auto py-8 px-4">
      <h1 className="sr-only">한글 산성비 타자 게임 - 온라인 랭킹 시스템</h1>

      {/* 게임 본체 */}
      <WordGame />

      {/* SEO 및 정보 섹션 */}
      <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-12 border-t border-zinc-200 dark:border-zinc-800 pt-16 pb-20">
        {/* 1. 게임 소개 및 플레이 방법 */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 text-blue-600">
            <Target size={28} />
            <h2 className="text-2xl font-black">한글 산성비 게임 소개</h2>
          </div>
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
            추억의 한글 타자 연습 게임인{' '}
            <strong className="text-zinc-900 dark:text-zinc-100">
              산성비(Acid Rain)
            </strong>
            를 웹에서 설치 없이 바로 즐겨보세요. 하늘에서 떨어지는 단어들이
            바닥에 닿기 전에 정확하게 입력하여 점수를 획득하는 방식입니다.
            레벨이 올라갈수록 단어의 속도가 빨라지며, 다양한 방해 기믹이
            추가되어 긴장감 넘치는 플레이를 선사합니다.
          </p>
          <ul className="space-y-3 text-sm text-zinc-500">
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">✔</span>
              <span>
                <strong className="text-zinc-800 dark:text-zinc-200">
                  생명력:
                </strong>{' '}
                총 5개의 하트를 가지고 시작하며, 단어를 놓칠 때마다 1개씩
                차감됩니다.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">✔</span>
              <span>
                <strong className="text-zinc-800 dark:text-zinc-200">
                  레벨업:
                </strong>{' '}
                500점 단위로 레벨이 상승하며 하강 속도와 생성 주기가 빨라집니다.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">✔</span>
              <span>
                <strong className="text-zinc-800 dark:text-zinc-200">
                  콤보 보너스:
                </strong>{' '}
                연속해서 단어를 맞추면 콤보 보너스 점수가 추가됩니다.
              </span>
            </li>
          </ul>
        </section>

        {/* 2. 아이템 및 기믹 설명 */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 text-orange-500">
            <Zap size={28} />
            <h2 className="text-2xl font-black">아이템 및 방해 기믹</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800">
              <h4 className="font-black mb-2 flex items-center gap-2">
                💣 폭탄 아이템
              </h4>
              <p className="text-xs text-zinc-500 leading-normal">
                현재 화면에 있는 모든 단어를 즉시 제거하고 대량의 점수를
                획득합니다.
              </p>
            </div>
            <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800">
              <h4 className="font-black mb-2 flex items-center gap-2">
                ❄️ 얼음 아이템
              </h4>
              <p className="text-xs text-zinc-500 leading-normal">
                5초 동안 단어의 하강 속도를 대폭 늦춰 위기를 탈출할 기회를
                줍니다.
              </p>
            </div>
            <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800">
              <h4 className="font-black mb-2 flex items-center gap-2">
                ✨ 황금 단어
              </h4>
              <p className="text-xs text-zinc-500 leading-normal">
                일반 단어보다 10배 높은 점수를 주는 희귀한 보너스 단어입니다.
              </p>
            </div>
            <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800">
              <h4 className="font-black mb-2 flex items-center gap-2">
                🔄 방해 기믹
              </h4>
              <p className="text-xs text-zinc-500 leading-normal">
                고레벨에서는 단어가 좌우로 움직이거나 깜빡이며 사용자를
                방해합니다.
              </p>
            </div>
          </div>
        </section>

        {/* 3. 데이터 저장 및 랭킹 시스템 */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 text-yellow-500">
            <Trophy size={28} />
            <h2 className="text-2xl font-black">실시간 랭킹 시스템</h2>
          </div>
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
            한글타자왕은 실시간 데이터베이스 기술을 활용하여 전 세계 유저들의
            점수를 투명하게 관리합니다.
          </p>
          <div className="flex items-start gap-4 p-5 bg-yellow-50 dark:bg-yellow-900/10 rounded-[2rem] border border-yellow-100 dark:border-yellow-900/20">
            <ShieldCheck className="text-yellow-600 shrink-0" size={24} />
            <div>
              <h4 className="font-black text-yellow-700 dark:text-yellow-500 text-sm mb-1">
                안전한 데이터 보존
              </h4>
              <p className="text-xs text-yellow-600/80 dark:text-yellow-500/60 leading-normal">
                로그인 후 플레이하시면 본인의 최고 점수, 최고 레벨, 최대 콤보
                기록이 서버에 영구적으로 보관되며, 실시간 랭킹보드에 본인의
                닉네임과 프로필이 자동으로 등록됩니다.
              </p>
            </div>
          </div>
        </section>

        {/* 4. 타자 연습 효과 */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 text-green-600">
            <MousePointer2 size={28} />
            <h2 className="text-2xl font-black">타자 연습 효과</h2>
          </div>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center shrink-0 font-black text-green-600">
                01
              </div>
              <p className="text-sm text-zinc-500 pt-2">
                <strong className="text-zinc-800 dark:text-zinc-200">
                  순발력 향상:
                </strong>{' '}
                무작위 위치에서 떨어지는 단어에 즉각 반응하여 입력하는 훈련이
                됩니다.
              </p>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center shrink-0 font-black text-green-600">
                02
              </div>
              <p className="text-sm text-zinc-500 pt-2">
                <strong className="text-zinc-800 dark:text-zinc-200">
                  정확도 개선:
                </strong>{' '}
                오타 시 단어가 제거되지 않으므로 정확한 타건 습관을 기를 수
                있습니다.
              </p>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center shrink-0 font-black text-green-600">
                03
              </div>
              <p className="text-sm text-zinc-500 pt-2">
                <strong className="text-zinc-800 dark:text-zinc-200">
                  어휘력 증진:
                </strong>{' '}
                기초 단어부터 사자성어까지 난이도별로 구성된 풍부한 단어
                데이터를 익힐 수 있습니다.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
