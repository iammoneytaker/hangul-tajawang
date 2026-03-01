"use client";

import React, { useState, useEffect, useRef } from "react";
import { Keyboard as KeyboardIcon, RotateCcw } from "lucide-react";

const POSITIONS = ["ㅁ", "ㄴ", "ㅇ", "ㄹ", "ㅎ", "ㅗ", "ㅓ", "ㅏ", "ㅣ", "ㅎ", "ㅅ", "ㅈ", "ㄷ", "ㄱ", "ㅋ", "ㅌ", "ㅊ", "ㅍ", "ㅠ", "ㅜ", "ㅡ"];

export const PositionPractice: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [correctCount, setCorrectWords] = useState(0);
  const [startTime] = useState(Date.now());
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [currentIndex]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const target = POSITIONS[currentIndex];

    if (value === target) {
      setCorrectWords(prev => prev + 1);
      if (currentIndex < POSITIONS.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setInputValue("");
      } else {
        // 종료 로직 (간소화)
        alert("자리 연습 완료!");
        setCurrentIndex(0);
        setInputValue("");
      }
    } else {
      setInputValue(value);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] py-12">
      <div className="mb-12 text-center">
        <h3 className="text-xl font-bold text-zinc-400 mb-2">기본 자리 연습</h3>
        <p className="text-zinc-500">화면에 보이는 글자를 똑같이 입력하세요.</p>
      </div>

      <div className="flex items-center gap-8 mb-12">
        {/* Previous */}
        <div className="text-4xl font-bold text-zinc-200 opacity-50 select-none">
            {POSITIONS[currentIndex - 1] || ""}
        </div>
        
        {/* Current */}
        <div className="w-32 h-32 bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border-4 border-blue-500 flex items-center justify-center text-6xl font-black text-blue-600 animate-bounce">
          {POSITIONS[currentIndex]}
        </div>

        {/* Next */}
        <div className="text-4xl font-bold text-zinc-200 opacity-50 select-none">
            {POSITIONS[currentIndex + 1] || ""}
        </div>
      </div>

      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        className="w-24 h-24 text-5xl text-center bg-zinc-100 dark:bg-zinc-800 rounded-2xl outline-hidden focus:ring-4 focus:ring-blue-500/20 font-black"
        maxLength={1}
        autoFocus
      />

      <div className="mt-12 flex gap-8">
          <div className="flex flex-col items-center">
              <span className="text-xs font-bold text-zinc-400 uppercase">Progress</span>
              <span className="text-xl font-black">{Math.round((currentIndex / POSITIONS.length) * 100)}%</span>
          </div>
          <div className="w-px h-10 bg-zinc-200 dark:bg-zinc-800" />
          <div className="flex flex-col items-center">
              <span className="text-xs font-bold text-zinc-400 uppercase">Correct</span>
              <span className="text-xl font-black text-green-500">{correctCount}</span>
          </div>
      </div>
    </div>
  );
};
