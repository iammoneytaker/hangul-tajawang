import { Metadata } from "next";
import { LongPractice } from "@/components/long-practice/LongPractice";

export const metadata: Metadata = {
  title: "긴 글 연습 및 감성 필사",
  description: "아날로그 감성의 원고지 뷰어에서 윤동주 시 등 명문을 필사하며 타자 실력을 키워보세요. 무료 한글 타자 연습 사이트.",
  keywords: ["긴 글 타자 연습", "감성 필사", "원고지 타자", "무료 한글 타자 사이트"],
  openGraph: {
    title: "긴 글 연습 및 감성 필사 - 한글타자왕",
    description: "원고지에 써내려가는 명문. 타자 연습과 감성을 동시에 즐기세요.",
  }
};

export default function TranscriptionPage() {
  return (
    <div className="w-full py-8">
      <h1 className="sr-only">긴 글 연습 및 감성 필사</h1>
      <div className="flex justify-center">
        <LongPractice />
      </div>
    </div>
  );
}
