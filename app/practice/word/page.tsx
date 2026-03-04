import { Metadata } from "next";
import { PositionPractice } from "@/components/word-practice/PositionPractice";

export const metadata: Metadata = {
  title: "한글 낱말 연습 - 실전 단어 타자 연습",
  description: "일상생활에서 자주 쓰이는 한글 단어로 타자 연습을 해보세요. 정확도와 속도를 동시에 높일 수 있는 최고의 낱말 타자 연습장.",
  keywords: ["한글 낱말 연습", "단어 타자", "한글 실전 연습", "타자 연습 사이트", "낱말 타자 연습"],
  openGraph: {
    title: "한글 낱말 타자 연습 - 한글타자왕",
    description: "다양한 주제의 단어로 타자 실력을 키워보세요!",
  }
};

export default function WordPracticePage() {
  return (
    <div className="w-full max-w-5xl mx-auto py-8">
      <h1 className="sr-only">한글 낱말 타자 연습</h1>
      <PositionPractice initialPhase="words" />
    </div>
  );
}
