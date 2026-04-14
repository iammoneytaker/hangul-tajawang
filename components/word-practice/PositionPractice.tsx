"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { TypingUtils, TypingReport } from "@/lib/typing-speed";
import { RotateCcw, Target, CheckCircle2, Flame, Trophy, ArrowRight, Keyboard as KbdIcon, Sparkles } from "lucide-react";
import { BASIC_PRACTICE_STEPS, PracticeStep } from "@/lib/word-data";

type Phase = "select" | "keys" | "transition" | "words" | "result";

const KBD_ROWS = [
  { keys: ["ㅂ", "ㅈ", "ㄷ", "ㄱ", "ㅅ", "ㅛ", "ㅕ", "ㅑ", "ㅐ", "ㅔ"], eng: ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"] },
  { keys: ["ㅁ", "ㄴ", "ㅇ", "ㄹ", "ㅎ", "ㅗ", "ㅓ", "ㅏ", "ㅣ"], eng: ["a", "s", "d", "f", "g", "h", "j", "k", "l"] },
  { keys: ["ㅋ", "ㅌ", "ㅊ", "ㅍ", "ㅠ", "ㅜ", "ㅡ"], eng: ["z", "x", "c", "v", "b", "n", "m"] }
];

const DOUBLE_CONSONANTS: Record<string, string> = {
  "Q": "ㅃ", "W": "ㅉ", "E": "ㄸ", "R": "ㄲ", "T": "ㅆ", "O": "ㅒ", "P": "ㅖ"
};

export const PositionPractice: React.FC<{ initialPhase?: "keys" | "words", initialTargetId?: string }> = ({ initialPhase, initialTargetId }) => {
  const [selectedStep, setSelectedStep] = useState<PracticeStep | null>(null);
  const [shuffledKeys, setShuffledKeys] = useState<string[]>([]);
  const [shuffledWords, setShuffledWords] = useState<string[]>([]);
  const [phase, setPhase] = useState<Phase>("select");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputValue, setInputValue] = useState(""); 
  
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [wrongKey, setWrongKey] = useState<string | null>(null);
  const [combo, setCombo] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [report, setReport] = useState<TypingReport | null>(null);

  const hiddenInputRef = useRef<HTMLInputElement>(null);

  const startStep = useCallback((step: PracticeStep, targetPhase: Phase = "keys") => {
    setSelectedStep(step);
    let keysForPractice: string[] = [];
    while (keysForPractice.length < 30) {
        keysForPractice.push(...[...step.keys].sort(() => Math.random() - 0.5));
    }
    setShuffledKeys(keysForPractice.slice(0, 30));
    setShuffledWords([...step.words].sort(() => Math.random() - 0.5));
    setPhase(targetPhase);
    setCurrentIndex(0);
    setInputValue("");
    setCorrectCount(0);
    setCombo(0);
    setStartTime(null);
    setReport(null);
    if (targetPhase === "words") {
        setTimeout(() => hiddenInputRef.current?.focus(), 100);
    }
  }, []);

  const resetProgress = useCallback(() => {
    setCurrentIndex(0);
    setInputValue("");
    setCorrectCount(0);
    setCombo(0);
    setStartTime(null);
  }, []);

  useEffect(() => {
    if (initialPhase && phase === "select") {
      const targetStep = initialTargetId ? BASIC_PRACTICE_STEPS.find(s => s.id === initialTargetId) || BASIC_PRACTICE_STEPS[0] : BASIC_PRACTICE_STEPS[0];
      startStep(targetStep, initialPhase);
    }
  }, [initialPhase, initialTargetId, phase, startStep]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "Escape") { setPhase("select"); return; }
      let pressed = e.key;
      const allKeys = KBD_ROWS.flatMap(r => r.keys);
      const allEng = KBD_ROWS.flatMap(r => r.eng);
      const engIdx = allEng.indexOf(pressed.toLowerCase());
      if (engIdx > -1) {
        if (e.shiftKey && DOUBLE_CONSONANTS[pressed.toUpperCase()]) {
            pressed = DOUBLE_CONSONANTS[pressed.toUpperCase()];
        } else {
            pressed = allKeys[engIdx];
        }
      }
      setActiveKey(pressed);
      if (!startTime) setStartTime(Date.now());
      if (phase === "keys") {
        const target = shuffledKeys[currentIndex];
        if (pressed === target) {
          setCorrectCount(prev => prev + 1);
          setCombo(prev => prev + 1);
          setWrongKey(null);
          if (currentIndex < shuffledKeys.length - 1) {
            setCurrentIndex(prev => prev + 1);
          } else {
            setPhase("transition");
          }
        } else {
          setWrongKey(pressed);
          setCombo(0);
          setTimeout(() => setWrongKey(null), 500);
        }
      }
    };
    const handleKeyUp = () => setActiveKey(null);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [phase, currentIndex, shuffledKeys, startTime]);

  const handleWordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (phase !== "words") return;
    const val = e.target.value;
    const target = shuffledWords[currentIndex];
    setInputValue(val);
    if (val.length > 0 && !target.startsWith(val)) {
        setWrongKey("wrong");
    } else {
        setWrongKey(null);
    }
    if (val === target) {
        setCorrectCount(prev => prev + 1);
        setCombo(prev => prev + 1);
        setWrongKey(null);
        if (currentIndex < shuffledWords.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setInputValue("");
        } else {
            finishPractice();
        }
    }
  };

  const finishPractice = () => {
    const timeTaken = (Date.now() - (startTime || Date.now())) / 1000;
    const finalReport = TypingUtils.generateReport(shuffledWords.join(" "), shuffledWords.join(" "), 0, timeTaken);
    setReport(finalReport);
    setPhase("result");
  };

  if (phase === "select") {
    return (
      <div className="w-full max-w-5xl mx-auto py-20 px-4 animate-in fade-in duration-1000">
        <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-surface-low text-primary rounded-full text-[10px] font-black mb-6 tracking-widest uppercase">
                <KbdIcon size={14} /> NO INPUT BOX, JUST TYPE!
            </div>
            <h2 className="display-lg mb-6">기초 연습 구간 선택</h2>
            <p className="text-zinc-500 font-medium text-xl">자판 위치부터 실제 낱말까지 단계별로 연습하세요.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {BASIC_PRACTICE_STEPS.map((step, idx) => (
                <button key={step.id} onClick={() => startStep(step)} className="group bg-surface-lowest p-10 rounded-[2.5rem] text-left hover:shadow-[0_20px_40px_rgba(21,28,39,0.06)] transition-all hover:-translate-y-2 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity"><KbdIcon size={80} /></div>
                    <span className="inline-block px-3 py-1 bg-surface-high text-primary text-[10px] font-black rounded-lg uppercase mb-6 tracking-widest">Step {idx + 1}</span>
                    <h3 className="headline-md mb-3 group-hover:text-primary transition-colors">{step.title}</h3>
                    <p className="text-zinc-400 text-sm font-medium mb-8 leading-relaxed">{step.description}</p>
                    <div className="flex items-center gap-2 text-primary font-black text-sm">연습 시작 <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" /></div>
                </button>
            ))}
        </div>
      </div>
    );
  }

  const targetDisplay = phase === "keys" ? shuffledKeys[currentIndex] : shuffledWords[currentIndex];
  const currentTargetChar = phase === "keys" ? shuffledKeys[currentIndex] : targetDisplay?.[inputValue.length] || targetDisplay?.[0];

  return (
    <div className="flex flex-col items-center justify-center py-16 max-w-5xl mx-auto px-4 w-full" onClick={() => hiddenInputRef.current?.focus()}>
      <input 
        ref={hiddenInputRef}
        type="text"
        value={inputValue}
        onChange={handleWordChange}
        className="fixed opacity-0 pointer-events-none"
        autoFocus
        autoComplete="off"
      />

      <div className="w-full flex justify-between items-center mb-16 bg-surface-lowest p-6 rounded-[2.5rem] shadow-[0_20px_40px_rgba(21,28,39,0.04)]">
        <div className="flex flex-col">
            <span className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">{phase === "keys" ? "1단계: 자판 익히기" : "2단계: 낱말 연습"}</span>
            <h2 className="headline-md !text-xl">{selectedStep!.title}</h2>
        </div>
        <div className="flex items-center gap-8">
            <div className="flex items-center gap-3 px-5 py-2.5 bg-surface-low rounded-2xl text-primary shadow-sm">
                <Target size={18} />
                <span className="text-sm font-black">{currentIndex + 1} / {phase === "keys" ? shuffledKeys.length : shuffledWords.length}</span>
            </div>
            {combo > 2 && <div className="flex items-center gap-2 px-5 py-2.5 bg-orange-50 rounded-2xl animate-bounce text-orange-600 font-black text-sm"><Flame size={18} /> {combo} COMBO</div>}
            <button onClick={() => setPhase("select")} className="p-3 hover:bg-surface-low rounded-2xl transition-colors text-zinc-300 hover:text-primary"><RotateCcw size={22} /></button>
        </div>
      </div>

      {phase === "transition" ? (
        <div className="flex flex-col items-center justify-center py-20 animate-in zoom-in duration-500 w-full">
            <div className="glass-card p-16 text-center max-w-lg w-full">
                <CheckCircle2 className="w-24 h-24 text-green-500 mx-auto mb-8" />
                <h2 className="headline-md mb-4">자판 마스터!</h2>
                <p className="text-zinc-500 mb-12 font-medium leading-relaxed">자판 위치를 익혔습니다. <br/>이제 이 글자들로 이루어진 낱말을 쳐보세요!</p>
                <button onClick={() => { setPhase("words"); resetProgress(); setInputValue(""); setTimeout(() => hiddenInputRef.current?.focus(), 100); }} className="w-full py-6 primary-gradient text-white font-black rounded-full hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-xl shadow-primary/20">2단계: 낱말 연습 시작 <ArrowRight size={20} /></button>
            </div>
        </div>
      ) : phase === "result" ? (
        <div className="flex flex-col items-center justify-center animate-in zoom-in duration-500 w-full max-w-xl text-center">
            <div className="glass-card p-16 w-full">
                <div className="inline-flex p-8 bg-yellow-50 rounded-full mb-10"><Trophy className="w-24 h-24 text-yellow-500" /></div>
                <h2 className="display-lg !text-5xl mb-4">과정 완료!</h2>
                <p className="text-zinc-400 font-bold mb-12">{selectedStep!.title} 연습을 모두 마쳤습니다.</p>
                <div className="grid grid-cols-2 gap-6 mb-12">
                    <div className="bg-surface-low p-8 rounded-[2.5rem]"><p className="text-[10px] font-black text-zinc-400 uppercase mb-3 tracking-widest">정확도</p><p className="text-4xl font-black text-primary">{report?.accuracy}%</p></div>
                    <div className="bg-surface-low p-8 rounded-[2.5rem]"><p className="text-[10px] font-black text-zinc-400 uppercase mb-3 tracking-widest">평균 타수</p><p className="text-4xl font-black text-green-600">{report?.kpm}타</p></div>
                </div>
                <button onClick={() => setPhase("select")} className="w-full py-6 bg-on-surface text-white font-black rounded-full hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-on-surface/10">단계 선택으로 돌아가기</button>
            </div>
        </div>
      ) : (
        <>
          <div className={`w-full max-w-4xl bg-surface-lowest rounded-[4rem] shadow-[0_40px_80px_rgba(21,28,39,0.08)] p-20 mb-16 text-center transition-all duration-500 relative overflow-hidden ${wrongKey ? 'animate-shake' : ''}`}>
              {/* Background Accent */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl -ml-32 -mb-32" />

              <div className="absolute top-10 left-1/2 -translate-x-1/2 flex items-center gap-3 text-[10px] font-black text-zinc-300 uppercase tracking-[0.4em]">
                  <Sparkles size={14} /> {phase === "keys" ? "Target Key" : "Target Word"} <Sparkles size={14} />
              </div>
              
              <div className="flex flex-col items-center relative z-10">
                  <h2 className={`font-plus-jakarta font-black leading-none transition-all duration-300 ${wrongKey ? 'text-red-500 scale-95' : 'text-on-surface scale-100'} ${phase === "keys" ? 'text-[12rem]' : 'text-7xl md:text-9xl'}`}>
                      {targetDisplay}
                  </h2>
                  
                  {phase === "words" && (
                    <div className="mt-16 flex flex-col items-center w-full max-w-lg">
                        <div className="text-4xl font-bold text-primary mb-6 h-12 flex items-center justify-center">
                            {inputValue}
                            <span className="w-1.5 h-10 bg-tertiary ml-2 rounded-full animate-pulse shadow-[0_0_15px_rgba(120,75,0,0.3)]"></span>
                        </div>
                        <div className="flex justify-center gap-2 w-full">
                            {targetDisplay.split('').map((_, i) => (
                                <div key={i} className={`flex-1 h-2.5 rounded-full transition-all duration-500 ${i < inputValue.length ? 'bg-primary shadow-[0_0_15px_rgba(0,74,198,0.3)]' : 'bg-surface-high'}`} />
                            ))}
                        </div>
                    </div>
                  )}
              </div>
          </div>

          <div className="w-full max-w-5xl p-12 bg-surface-high/50 rounded-[3.5rem] backdrop-blur-sm">
              <div className="flex flex-col gap-4">
                  {KBD_ROWS.map((row, rIdx) => (
                      <div key={rIdx} className="flex justify-center gap-3" style={{ marginLeft: rIdx === 1 ? '40px' : rIdx === 2 ? '80px' : '0' }}>
                          {row.keys.map((key) => {
                              const isTarget = currentTargetChar === key;
                              const isActive = activeKey === key;
                              const isWrong = wrongKey === key && activeKey === key;
                              
                              let keyStyle = "bg-surface-lowest text-zinc-300 shadow-sm";
                              if (isTarget) keyStyle = "bg-surface-lowest text-primary shadow-[0_0_20px_rgba(0,74,198,0.15)] ring-4 ring-primary/10 scale-110 z-10 animate-pulse !text-primary";
                              if (isActive && isTarget) keyStyle = "primary-gradient text-white scale-105 z-20 shadow-primary/40 shadow-lg";
                              if (isWrong) keyStyle = "bg-red-500 text-white scale-110 z-30 shadow-red-500/50 shadow-lg animate-shake";
                              if (isActive && !isTarget) keyStyle = "bg-on-surface text-white scale-95 opacity-100 shadow-md";

                              return (
                                  <div key={key} className={`w-14 h-14 sm:w-20 sm:h-20 rounded-[1.25rem] flex items-center justify-center text-xl sm:text-3xl font-plus-jakarta font-black transition-all duration-200 ${keyStyle}`}>{key}</div>
                              );
                          })}
                      </div>
                  ))}
              </div>
          </div>
        </>
      )}
    </div>
  );
};
