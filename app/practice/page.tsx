import { Metadata } from "next";
import { PositionPractice } from "@/components/word-practice/PositionPractice";
import { WordPractice } from "@/components/word-practice/WordPractice";
import { ShortPractice } from "@/components/short-practice/ShortPractice";
import { Keyboard, Layout, PenTool } from "lucide-react";
import ClientTabWrapper from "./ClientTabWrapper"; // 클라이언트 컴포넌트 분리

export const metadata: Metadata = {
  title: "타자 연습장 (자리/낱말/짧은글)",
  description: "자리 연습, 낱말 연습, 짧은 글 연습을 통해 타자 기본기를 완벽하게 다져보세요. 단계별 학습으로 실력이 쑥쑥 늘어납니다.",
  keywords: ["한글 자리 연습", "낱말 타자 연습", "짧은 글 타자", "타자 실력 향상"],
  openGraph: {
    title: "타자 연습장 - 한글타자왕",
    description: "기초부터 탄탄하게! 한글 타자 연습의 시작은 여기서.",
  }
};

export default function PracticePage() {
  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-4">
      <h1 className="sr-only">한글 타자 연습장 - 자리 연습, 낱말 연습, 짧은 글 연습</h1>
      <ClientTabWrapper />
    </div>
  );
}
