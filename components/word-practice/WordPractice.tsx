"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { TypingUtils, TypingReport } from "@/lib/typing-speed";
import { Trophy, ArrowRight, RotateCcw, AlertCircle, Keyboard } from "lucide-react";

const WORD_LIST = [
  "하늘", "바다", "나무", "구름", "햇살", "강물", "숲속", "바람", "꽃향기", "노을",
  "미소", "행복", "사랑", "우정", "희망", "용기", "믿음", "배려", "감사", "약속",
  "사과", "바나나", "포도", "딸기", "수박", "오렌지", "키위", "멜론", "참외", "복숭아"
];

export const WordPractice: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentInput, setCurrentInput] = useState("");
  const [isComposing, setIsComposing] = useState(false); // 한글 IME 상태
  const [correctWords, setCorrectWords] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [isError, setIsError] = useState(false);
  const [isSwipe, setIsSwipe] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [report, setReport] = useState<TypingReport | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [currentIndex, report]);

  const targetWord = WORD_LIST[currentIndex];

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // 한글 조합 중에는 엔터/스페이스 처리를 건너뜀 (중복 제출 방지)
    if (isComposing) return;

    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      submitWord();
    }
  };

  const submitWord = () => {
    const input = currentInput.trim();
    if (!input) return;

    if (!startTime) setStartTime(Date.now());

    if (input === targetWord) {
      // 정답 처리
      setCorrectWords(prev => prev + 1);
      setIsSwipe(true);
      
      setTimeout(() => {
        if (currentIndex < WORD_LIST.length - 1) {
          setCurrentIndex(prev => prev + 1);
          setCurrentInput("");
          setIsSwipe(false);
        } else {
          finishPractice();
        }
      }, 300);
    } else {
      // 오답 처리 (흔들림 애니메이션)
      setIsError(true);
      setErrors(prev => [...new Set([...prev, targetWord])]);
      setTimeout(() => setIsError(false), 500);
    }
  };

  const finishPractice = () => {
    if (!startTime) return;
    const elapsed = (Date.now() - startTime) / 1000;
    // 전체 글자 수 계산 (모든 단어 길이의 합)
    const totalChars = WORD_LIST.reduce((acc, curr) => acc + curr.length, 0);
    
    const finalReport = TypingUtils.generateReport(
      WORD_LIST.join(" "),
      WORD_LIST.join(" "), // 실제 입력값 추적 로직 필요하나 간소화
      totalChars * 2.3, // 추정 타수
      elapsed
    );
    
    setReport({
        ...finalReport,
        correctChars: correctWords, // 여기서는 단어 수로 활용
    });
  };

  const renderHighlight = () => {
    return targetWord.split("").map((char, i) => {
      let color = "text-zinc-300";
      if (i < currentInput.length) {
        color = currentInput[i] === char ? "text-blue-500" : "text-red-500";
      }
      return <span key={i} className={color}>{char}</span>;
    });
  };

  if (report) {
    return (
      <div className="flex flex-col items-center justify-center p-4 animate-in fade-in zoom-in duration-300">
        <div className="bg-white dark:bg-zinc-900 p-10 rounded-3xl shadow-2xl border border-zinc-100 dark:border-zinc-800 text-center max-w-md w-full">
          <Trophy className="w-20 h-20 text-yellow-400 mx-auto mb-6" />
          <h2 className="text-3xl font-black mb-2">연습 완료!</h2>
          <div className="grid grid-cols-2 gap-4 my-8">
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl">
                <p className="text-xs text-zinc-400 font-bold mb-1 uppercase">Accuracy</p>
                <p className="text-2xl font-black text-blue-600">{Math.round((correctWords / WORD_LIST.length) * 100)}%</p>
            </div>
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl">
                <p className="text-xs text-zinc-400 font-bold mb-1 uppercase">Speed</p>
                <p className="text-2xl font-black text-green-600">{report.netSpeed}타</p>
            </div>
          </div>
          
          {errors.length > 0 && (
            <div className="mb-8 text-left">
                <p className="text-xs text-zinc-400 font-bold mb-3 flex items-center gap-1"><AlertCircle size={14}/> 틀렸던 단어</p>
                <div className="flex flex-wrap gap-2">
                    {errors.slice(0, 10).map((w, i) => (
                        <span key={i} className="px-3 py-1 bg-red-50 dark:bg-red-900/20 text-red-500 text-sm rounded-lg font-medium">{w}</span>
                    ))}
                </div>
            </div>
          )}

          <button 
            onClick={() => {
                setCurrentIndex(0);
                setCurrentInput("");
                setReport(null);
                setStartTime(null);
                setErrors([]);
                setCorrectWords(0);
            }}
            className="w-full py-4 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 font-bold rounded-2xl flex items-center justify-center gap-2 hover:opacity-90 transition-all"
          >
            <RotateCcw size={20} /> 다시 하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] w-full max-w-lg mx-auto">
      <div className="mb-12 flex items-center gap-4">
        <div className="px-4 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-sm font-black">
            {currentIndex + 1} / {WORD_LIST.length}
        </div>
        <div className="text-zinc-400 text-sm font-medium">
            정답: <span className="text-zinc-900 dark:text-white font-bold">{correctWords}</span>
        </div>
      </div>

      {/* Flashcard */}
      <div className={`relative w-full aspect-[16/10] flex items-center justify-center bg-white dark:bg-zinc-900 rounded-3xl shadow-xl border-2 transition-all duration-300 transform 
        ${isError ? 'animate-shake border-red-400' : 'border-zinc-100 dark:border-zinc-800'}
        ${isSwipe ? '-translate-x-full opacity-0' : 'translate-x-0 opacity-100'}
      `}>
        <div className="absolute top-0 left-0 w-full h-3 bg-blue-500/10 rounded-t-3xl" />
        <div className="text-7xl font-black tracking-widest transition-all">
          {renderHighlight()}
        </div>
        {/* Analog Decoration */}
        <div className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-zinc-50 dark:bg-zinc-800 shadow-inner" />
      </div>

      {/* Input */}
      <div className="w-full mt-12 relative">
        <input
          ref={inputRef}
          type="text"
          value={currentInput}
          onChange={(e) => setCurrentInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={() => setIsComposing(false)}
          className="w-full h-20 text-3xl text-center bg-zinc-100 dark:bg-zinc-800 border-none rounded-2xl outline-hidden focus:ring-4 focus:ring-blue-500/20 transition-all font-bold placeholder:text-zinc-300"
          placeholder="단어를 입력하세요"
          autoFocus
        />
        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-300">
            <Keyboard size={24} />
        </div>
      </div>

      <div className="mt-8 flex items-center gap-2 text-zinc-400 text-sm font-medium">
        <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-md text-[10px] font-black">ENTER</span>
        또는
        <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-md text-[10px] font-black">SPACE</span>
        키로 제출
      </div>
    </div>
  );
};
