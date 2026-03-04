"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { TypingUtils, TypingReport } from "@/lib/typing-speed";
import { RotateCcw, Star, Target, CheckCircle2, Flame, Trophy, ArrowRight, Keyboard as KbdIcon, Sparkles } from "lucide-react";
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

export const PositionPractice: React.FC<{ initialPhase?: "keys" | "words" }> = ({ initialPhase }) => {
  const [selectedStep, setSelectedStep] = useState<PracticeStep | null>(null);
  const [shuffledKeys, setShuffledKeys] = useState<string[]>([]);
  const [shuffledWords, setShuffledWords] = useState<string[]>([]);
  const [phase, setPhase] = useState<Phase>("select");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputValue, setInputValue] = useState(""); // 낱말 연습용 입력값
  
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [wrongKey, setWrongKey] = useState<string | null>(null);
  const [combo, setCombo] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [report, setReport] = useState<TypingReport | null>(null);

  const hiddenInputRef = useRef<HTMLInputElement>(null);

  const startStep = useCallback((step: PracticeStep, targetPhase: Phase = "keys") => {
    setSelectedStep(step);
    
    // 자판 연습 세트 (최소 30개)
    let keysForPractice: string[] = [];
    while (keysForPractice.length < 30) {
        keysForPractice.push(...[...step.keys].sort(() => Math.random() - 0.5));
    }
    setShuffledKeys(keysForPractice.slice(0, 30));
    
    // 낱말 연습 세트 (무작위 셔플)
    setShuffledWords([...step.words].sort(() => Math.random() - 0.5));
    
    setPhase(targetPhase);
    setCurrentIndex(0);
    setInputValue("");
    setCorrectCount(0);
    setCombo(0);
    setStartTime(null);
    setReport(null);

    // 낱말 단계일 경우 입력기 포커스
    if (targetPhase === "words") {
        setTimeout(() => hiddenInputRef.current?.focus(), 100);
    }
  }, []);

  useEffect(() => {
    if (initialPhase && phase === "select") {
      startStep(BASIC_PRACTICE_STEPS[0], initialPhase);
    }
  }, [initialPhase, phase, startStep]);

  // 키보드 이벤트 리스너 (자판 연습용 + 가상 키보드 하이라이트용)
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

      // 1단계: 자판 연습일 때만 여기서 로직 처리
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

  // 2단계: 낱말 연습 입력 핸들러
  const handleWordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (phase !== "words") return;
    const val = e.target.value;
    const target = shuffledWords[currentIndex];
    
    setInputValue(val);

    // 오타 감지 (빨간색 피드백)
    if (val.length > 0 && !target.startsWith(val)) {
        setWrongKey("wrong"); // 특정 키는 아니지만 에러 상태 표시
    } else {
        setWrongKey(null);
    }

    // 단어 완성 체크 (엔터나 스페이스 없이도 글자가 정확히 맞으면 통과 가능하게 처리하거나, 스페이스/엔터 대기)
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
      <div className="w-full max-w-5xl mx-auto py-12 px-4 animate-in fade-in duration-700">
        <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-full text-xs font-black mb-4">
                <KbdIcon size={14} /> NO INPUT BOX, JUST TYPE!
            </div>
            <h2 className="text-4xl font-black mb-4">기초 연습 구간 선택</h2>
            <p className="text-zinc-500 font-medium text-lg">자판 위치부터 실제 낱말까지 단계별로 연습하세요.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {BASIC_PRACTICE_STEPS.map((step, idx) => (
                <button key={step.id} onClick={() => startStep(step)} className="group bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 text-left hover:border-blue-500 hover:shadow-2xl transition-all hover:-translate-y-2">
                    <span className="inline-block px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 text-[10px] font-black rounded-lg uppercase mb-4 tracking-widest">Step {idx + 1}</span>
                    <h3 className="text-2xl font-black mb-2 group-hover:text-blue-600">{step.title}</h3>
                    <p className="text-zinc-400 text-sm font-medium mb-6">{step.description}</p>
                    <div className="flex items-center gap-2 text-blue-600 font-black text-sm">연습 시작 <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" /></div>
                </button>
            ))}
        </div>
      </div>
    );
  }

  const targetDisplay = phase === "keys" ? shuffledKeys[currentIndex] : shuffledWords[currentIndex];
  // 낱말 연습 중 다음으로 쳐야 할 자소(낱말의 다음 글자) 계산 (시각적 키보드 가이드용)
  const currentTargetChar = phase === "keys" ? shuffledKeys[currentIndex] : targetDisplay?.[inputValue.length] || targetDisplay?.[0];

  return (
    <div className="flex flex-col items-center justify-center py-12 max-w-5xl mx-auto px-4 w-full" onClick={() => hiddenInputRef.current?.focus()}>
      {/* 낱말 연습용 숨겨진 입력기 */}
      <input 
        ref={hiddenInputRef}
        type="text"
        value={inputValue}
        onChange={handleWordChange}
        className="fixed opacity-0 pointer-events-none"
        autoFocus
        autoComplete="off"
      />

      <div className="w-full flex justify-between items-center mb-12 bg-white dark:bg-zinc-900 p-5 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm">
        <div className="flex flex-col">
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">{phase === "keys" ? "1단계: 자판 익히기" : "2단계: 낱말 연습"}</span>
            <h2 className="text-xl font-black">{selectedStep!.title}</h2>
        </div>
        <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600">
                <Target size={16} />
                <span className="text-sm font-black">{currentIndex + 1} / {phase === "keys" ? shuffledKeys.length : shuffledWords.length}</span>
            </div>
            {combo > 2 && <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 dark:bg-orange-900/20 rounded-xl animate-bounce text-orange-600 font-black text-sm"><Flame size={16} /> {combo} COMBO</div>}
            <button onClick={() => setPhase("select")} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors text-zinc-400"><RotateCcw size={20} /></button>
        </div>
      </div>

      {phase === "transition" ? (
        <div className="flex flex-col items-center justify-center py-20 animate-in zoom-in duration-500">
            <div className="bg-white dark:bg-zinc-900 p-12 rounded-[3rem] shadow-2xl border border-zinc-100 dark:border-zinc-800 text-center max-w-md w-full">
                <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-6" />
                <h2 className="text-3xl font-black mb-2">자판 마스터!</h2>
                <p className="text-zinc-500 mb-10 font-medium">자판 위치를 익혔습니다. <br/>이제 이 글자들로 이루어진 낱말을 쳐보세요!</p>
                <button onClick={() => { setPhase("words"); resetProgress(); setInputValue(""); setTimeout(() => hiddenInputRef.current?.focus(), 100); }} className="w-full py-5 bg-blue-600 text-white font-black rounded-2xl hover:scale-105 transition-all flex items-center justify-center gap-3 shadow-xl">2단계: 낱말 연습 시작 <ArrowRight size={20} /></button>
            </div>
        </div>
      ) : phase === "result" ? (
        <div className="flex flex-col items-center justify-center animate-in zoom-in duration-500 w-full max-w-lg text-center">
            <div className="bg-white dark:bg-zinc-900 p-12 rounded-[3.5rem] shadow-2xl border border-zinc-100 dark:border-zinc-800 w-full">
                <div className="inline-flex p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-full mb-8"><Trophy className="w-20 h-20 text-yellow-500" /></div>
                <h2 className="text-4xl font-black mb-2">과정 완료!</h2>
                <p className="text-zinc-500 font-bold mb-10">{selectedStep!.title} 연습을 모두 마쳤습니다.</p>
                <div className="grid grid-cols-2 gap-4 mb-10">
                    <div className="bg-zinc-50 dark:bg-zinc-800 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800"><p className="text-[10px] font-black text-zinc-400 uppercase mb-2 tracking-widest">정확도</p><p className="text-3xl font-black text-blue-600">{report?.accuracy}%</p></div>
                    <div className="bg-zinc-50 dark:bg-zinc-800 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800"><p className="text-[10px] font-black text-zinc-400 uppercase mb-2 tracking-widest">평균 타수</p><p className="text-3xl font-black text-green-600">{report?.kpm}타</p></div>
                </div>
                <button onClick={() => setPhase("select")} className="w-full py-5 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 font-black rounded-2xl hover:scale-105 transition-all shadow-xl">단계 선택으로 돌아가기</button>
            </div>
        </div>
      ) : (
        <>
          <div className={`w-full max-w-3xl bg-white dark:bg-zinc-900 rounded-[4rem] shadow-2xl p-16 mb-12 text-center border-4 transition-all duration-300 relative ${wrongKey ? 'border-red-500 animate-shake bg-red-50/30' : 'border-zinc-100 dark:border-zinc-800'}`}>
              <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-2 text-[10px] font-black text-zinc-300 uppercase tracking-[0.3em]">
                  <Sparkles size={12} /> {phase === "keys" ? "Target Key" : "Target Word"} <Sparkles size={12} />
              </div>
              
              <div className="flex flex-col items-center">
                  <h2 className={`font-black leading-none transition-all ${wrongKey ? 'text-red-500 scale-95' : 'text-zinc-900 dark:text-zinc-100 scale-100'} ${phase === "keys" ? 'text-[10rem]' : 'text-7xl md:text-8xl'}`}>
                      {targetDisplay}
                  </h2>
                  
                  {phase === "words" && (
                    <div className="mt-12 flex flex-col items-center w-full max-w-md">
                        {/* 낱말 입력 상태 시각화 */}
                        <div className="text-3xl font-bold text-blue-600 mb-4 h-10">
                            {inputValue}
                            <span className="animate-pulse ml-1 border-r-4 border-blue-500"></span>
                        </div>
                        <div className="flex justify-center gap-1.5 w-full">
                            {targetDisplay.split('').map((_, i) => (
                                <div key={i} className={`flex-1 h-2 rounded-full transition-all duration-300 ${i < inputValue.length ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-zinc-100 dark:bg-zinc-800'}`} />
                            ))}
                        </div>
                    </div>
                  )}
              </div>
          </div>

          <div className="w-full max-w-4xl p-10 bg-zinc-100/50 dark:bg-zinc-900/50 rounded-[3rem] border border-zinc-200 dark:border-zinc-800 backdrop-blur-sm">
              <div className="flex flex-col gap-3">
                  {KBD_ROWS.map((row, rIdx) => (
                      <div key={rIdx} className="flex justify-center gap-2" style={{ marginLeft: rIdx === 1 ? '30px' : rIdx === 2 ? '60px' : '0' }}>
                          {row.keys.map((key) => {
                              const isTarget = currentTargetChar === key;
                              const isActive = activeKey === key;
                              const isWrong = wrongKey === key && activeKey === key;
                              
                              let keyStyle = "bg-white dark:bg-zinc-800 text-zinc-400 border-zinc-200 dark:border-zinc-700";
                              if (isTarget) keyStyle = "bg-blue-50 dark:bg-blue-900/20 text-blue-600 border-blue-400 border-2 shadow-lg shadow-blue-500/20 ring-4 ring-blue-500/10 scale-110 z-10 animate-pulse";
                              if (isActive && isTarget) keyStyle = "bg-green-500 text-white border-green-400 scale-105 z-20 shadow-green-500/40";
                              if (isWrong) keyStyle = "bg-red-500 text-white border-red-400 scale-110 z-30 shadow-red-500/50 animate-shake";
                              if (isActive && !isTarget) keyStyle = "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white scale-95 opacity-100";

                              return (
                                  <div key={key} className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-lg sm:text-2xl font-black transition-all duration-150 border-b-4 shadow-sm ${keyStyle}`}>{key}</div>
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
