"use client";

import React, { useState, useEffect, useRef } from "react";
import { TypingUtils, TypingReport } from "@/lib/typing-speed";
import { Trophy, RotateCcw, Target, Zap, Clock, ChevronRight, Layout, Keyboard, Star, Sparkles, Flame } from "lucide-react";
import { WORD_PRACTICE_STEPS, WordStep } from "@/lib/word-data";

export const WordPractice: React.FC = () => {
  const [selectedStep, setSelectedStep] = useState<WordStep | null>(null);
  const [currentWords, setCurrentWords] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [correctWords, setCorrectWords] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [report, setReport] = useState<TypingReport | null>(null);
  const [totalStrokes, setTotalStrokes] = useState(0);
  const [combo, setCombo] = useState(0);
  const [isError, setIsError] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);

  // 단계 선택 시 단어 셔플
  const startStep = (step: WordStep) => {
    const shuffled = [...step.words].sort(() => Math.random() - 0.5);
    setSelectedStep(step);
    setCurrentWords(shuffled);
    setCurrentIndex(0);
    setInputValue("");
    setCorrectWords(0);
    setStartTime(null);
    setReport(null);
    setTotalStrokes(0);
    setCombo(0);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    if (!startTime && value.length > 0) {
      setStartTime(Date.now());
    }

    // 실시간 오타 체크 (시각적 피드백용)
    const target = currentWords[currentIndex];
    if (value.length > 0 && !target.startsWith(value)) {
        setIsError(true);
    } else {
        setIsError(false);
    }

    if (value.endsWith(" ")) {
      checkWord(value.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      checkWord(inputValue.trim());
    }
    if (!["Shift", "Control", "Alt", "Meta", "CapsLock", "Escape"].includes(e.key)) {
        setTotalStrokes(prev => prev + 1);
    }
  };

  const checkWord = (word: string) => {
    if (!word) return;

    const target = currentWords[currentIndex];
    if (word === target) {
      setCorrectWords(prev => prev + 1);
      setCombo(prev => prev + 1);
      setIsError(false);
    } else {
      setCombo(0);
      setIsError(true);
      // 오타 시 살짝 흔들리는 효과 후 초기화
      setTimeout(() => setIsError(false), 500);
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
    const fullOriginal = currentWords.join(" ");
    const finalReport = TypingUtils.generateReport(fullOriginal, fullOriginal, totalStrokes, timeTaken);
    setReport(finalReport);
  };

  const reset = () => {
    setSelectedStep(null);
    setReport(null);
  };

  // 단계 선택 화면
  if (!selectedStep) {
    return (
      <div className="w-full max-w-5xl mx-auto py-12 px-4 animate-in fade-in duration-700">
        <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4 flex items-center justify-center gap-3">
                <Star className="text-yellow-400 fill-yellow-400" /> 낱말 연습 단계 선택
            </h2>
            <p className="text-zinc-500 font-medium text-lg">기초 자리부터 일상 단어까지, 단계별로 실력을 키워보세요.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {WORD_PRACTICE_STEPS.map((step, idx) => (
                <button 
                    key={step.id}
                    onClick={() => startStep(step)}
                    className="group bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 text-left hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-200/20 transition-all hover:-translate-y-2 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Keyboard size={80} />
                    </div>
                    <span className="inline-block px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] font-black rounded-lg uppercase mb-4 tracking-widest">Step {idx + 1}</span>
                    <h3 className="text-2xl font-black mb-2 group-hover:text-blue-600 transition-colors">{step.title}</h3>
                    <p className="text-zinc-400 text-sm font-medium mb-6 leading-relaxed">{step.description}</p>
                    <div className="flex items-center gap-2 text-blue-600 font-black text-sm">
                        시작하기 <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                </button>
            ))}
        </div>
      </div>
    );
  }

  // 결과 화면
  if (report) {
    const isPerfect = report.accuracy === 100;
    return (
      <div className="flex flex-col items-center justify-center py-12 animate-in zoom-in duration-500 px-4">
        <div className="bg-white dark:bg-zinc-900 p-12 rounded-[3rem] shadow-2xl border border-zinc-100 dark:border-zinc-800 text-center max-w-lg w-full relative overflow-hidden">
          {isPerfect && <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-yellow-400 to-orange-500" />}
          
          <div className="relative z-10">
              <div className="inline-flex p-5 bg-yellow-50 dark:bg-yellow-900/20 rounded-full mb-8">
                <Trophy className="w-16 h-16 text-yellow-500" />
              </div>
              <h2 className="text-4xl font-black mb-2">{isPerfect ? "완벽합니다!" : "연습 완료!"}</h2>
              <p className="text-zinc-500 font-bold mb-10">{selectedStep.title} 단계를 마쳤습니다.</p>
              
              <div className="grid grid-cols-2 gap-4 mb-10">
                <ResultCard label="정확도" value={report.accuracy} unit="%" color="text-blue-600" />
                <ResultCard label="최종 타수" value={report.kpm} unit="타" color="text-green-600" />
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                  <button onClick={() => startStep(selectedStep)} className="flex-1 py-5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-200 dark:shadow-none transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2">
                    <RotateCcw size={20} /> 한 번 더 하기
                  </button>
                  <button onClick={reset} className="flex-1 py-5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-black rounded-2xl transition-all hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center justify-center gap-2">
                    단계 선택으로
                  </button>
              </div>
          </div>
        </div>
      </div>
    );
  }

  // 연습 진행 화면
  return (
    <div className="flex flex-col items-center justify-center py-12 max-w-4xl mx-auto px-4 w-full">
      <div className="w-full flex justify-between items-center mb-12 bg-white dark:bg-zinc-900 p-4 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 shadow-sm">
        <div className="flex gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
                <Target size={16} className="text-blue-600" />
                <span className="text-sm font-black">{currentIndex + 1} / {currentWords.length}</span>
            </div>
            {combo > 1 && (
                <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 dark:bg-orange-900/20 rounded-xl animate-bounce">
                    <Flame size={16} className="text-orange-500" />
                    <span className="text-sm font-black text-orange-600">{combo} COMBO</span>
                </div>
            )}
        </div>
        <button onClick={reset} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors text-zinc-400">
            <RotateCcw size={20} />
        </button>
      </div>

      <div className={`w-full bg-white dark:bg-zinc-900 rounded-[3.5rem] shadow-2xl p-16 mb-16 text-center border-4 transition-all duration-300 relative overflow-hidden ${isError ? 'border-red-500 animate-shake' : 'border-zinc-100 dark:border-zinc-800'}`}>
        <div className="absolute top-0 left-0 w-full h-2 bg-zinc-50 dark:bg-zinc-800">
            <div 
                className="h-full bg-blue-500 transition-all duration-500 shadow-[0_0_15px_rgba(59,130,246,0.4)]" 
                style={{ width: `${(currentIndex / currentWords.length) * 100}%` }}
            />
        </div>
        
        <div className="flex flex-col items-center">
            <div className="inline-flex px-4 py-1.5 bg-zinc-50 dark:bg-zinc-800 text-zinc-400 text-[10px] font-black rounded-full uppercase tracking-widest mb-6">
                {selectedStep.title}
            </div>
            <h2 className="text-7xl md:text-8xl font-black text-zinc-900 dark:text-zinc-100 mb-2 tracking-tight select-none">
                {currentWords[currentIndex]}
            </h2>
            <div className="mt-8 flex gap-1 h-2">
                {currentWords[currentIndex].split('').map((_, i) => (
                    <div key={i} className={`w-12 h-1.5 rounded-full transition-all duration-300 ${i < inputValue.length ? 'bg-blue-500' : 'bg-zinc-100 dark:bg-zinc-800'}`} />
                ))}
            </div>
        </div>
      </div>

      <div className="w-full max-w-md relative group">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className={`w-full h-24 px-10 text-4xl bg-white dark:bg-zinc-900 border-4 rounded-[2.5rem] shadow-2xl outline-hidden text-center font-bold transition-all ${isError ? 'border-red-100 dark:border-red-900/30' : 'border-zinc-100 dark:border-zinc-800 focus:border-blue-500 focus:shadow-blue-200/40'}`}
          placeholder="입력하세요"
          autoComplete="off"
        />
        <div className="absolute -bottom-12 left-0 w-full flex justify-center gap-4">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-[10px] font-black text-zinc-400 uppercase tracking-tighter">
                <Sparkles size={10} /> {report?.kpm || 0} KPM
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-[10px] font-black text-zinc-400 uppercase tracking-tighter">
                <Layout size={10} /> SPACE TO SKIP
            </div>
        </div>
      </div>
    </div>
  );
};

function ResultCard({ label, value, unit, color }: { label: string, value: number, unit: string, color: string }) {
    return (
        <div className="bg-zinc-50 dark:bg-zinc-800 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800 transition-transform hover:scale-105">
            <p className="text-[10px] font-black text-zinc-400 uppercase mb-2 tracking-widest">{label}</p>
            <p className={`text-3xl font-black ${color}`}>{value}<span className="text-sm ml-1 opacity-50">{unit}</span></p>
        </div>
    );
}
