import { Metadata } from "next";
import ClientChallengeWrapper from "./ClientChallengeWrapper";

export const metadata: Metadata = {
  title: "오픈 챌린지 - 한글타자왕",
  description: "다른 유저들이 직접 창작하고 공유한 글을 필사하며 경쟁해보세요. 랭킹 시스템 지원.",
  openGraph: {
    title: "오픈 챌린지 - 한글타자왕",
    description: "유저들이 만든 글을 필사하고 랭킹에 도전하세요!",
  }
};

export default function ChallengePage() {
  return (
    <div className="w-full max-w-5xl mx-auto py-8">
      <h1 className="sr-only">오픈 챌린지 - 유저 생성 콘텐츠 타자 연습</h1>
      <ClientChallengeWrapper />
    </div>
  );
}
