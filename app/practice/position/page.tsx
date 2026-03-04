import { Metadata } from "next";
import { PositionPractice } from "@/components/word-practice/PositionPractice";
import { Keyboard } from "lucide-react";

export const metadata: Metadata = {
  title: "한글 자판 자리 연습 - 기초부터 탄탄하게",
  description: "ㅁㄴㅇㄹ 기본 자리부터 쌍자음까지, 한글 자판 위치를 단계별로 익혀보세요. 초보자를 위한 가장 쉬운 한글 타자 연습.",
  keywords: ["한글 자리 연습", "자판 위치 익히기", "타자 기초", "ㅁㄴㅇㄹ 연습", "한글 자판 연습"],
  openGraph: {
    title: "한글 자판 자리 연습 - 한글타자왕",
    description: "독수리 타법 탈출! 단계별 자리 연습으로 한글 자판을 마스터하세요.",
  }
};

export default function PositionPracticePage() {
  return (
    <div className="w-full max-w-5xl mx-auto py-8">
      <h1 className="sr-only">한글 자판 자리 연습</h1>
      <PositionPractice initialPhase="keys" />
    </div>
  );
}
