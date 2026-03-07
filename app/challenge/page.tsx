import { Metadata } from "next";
import ClientChallengeWrapper from "./ClientChallengeWrapper";

export const metadata: Metadata = {
  title: "필사 챌린지 - 유저 생성 타자 연습",
  description: "다른 유저들이 직접 창작하고 공유한 글을 필사하며 타자 실력을 키워보세요. 나만의 명문을 공유하고 랭킹에 도전하는 필사 챌린지.",
  openGraph: {
    title: "필사 챌린지 - 한글타자왕",
    description: "함께 쓰고 함께 성장하는 필사 커뮤니티. 지금 참여해 보세요!",
  }
};

export default function ChallengePage() {
  return (
    <div className="w-full max-w-5xl mx-auto py-8">
      <h1 className="sr-only">필사 챌린지 - 유저 참여형 타자 연습</h1>
      <ClientChallengeWrapper />
    </div>
  );
}
