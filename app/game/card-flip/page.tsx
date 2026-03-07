import { Metadata } from "next";
import { CardFlipGame } from "@/components/game/CardFlipGame";
import { Brain, Zap, Trophy, MousePointer2, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "기억력 타자 - 카드 뒤집기 한글 타자 게임",
  description: "타자로 카드를 뒤집어 짝을 맞추는 혁신적인 한글 타자 게임! 기억력과 타자 실력을 동시에 키워보세요. 무료 온라인 타자 게임.",
  keywords: ["카드 뒤집기", "타자 게임", "기억력 게임", "한글 타자 연습", "온라인 타자 게임", "한글타자왕"],
  openGraph: {
    title: "기억력 타자: 카드 뒤집기 - 한글타자왕",
    description: "마우스가 아닌 오직 타자로만 즐기는 기억력 카드 게임! 당신의 기억력 한계에 도전하세요.",
  }
};

export default function CardFlipPage() {
  return (
    <div className="w-full max-w-6xl mx-auto py-8 px-4">
      <h1 className="sr-only">기억력 타자 한글 카드 뒤집기 게임</h1>
      <CardFlipGame />

      {/* SEO 정보 섹션 */}
      <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-12 border-t border-zinc-200 dark:border-zinc-800 pt-16 pb-20">
        <section className="space-y-6">
            <div className="flex items-center gap-3 text-purple-600">
                <Brain size={28} />
                <h2 className="text-2xl font-black">기억력 타자 게임 소개</h2>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
                마우스 클릭 대신 <strong className="text-zinc-900 dark:text-zinc-100">타자 입력</strong>으로 카드를 뒤집는 새로운 방식의 기억력 게임입니다. 
                카드 뒷면에 적힌 단어를 정확하게 입력하면 카드가 뒤집히며 숨겨진 아이콘이 나타납니다. 
                똑같은 아이콘을 가진 카드 짝을 연속으로 뒤집어 모든 카드를 제거해 보세요!
            </p>
        </section>

        <section className="space-y-6">
            <div className="flex items-center gap-3 text-yellow-500">
                <Trophy size={28} />
                <h2 className="text-2xl font-black">게임 규칙 및 점수</h2>
            </div>
            <ul className="space-y-3 text-sm text-zinc-500 font-medium">
                <li className="flex items-start gap-2"><span>✅</span> <strong>타자 입력:</strong> 화면 하단 입력창에 카드 뒷면의 단어를 치고 엔터 또는 스페이스를 누르세요.</li>
                <li className="flex items-start gap-2"><span>✅</span> <strong>짝 맞추기:</strong> 두 장의 카드가 일치하면 점수를 얻고 카드가 고정됩니다.</li>
                <li className="flex items-start gap-2"><span>✅</span> <strong>콤보 보너스:</strong> 실수 없이 연속으로 짝을 맞추면 추가 점수가 기하급수적으로 늘어납니다.</li>
                <li className="flex items-start gap-2"><span>✅</span> <strong>기록 저장:</strong> 제한 시간 내에 모든 짝을 맞추면 전 세계 랭킹에 기록됩니다.</li>
            </ul>
        </section>
      </div>
    </div>
  );
}
