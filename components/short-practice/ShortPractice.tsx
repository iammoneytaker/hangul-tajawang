"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { TypingUtils, TypingReport } from "@/lib/typing-speed";
import { SHORT_TEXT_DB, SHORT_TEXT_CATEGORIES } from "@/lib/short-text-data";
import { Clock, Target, Zap, Keyboard as KbdIcon, Sparkles } from "lucide-react";

export const ShortPractice: React.FC<{ initialCategory?: string }> = ({ initialCategory }) => {
  const [activeCategory, setActiveCategory] = useState(initialCategory || "전체");
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

  useEffect(() => {
    if (startTime && !isFlying) {
      timerRef.current = setInterval(() => {
        const now = Date.now();
        const diff = (now - startTime) / 1000;
        setElapsedSeconds(diff);
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
    if (!startTime && newValue.length > 0) setStartTime(Date.now());
    setInputValue(newValue);
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
      let color = "text-zinc-300";
      let bg = "";
      if (i === inputValue.length) {
        color = "text-primary font-black animate-pulse";
        bg = "bg-primary/10 ring-4 ring-primary/5 rounded-sm";
      } else if (i < inputValue.length) {
        const tChar = typedNorm.charAt(i);
        if (tChar === normChar) {
          color = "text-on-surface font-bold";
        } else {
          color = "text-red-500 line-through opacity-70";
        }
      }
      return <span key={i} className={`${color} ${bg} transition-colors duration-100`}>{char}</span>;
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full max-w-5xl mx-auto p-4 py-20 overflow-hidden">
      <div className="mb-16 flex flex-wrap justify-center gap-8">
        <MetricBadge icon={<Zap size={18}/>} label="현재 타수" value={lastReport?.kpm || 0} unit="타" color="text-primary" />
        <MetricBadge icon={<Target size={18}/>} label="정확도" value={lastReport?.accuracy || 0} unit="%" color="text-green-600" />
        <MetricBadge icon={<Clock size={18}/>} label="진행 상황" value={`${currentIndex + 1}/${shuffledSentences.length}`} unit="" color="text-secondary" />
      </div>

      <div className={`relative w-full max-w-4xl transition-all duration-700 ease-in-out ${isFlying ? 'translate-x-[120%] -translate-y-32 rotate-12 opacity-0' : 'translate-x-0 opacity-100'}`}>
        <div className="w-full bg-surface-lowest shadow-[0_40px_80px_rgba(21,28,39,0.08)] p-12 md:p-20 flex flex-col justify-center items-center text-center rounded-[3rem] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />
          <div className="absolute top-10 left-1/2 -translate-x-1/2 flex items-center gap-3 text-[10px] font-black text-zinc-300 uppercase tracking-[0.4em]">
              <Sparkles size={14} /> Short Sentence <Sparkles size={14} />
          </div>
          <div className="text-3xl md:text-5xl leading-relaxed font-plus-jakarta font-black select-none mb-4 tracking-tight">{renderHighlightedText()}</div>
          <div className="h-1.5 w-32 bg-surface-high rounded-full mt-12"></div>
        </div>
      </div>

      <div className="w-full max-w-3xl mt-20 relative group">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          autoFocus
          className={`w-full h-28 px-12 text-4xl bg-surface-lowest rounded-[2.5rem] shadow-[0_20px_40px_rgba(21,28,39,0.04)] outline-hidden transition-all text-center font-plus-jakarta font-bold ${isFlying ? 'text-green-500 scale-95 opacity-50' : 'text-on-surface focus:shadow-xl focus:shadow-primary/5'}`}
          placeholder="문장을 입력해 주세요"
        />
        <div className="absolute -bottom-16 left-0 w-full flex flex-col items-center gap-4">
            <div className="h-2.5 bg-surface-high w-full max-w-lg rounded-full overflow-hidden shadow-inner">
                <div 
                    className="h-full bg-primary transition-all duration-300 shadow-[0_0_20px_rgba(0,74,198,0.4)]" 
                    style={{ width: `${shuffledSentences.length > 0 ? Math.min(100, (inputValue.length / targetSentence.length) * 100) : 0}%` }}
                ></div>
            </div>
            <div className="text-zinc-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                <KbdIcon size={14} /> 끝까지 입력하면 자동으로 다음 문장으로 넘어갑니다.
            </div>
        </div>
      </div>
    </div>
  );
};

function MetricBadge({ icon, label, value, unit, color }: { icon: any, label: string, value: string | number, unit: string, color: string }) {
  return (
    <div className="bg-surface-lowest px-8 py-4 rounded-[2rem] shadow-sm flex flex-col items-center min-w-[150px] transition-all hover:-translate-y-1 hover:shadow-md">
      <div className="flex items-center gap-2 mb-2">
        <div className={color}>{icon}</div>
        <span className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className={`text-3xl font-plus-jakarta font-black ${color}`}>{value}</span>
        <span className="text-[10px] text-zinc-400 font-bold uppercase">{unit}</span>
      </div>
    </div>
  );
}
