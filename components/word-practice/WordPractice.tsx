"use client";

import React, { useState, useEffect, useRef } from "react";
import { TypingUtils, TypingReport } from "@/lib/typing-speed";
import { Trophy, RotateCcw, Target, Zap, Clock } from "lucide-react";

const WORDS = [
  "사과", "바나나", "포도", "딸기", "수박", "오렌지", "망고", "체리", "키위", "참외",
  "컴퓨터", "마우스", "키보드", "모니터", "책상", "의자", "노트북", "프린터", "스피커", "마이크",
  "하늘", "구름", "바람", "바다", "파도", "나무", "숲", "꽃", "들판", "태양",
  "학교", "선생님", "학생", "공부", "책", "연필", "공책", "도서관", "운동장", "칠판"
];

export const WordPractice: React.FC = () => {
  const [currentWords, setCurrentWords] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [correctWords, setCorrectWords] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [report, setReport] = useState<TypingReport | null>(null);
  const [totalStrokes, setTotalStrokes] = useState(0);
  
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // 단어 무작위 셔플 (20개 추출)
    const shuffled = [...WORDS].sort(() => Math.random() - 0.5).slice(0, 20);
    setCurrentWords(shuffled);
    inputRef.current?.focus();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    if (!startTime && value.length > 0) {
      setStartTime(Date.now());
    }

    // 스페이스바나 엔터를 눌렀을 때 단어 체크
    if (value.endsWith(" ")) {
      checkWord(value.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      checkWord(inputValue.trim());
    }
    // 실제 자소 타수 카운트
    if (!["Shift", "Control", "Alt", "Meta", "CapsLock", "Escape"].includes(e.key)) {
        setTotalStrokes(prev => prev + 1);
    }
  };

  const checkWord = (word: string) => {
    if (!word) return;

    if (word === currentWords[currentIndex]) {
      setCorrectWords(prev => prev + 1);
    }

    if (currentIndex === currentWords.length - 1) {
      finishPractice();
    } else {
      setCurrentIndex(prev => prev + 1);
      setInputValue("");
    }
  };

  const finishPractice = () => {
    const timeTaken = (Date.now() - (startTime || Date.now())) / 1000;
    // 모든 단어를 하나의 문장으로 합쳐서 리포트 생성
    const fullOriginal = currentWords.join(" ");
    const finalReport = TypingUtils.generateReport(fullOriginal, fullOriginal, totalStrokes, timeTaken);
    
    setReport(finalReport);
  };

  const reset = () => {
    const shuffled = [...WORDS].sort(() => Math.random() - 0.5).slice(0, 20);
    setCurrentWords(shuffled);
    setCurrentIndex(0);
    setInputValue("");
    setCorrectWords(0);
    setStartTime(null);
    setElapsedSeconds(0);
    setReport(null);
    setTotalStrokes(0);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  if (report) {
    return (
      <div className="flex flex-col items-center justify-center py-12 animate-in zoom-in duration-300">
        <div className="bg-white dark:bg-zinc-900 p-10 rounded-[2.5rem] shadow-2xl border border-zinc-100 dark:border-zinc-800 text-center max-w-md w-full">
          <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-6" />
          <h2 className="text-3xl font-black mb-2">연습 완료!</h2>
          <p className="text-zinc-500 mb-8">낱말 연습 결과입니다.</p>
          
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-2xl">
                <p className="text-[10px] font-black text-zinc-400 uppercase mb-1">정확도</p>
                <p className="text-2xl font-black text-blue-600">{report.accuracy}%</p>
            </div>
            <div className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-2xl">
                <p className="text-[10px] font-black text-zinc-400 uppercase mb-1">타수</p>
                <p className="text-2xl font-black text-green-600">{report.kpm}타</p>
            </div>
          </div>

          <button onClick={reset} className="w-full py-4 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 font-black rounded-xl hover:scale-105 transition-all flex items-center justify-center gap-2">
            <RotateCcw size={20} /> 다시 연습하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 max-w-4xl mx-auto px-4">
      <div className="flex gap-6 mb-12">
        <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 px-4 py-2 rounded-xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
            <Target size={16} className="text-blue-600" />
            <span className="text-sm font-black">{correctWords} / {currentWords.length}</span>
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 px-4 py-2 rounded-xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
            <Clock size={16} className="text-purple-600" />
            <span className="text-sm font-black">{currentIndex + 1}번째 단어</span>
        </div>
      </div>

      <div className="w-full bg-white dark:bg-zinc-900 rounded-[3rem] shadow-2xl p-12 mb-12 text-center border-4 border-zinc-100 dark:border-zinc-800 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-zinc-50 dark:bg-zinc-800">
            <div 
                className="h-full bg-blue-500 transition-all duration-300" 
                style={{ width: `${(currentIndex / currentWords.length) * 100}%` }}
            />
        </div>
        <p className="text-zinc-400 text-sm font-bold mb-4 uppercase tracking-widest">Type this word</p>
        <h2 className="text-6xl md:text-7xl font-black text-zinc-900 dark:text-zinc-100 mb-2">
          {currentWords[currentIndex]}
        </h2>
      </div>

      <div className="w-full max-w-md relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="w-full h-20 px-8 text-3xl bg-zinc-100 dark:bg-zinc-800 border-none rounded-3xl outline-hidden focus:ring-4 focus:ring-blue-500/20 text-center font-bold transition-all"
          placeholder="단어를 입력하세요"
        />
        <div className="mt-6 flex justify-center gap-2">
            <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 text-[10px] font-black rounded-lg uppercase">Enter to submit</span>
            <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 text-[10px] font-black rounded-lg uppercase">Space to skip</span>
        </div>
      </div>
    </div>
  );
};
