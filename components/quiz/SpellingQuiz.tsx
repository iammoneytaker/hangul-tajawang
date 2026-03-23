"use client";

import React, { useState, useMemo } from "react";
import { CheckCircle2, XCircle, Lightbulb, Trophy } from "lucide-react";
import { KeyboardRecommendationBanner } from "../layout/KeyboardRecommendationBanner";

interface QuizQuestion {
  question: string;
  correctAnswer: string;
  explanation: string;
  studyTip: string;
  wrongAnswers: string[];
}

const QUIZ_DATA: QuizQuestion[] = [
  {
    question: "내 ___은 네가 행복한 거야.",
    correctAnswer: "바람",
    explanation: "소망은 ‘바람’. ‘바램’은 비표준어입니다.",
    studyTip: "‘바라다’와 어원 연결해 기억하세요.",
    wrongAnswers: ["바램", "바람은", "바람e"],
  },
  {
    question: "감기가 많이 ___.",
    correctAnswer: "나았다",
    explanation: "‘낫다’의 과거형은 ‘나았다’(ㅅ불규칙)입니다.",
    studyTip: "‘낳다’(to bear)와 혼동하지 마세요.",
    wrongAnswers: ["낳았다", "낫았다", "나앗다"],
  },
  {
    question: "상태가 조금씩 좋아져 ___.",
    correctAnswer: "돼 가고 있어",
    explanation: "‘되어 가-’의 준말은 ‘돼 가-’입니다.",
    studyTip: "‘되가-’(X) 항상 ‘돼 가-’(띄어씀).",
    wrongAnswers: ["되가고 있어", "돼가고 있어", "되 가고 있어"],
  },
  {
    question: "연습을 ___ 실력이 늘었어.",
    correctAnswer: "하다 보니",
    explanation: "보조 용언 구성은 띄어 씁니다.",
    studyTip: "‘-아/어 보다, -아/어 보니’ 띄어쓰기 유의.",
    wrongAnswers: ["하다보니", "하 다 보니", "해보니"],
  },
  {
    question: "난 사실을 말했을 ___ .",
    correctAnswer: "뿐이다",
    explanation: "의존명사 ‘뿐’ + 서술격 ‘이다’ → ‘뿐이다’.",
    studyTip: "앞말과는 띄고 ‘뿐이다’는 붙입니다.",
    wrongAnswers: ["뿐 이다", "뿐 이 다", "뿐이다요"],
  }
];

export const SpellingQuiz: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  const question = QUIZ_DATA[currentIndex];

  const shuffledOptions = useMemo(() => {
    if (!question) return [];
    return [question.correctAnswer, ...question.wrongAnswers].sort(() => Math.random() - 0.5);
  }, [question]);

  const handleSelect = (option: string) => {
    if (selectedAnswer) return;
    setSelectedAnswer(option);
    
    if (option === question.correctAnswer) {
      setCorrectAnswers(prev => prev + 1);
    }
    
    setTimeout(() => {
      setShowExplanation(true);
    }, 600);
  };

  const handleNext = () => {
    if (currentIndex < QUIZ_DATA.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setIsGameOver(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setCorrectAnswers(0);
    setShowExplanation(false);
    setIsGameOver(false);
  };

  if (isGameOver) {
    const score = Math.round((correctAnswers / QUIZ_DATA.length) * 100);
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-4">
        <div className="bg-white dark:bg-zinc-900 p-12 rounded-3xl shadow-xl text-center max-w-md w-full border border-zinc-100 dark:border-zinc-800">
          <Trophy className="w-20 h-20 mx-auto text-yellow-400 mb-6" />
          <h2 className="text-3xl font-black mb-2">퀴즈 완료!</h2>
          <p className="text-zinc-500 mb-8">당신의 맞춤법 점수는?</p>
          <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-6xl font-black py-8 rounded-2xl mb-8">
            {score}점
          </div>
          <p className="text-lg font-medium mb-8">
            {score >= 80 ? "훌륭해요! 맞춤법 장인이시네요!" : score >= 60 ? "잘했어요! 조금만 더 다듬어봐요!" : "맞춤법 공부가 조금 더 필요해요!"}
          </p>
          <KeyboardRecommendationBanner variant="light" className="!mt-0 mb-8 !p-4" />
          <button 
            onClick={handleRestart}
            className="w-full py-4 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 text-lg font-bold rounded-xl hover:opacity-90 transition-opacity"
          >
            다시 도전하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto py-12 px-4 min-h-[70vh]">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-black text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
          <span>✍️</span> 맞춤법 퀴즈
        </h2>
        <div className="bg-zinc-100 dark:bg-zinc-800 px-4 py-1.5 rounded-full text-sm font-bold text-zinc-500">
          {currentIndex + 1} / {QUIZ_DATA.length}
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 p-8 md:p-12 rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800 mb-6">
        <p className="text-center text-zinc-500 mb-8 font-medium">빈칸에 들어갈 알맞은 말을 고르세요.</p>
        <h3 className="text-2xl md:text-3xl font-bold text-center leading-relaxed mb-12">
          {question.question.split("___").map((part, i, arr) => (
            <React.Fragment key={i}>
              {part}
              {i < arr.length - 1 && (
                <span className="inline-block w-24 h-10 border-b-2 border-zinc-400 mx-2 align-middle" />
              )}
            </React.Fragment>
          ))}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {shuffledOptions.map((option, idx) => {
            const isSelected = selectedAnswer === option;
            const isCorrect = option === question.correctAnswer;
            
            let btnClass = "border-zinc-200 dark:border-zinc-700 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20";
            if (showExplanation) {
              if (isCorrect) btnClass = "bg-green-100 border-green-500 text-green-700 dark:bg-green-900/30 dark:text-green-400";
              else if (isSelected) btnClass = "bg-red-100 border-red-500 text-red-700 dark:bg-red-900/30 dark:text-red-400";
              else btnClass = "opacity-50 border-zinc-200 dark:border-zinc-700";
            } else if (isSelected) {
              btnClass = "bg-blue-100 border-blue-500 text-blue-700 dark:bg-blue-900/30";
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelect(option)}
                disabled={!!selectedAnswer}
                className={`py-4 px-6 rounded-xl border-2 text-lg font-bold transition-all flex items-center justify-between group ${btnClass}`}
              >
                {option}
                {showExplanation && isCorrect && <CheckCircle2 className="text-green-500" />}
                {showExplanation && isSelected && !isCorrect && <XCircle className="text-red-500" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 해설 영역 */}
      <div className={`transition-all duration-500 transform ${showExplanation ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'}`}>
        <div className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-2xl border border-blue-100 dark:border-blue-900/30 flex flex-col gap-4">
          <div className="flex gap-3 items-start">
            <div className="mt-1 bg-white dark:bg-zinc-800 p-1.5 rounded-lg shadow-sm">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-1">정답: {question.correctAnswer}</h4>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">{question.explanation}</p>
              <p className="text-blue-600 dark:text-blue-400 text-sm font-medium mt-2">💡 Tip: {question.studyTip}</p>
            </div>
          </div>
          <button 
            onClick={handleNext}
            className="w-full py-3 mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-md"
          >
            다음 문제
          </button>
        </div>
      </div>
    </div>
  );
};
