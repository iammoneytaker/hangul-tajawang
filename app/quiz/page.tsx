import { Metadata } from "next";
import { SpellingQuiz } from "@/components/quiz/SpellingQuiz";

export const metadata: Metadata = {
  title: "맞춤법 퀴즈 - 한글타자왕",
  description: "자주 틀리는 맞춤법 퀴즈를 풀며 정확한 한글 표기법을 학습해보세요.",
  openGraph: {
    title: "맞춤법 퀴즈 - 한글타자왕",
    description: "당신의 맞춤법 실력은? 퀴즈로 알아보세요!",
  }
};

export default function QuizPage() {
  return (
    <>
      <h1 className="sr-only">자주 틀리는 한글 맞춤법 퀴즈</h1>
      <SpellingQuiz />
    </>
  );
}
