import { Metadata } from "next";
import { ShortPractice } from "@/components/short-practice/ShortPractice";

export const metadata: Metadata = {
  title: "한글 짧은 글 연습 - 감성 문장 타자 연습",
  description: "명언, 시구, K-POP 가사 등 짧은 글귀를 치며 타자 속도를 측정하고 연습하세요. 정확도 100%에 도전해 보세요.",
  keywords: ["짧은 글 타자", "한글 문장 연습", "타자 속도 측정", "타수 올리기", "감성 문장 타자"],
  openGraph: {
    title: "한글 짧은 글 타자 연습 - 한글타자왕",
    description: "한 문장 한 문장 정성껏 치다 보면 실력이 쑥쑥!",
  }
};

export default function ShortPracticePage() {
  return (
    <div className="w-full max-w-5xl mx-auto py-8">
      <h1 className="sr-only">한글 짧은 글 타자 연습</h1>
      <ShortPractice />
    </div>
  );
}
