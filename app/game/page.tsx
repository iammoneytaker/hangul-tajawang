import { Metadata } from "next";
import { WordGame } from "@/components/game/WordGame";

export const metadata: Metadata = {
  title: "아케이드 타자 게임 - 한글타자왕",
  description: "떨어지는 산성비 단어들을 빠르게 타이핑하여 점수를 획득하는 무료 한글 타자 게임입니다. 순발력을 테스트해보세요!",
  openGraph: {
    title: "아케이드 타자 게임 - 한글타자왕",
    description: "떨어지는 단어를 맞춰라! 산성비 타자 게임",
  }
};

export default function GamePage() {
  return (
    <div className="py-8 flex flex-col items-center">
      <h1 className="sr-only">한글 타자 게임 (산성비 모드)</h1>
      <WordGame />
    </div>
  );
}
