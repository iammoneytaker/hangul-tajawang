"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { TypingUtils, TypingReport } from "@/lib/typing-speed";
import { SHORT_TEXT_DB, SHORT_TEXT_CATEGORIES } from "@/lib/short-text-data";
import { Filter, Send, Keyboard, Clock, Target, Zap } from "lucide-react";

export const ShortPractice: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState("전체");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isFlying, setIsFlying] = useState(false);
  const [lastReport, setReport] = useState<TypingReport | null>(null);
  
  const [shuffledSentences, setShuffledSentences] = useState<string[]>([]);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let baseData: string[] = [];
    if (activeCategory === "전체") {
      baseData = SHORT_TEXT_DB.flatMap(item => item.sentences);
    } else {
      const found = SHORT_TEXT_DB.find(item => item.category === activeCategory);
      baseData = found ? [...found.sentences] : [...SHORT_TEXT_DB[0].sentences];
    }
    
    const shuffled = baseData.sort(() => Math.random() - 0.5);
    setShuffledSentences(shuffled);
    resetState();
    inputRef.current?.focus();
  }, [activeCategory]);

  const targetSentence = shuffledSentences[currentIndex] || "";
  const targetNorm = useMemo(() => TypingUtils.normalize(targetSentence), [targetSentence]);

  // 실시간 타이머 및 타수 계산 (0.1초 단위)
  useEffect(() => {
    if (startTime && !isFlying) {
      timerRef.current = setInterval(() => {
        const now = Date.now();
        const diff = (now - startTime) / 1000;
        setElapsedSeconds(diff);
        
        // 시간 흐름에 따른 타수 실시간 업데이트
        if (diff > 0.2) {
            const currentStrokes = TypingUtils.getStrokeCount(inputValue);
            const liveKPM = Math.round((currentStrokes / diff) * 60);
            const currentAccuracy = TypingUtils.calculateAccuracy(
                TypingUtils.normalize(inputValue).split('').filter((char, i) => char === targetNorm[i]).length,
                inputValue.length
            );
            
            setReport(prev => ({
                ...(prev || {}),
                kpm: liveKPM,
                accuracy: currentAccuracy,
                elapsedSeconds: Math.round(diff)
            } as any));
        }
      }, 100);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [startTime, isFlying, inputValue, targetNorm]);

  const resetState = () => {
    setInputValue("");
    setStartTime(null);
    setElapsedSeconds(0);
    setIsFlying(false);
    setCurrentIndex(0);
    setReport(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (isFlying || !targetSentence) return;

    if (!startTime && newValue.length > 0) {
      setStartTime(Date.now());
    }

    setInputValue(newValue);

    // 즉시 지표 계산
    const nowElapsed = startTime ? (Date.now() - startTime) / 1000 : 0.1;
    const currentReport = TypingUtils.generateReport(targetSentence, newValue, 0, nowElapsed);
    setReport(currentReport);

    const typedNorm = TypingUtils.normalize(newValue);
    if (typedNorm.length >= targetNorm.length && 
        typedNorm.charAt(typedNorm.length - 1) === targetNorm.charAt(targetNorm.length - 1)) {
      handleComplete(newValue, nowElapsed);
    }
  };

  const handleComplete = (finalValue: string, finalElapsed: number) => {
    setIsFlying(true);
    const finalReport = TypingUtils.generateReport(targetSentence, finalValue, 0, finalElapsed);
    setReport(finalReport);

    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % shuffledSentences.length);
      setInputValue("");
      setStartTime(null);
      setElapsedSeconds(0);
      setIsFlying(false);
    }, 600);
  };

  const renderHighlightedText = () => {
    if (!targetSentence) return null;
    const chars = targetSentence.split("");
    const typedNorm = TypingUtils.normalize(inputValue);

    return chars.map((char, i) => {
      const normChar = TypingUtils.normalize(char);
      let color = "text-zinc-300 dark:text-zinc-700";
      let deco = "";
      let bg = "";

      if (i === inputValue.length) {
        color = "text-blue-600 dark:text-blue-400 font-black animate-pulse";
        bg = "bg-blue-500/10 ring-2 ring-blue-500/20 rounded-sm";
      } else if (i < inputValue.length) {
        const tChar = typedNorm.charAt(i);
        if (tChar === normChar) {
          color = "text-zinc-900 dark:text-zinc-100 font-bold";
        } else {
          color = "text-red-500";
          deco = "line-through opacity-70";
        }
      }

      return <span key={i} className={`${color} ${bg} ${deco} transition-colors duration-100`}>{char}</span>;
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] w-full max-w-4xl mx-auto p-4 overflow-hidden">
      <div className="flex flex-wrap justify-center gap-2 mb-12 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md p-2 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        {SHORT_TEXT_CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-5 py-2 rounded-xl text-xs font-black transition-all ${activeCategory === cat ? 'bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 shadow-lg' : 'text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}>{cat}</button>
        ))}
      </div>

      <div className="mb-12 flex flex-wrap justify-center gap-6">
        <MetricBadge icon={<Zap size={14}/>} label="현재 타수" value={lastReport?.kpm || 0} unit="타" color="text-blue-600" />
        <MetricBadge icon={<Target size={14}/>} label="정확도" value={lastReport?.accuracy || 0} unit="%" color="text-green-600" />
        <MetricBadge icon={<Clock size={14}/>} label="진행" value={`${currentIndex + 1}/${shuffledSentences.length}`} unit="" color="text-purple-600" />
      </div>

      <div className={`relative w-full max-w-2xl transition-all duration-500 transform ${isFlying ? 'translate-x-[120%] -translate-y-32 rotate-12 opacity-0' : 'translate-x-0 opacity-100'}`}>
        <div className="w-full bg-[#fffceb] dark:bg-zinc-900 shadow-2xl p-10 md:p-16 flex flex-col justify-center items-center text-center rounded-sm border-l-[12px] border-[#fdf3b8] dark:border-blue-900/50 rotate-[-0.5deg] relative">
          <div className="absolute top-6 left-1/2 -translate-x-1/2 w-32 h-10 bg-black/5 rounded-full blur-xl"></div>
          <div className="text-3xl md:text-4xl leading-relaxed font-serif select-none mb-4">{renderHighlightedText()}</div>
          <div className="h-1 w-24 bg-yellow-200/50 dark:bg-blue-900/20 rounded-full mt-8"></div>
        </div>
      </div>

      <div className="w-full max-w-2xl mt-16 relative group">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          autoFocus
          className={`w-full h-24 px-10 text-3xl bg-white dark:bg-zinc-900 border-4 rounded-[2rem] shadow-2xl outline-hidden transition-all text-center font-bold ${isFlying ? 'border-green-400 bg-green-50' : 'border-zinc-100 dark:border-zinc-800 focus:border-blue-500'}`}
          placeholder="위 문장을 똑같이 입력하세요"
        />
        <div className="absolute -bottom-12 left-0 w-full flex justify-center">
            <div className="h-2 bg-zinc-100 dark:bg-zinc-800 w-full max-w-md rounded-full overflow-hidden">
                <div 
                    className="h-full bg-blue-500 transition-all duration-200 shadow-[0_0_15px_rgba(59,130,246,0.6)]" 
                    style={{ width: `${shuffledSentences.length > 0 ? Math.min(100, (inputValue.length / targetSentence.length) * 100) : 0}%` }}
                ></div>
            </div>
        </div>
        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-200 dark:text-zinc-700"><Keyboard size={32} /></div>
      </div>
      
      <div className="mt-24 text-zinc-400 text-sm font-bold flex items-center gap-3 animate-pulse"><Keyboard size={18} /><span>문장을 끝까지 입력하면 다음 카드로 넘어갑니다.</span></div>
    </div>
  );
};

function MetricBadge({ icon, label, value, unit, color }: { icon: any, label: string, value: string | number, unit: string, color: string }) {
  return (
    <div className="bg-white dark:bg-zinc-900 px-6 py-3 rounded-[1.25rem] shadow-sm border border-zinc-100 dark:border-zinc-800 flex flex-col items-center min-w-[130px] transition-transform hover:scale-105">
      <div className="flex items-center gap-1.5 mb-1.5">
        <div className={color}>{icon}</div>
        <span className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className={`text-2xl font-black ${color}`}>{value}</span>
        <span className="text-[10px] text-zinc-400 font-bold uppercase">{unit}</span>
      </div>
    </div>
  );
}
