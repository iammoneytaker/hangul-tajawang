"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { LONG_TEXT_DB } from "@/lib/long-text-data";
import { TypingUtils, TypingReport } from "@/lib/typing-speed";
import { Trophy, Clock, Target, Keyboard, RotateCcw, Save, CheckCircle2, X } from "lucide-react";
import { SupabaseService } from "@/lib/supabase";

interface Progress {
  textId: string;
  typedText: string;
  totalKeystrokes: number;
  correctChars: number;
  elapsedSeconds: number;
  lastSaved: number;
}

export const LongPractice: React.FC = () => {
  const [selectedTextId, setSelectedTextId] = useState(LONG_TEXT_DB[0].id);
  const [inputValue, setInputValue] = useState("");
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [report, setReport] = useState<TypingReport | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentText = useMemo(() => 
    LONG_TEXT_DB.find(t => t.id === selectedTextId) || LONG_TEXT_DB[0],
    [selectedTextId]
  );

  const originalNorm = useMemo(() => TypingUtils.normalize(currentText.content), [currentText]);

  // Load Persistence
  useEffect(() => {
    const saved = localStorage.getItem(`progress_${selectedTextId}`);
    if (saved) {
      setShowResumeModal(true);
    } else {
      resetState();
    }
  }, [selectedTextId]);

  // Timer
  useEffect(() => {
    if (isActive && !report) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isActive, report]);

  // Auto Scroll
  useEffect(() => {
    if (scrollRef.current && isActive) {
      const charWidth = 25; // Estimate
      const lineIndex = Math.floor(inputValue.length / charWidth);
      const threshold = scrollRef.current.clientHeight * 0.4;
      const targetScroll = lineIndex * 32 - threshold; // 32px per line
      
      scrollRef.current.scrollTo({
        top: Math.max(0, targetScroll),
        behavior: 'smooth'
      });
    }
  }, [inputValue, isActive]);

  const resetState = () => {
    setInputValue("");
    setTotalKeystrokes(0);
    setElapsedSeconds(0);
    setIsActive(false);
    setReport(null);
  };

  const handleResume = () => {
    const saved = localStorage.getItem(`progress_${selectedTextId}`);
    if (saved) {
      const data: Progress = JSON.parse(saved);
      setInputValue(data.typedText);
      setTotalKeystrokes(data.totalKeystrokes);
      setElapsedSeconds(data.elapsedSeconds);
    }
    setShowResumeModal(false);
    textareaRef.current?.focus();
  };

  const handleRestart = () => {
    localStorage.removeItem(`progress_${selectedTextId}`);
    resetState();
    setShowResumeModal(false);
    textareaRef.current?.focus();
  };

  const saveProgress = () => {
    if (report) {
        localStorage.removeItem(`progress_${selectedTextId}`);
        return;
    }
    const progress: Progress = {
      textId: selectedTextId,
      typedText: inputValue,
      totalKeystrokes,
      correctChars: 0, // Calculated on the fly
      elapsedSeconds,
      lastSaved: Date.now()
    };
    localStorage.setItem(`progress_${selectedTextId}`, JSON.stringify(progress));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (report) return;
    
    const newValue = e.target.value;
    const diff = Math.abs(newValue.length - inputValue.length);
    
    setTotalKeystrokes(prev => prev + diff);
    setInputValue(newValue);

    if (!isActive && newValue.length > 0) setIsActive(true);

    // Completion Condition
    const typedNorm = TypingUtils.normalize(newValue);
    if (typedNorm.length >= originalNorm.length && 
        typedNorm[typedNorm.length - 1] === originalNorm[originalNorm.length - 1]) {
      finishTyping(newValue);
    }
  };

  const finishTyping = (finalValue: string) => {
    setIsActive(false);
    const finalReport = TypingUtils.generateReport(
      currentText.content,
      finalValue,
      totalKeystrokes,
      elapsedSeconds
    );
    setReport(finalReport);
    localStorage.removeItem(`progress_${selectedTextId}`);
    
    // DB Update
    SupabaseService.saveResult(currentText.id, finalReport.netSpeed, finalReport.accuracy, elapsedSeconds);
  };

  const renderHighlightedText = () => {
    const chars = currentText.content.split("");
    const typedNorm = TypingUtils.normalize(inputValue);
    
    return chars.map((char, i) => {
      const normChar = TypingUtils.normalize(char);
      let color = "text-gray-300";
      let bg = "";
      let deco = "";

      if (i === inputValue.length) {
        color = "text-blue-600 font-black";
        bg = "bg-blue-50";
      } else if (i < inputValue.length) {
        if (typedNorm[i] === normChar) {
          color = "text-green-600";
        } else {
          color = "text-red-500";
          deco = "line-through opacity-70";
        }
      }

      return (
        <span key={i} className={`${color} ${bg} ${deco} transition-colors duration-150`}>
          {char === "\n" ? <br /> : char}
        </span>
      );
    });
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-8 px-4 flex flex-col gap-6">
      {/* Resume Modal */}
      {showResumeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center border border-zinc-200 dark:border-zinc-800">
            <RotateCcw className="w-16 h-16 mx-auto text-blue-500 mb-6" />
            <h3 className="text-2xl font-black mb-2">기록이 있습니다!</h3>
            <p className="text-zinc-500 mb-8">이전의 진행 상황을 불러와서 <br/>이어서 필사하시겠습니까?</p>
            <div className="flex flex-col gap-3">
              <button onClick={handleResume} className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors">이어서 하기</button>
              <button onClick={handleRestart} className="w-full py-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold rounded-xl hover:bg-zinc-200 transition-colors">새로 시작</button>
            </div>
          </div>
        </div>
      )}

      {/* Completion Modal */}
      {report && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-10 max-w-2xl w-full shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-y-auto max-h-[90vh]">
            <div className="text-center mb-8">
                <Trophy className="w-20 h-20 mx-auto text-yellow-400 mb-4" />
                <h2 className="text-4xl font-black mb-1">필사 완료!</h2>
                <p className="text-zinc-500">{currentText.title} - {currentText.author}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <ResultCard icon={<Target className="text-blue-500"/>} label="정확도" value={`${report.accuracy}%`} />
                <ResultCard icon={<Keyboard className="text-green-500"/>} label="순 타수" value={`${report.netSpeed}타`} />
                <ResultCard icon={<Clock className="text-purple-500"/>} label="소요 시간" value={`${Math.floor(report.elapsedSeconds / 60)}분 ${report.elapsedSeconds % 60}초`} />
                <ResultCard icon={<CheckCircle2 className="text-yellow-500"/>} label="등급" value={report.grade.split(' ')[0]} />
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-800/50 p-6 rounded-2xl mb-8">
                <h4 className="text-sm font-bold text-zinc-400 mb-4 uppercase tracking-widest">오타 분석 (Top 5)</h4>
                <div className="space-y-2">
                    {report.errors.length > 0 ? report.errors.slice(0, 5).map((err, i) => (
                        <div key={i} className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
                            <span className="text-sm text-zinc-400">{err.index + 1}번째</span>
                            <div className="flex items-center gap-3">
                                <span className="text-red-400 line-through font-serif">{err.actual || '(공백)'}</span>
                                <span className="text-zinc-300">→</span>
                                <span className="text-green-500 font-bold font-serif">{err.expected}</span>
                            </div>
                        </div>
                    )) : <p className="text-center text-zinc-400 py-4">오타가 없습니다! 완벽해요! ✨</p>}
                </div>
            </div>

            <div className="flex gap-4">
                <button onClick={resetState} className="flex-1 py-4 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 font-bold rounded-xl hover:opacity-90 transition-opacity">연습 종료</button>
                <button className="flex-1 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors">감성 카드 만들기</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black text-zinc-900 dark:text-white flex items-center gap-2">
          <PenTool className="text-blue-600" /> 감성 필사
        </h2>
        <div className="flex items-center gap-4">
          <button onClick={saveProgress} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-bold hover:bg-zinc-50 transition-all">
            <Save size={16} /> 저장하기
          </button>
          <select 
            value={selectedTextId}
            onChange={(e) => setSelectedTextId(e.target.value)}
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2 font-bold shadow-sm outline-hidden cursor-pointer"
          >
            {LONG_TEXT_DB.map(text => (
              <option key={text.id} value={text.id}>
                [{text.category}] {text.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="w-full h-[75vh] bg-white dark:bg-zinc-900 shadow-2xl rounded-3xl overflow-hidden flex flex-col md:flex-row border border-zinc-200 dark:border-zinc-800">
        {/* Left Page: Interactive Display */}
        <div 
          ref={scrollRef}
          className="flex-1 p-10 bg-zinc-50/50 dark:bg-zinc-800/20 border-r border-zinc-200 dark:border-zinc-800 overflow-y-auto relative scroll-smooth"
        >
          <div className="max-w-none text-left font-serif leading-relaxed text-2xl md:text-3xl tracking-wide whitespace-pre-wrap select-none">
            {renderHighlightedText()}
          </div>
        </div>

        {/* Right Page: Real Typing Area */}
        <div className="flex-1 p-10 bg-white dark:bg-zinc-900 relative flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-black rounded-full uppercase tracking-tighter">Transcription Area</span>
            <div className="flex gap-4 text-sm font-bold text-zinc-400">
                <span className="flex items-center gap-1"><Keyboard size={14}/> {totalKeystrokes}</span>
                <span className="flex items-center gap-1"><Clock size={14}/> {Math.floor(elapsedSeconds/60)}:{String(elapsedSeconds%60).padStart(2,'0')}</span>
            </div>
          </div>
          
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={handleInputChange}
            className="flex-1 w-full bg-transparent resize-none outline-hidden text-2xl md:text-3xl font-serif leading-relaxed z-10 py-0 text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-100"
            placeholder="화면 왼쪽의 글을 보며 이곳에 입력하세요..."
          />
          
          <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
              <div className="flex-1 h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden mr-6">
                <div 
                    className="h-full bg-blue-600 transition-all duration-300" 
                    style={{ width: `${Math.min(100, (inputValue.length / currentText.content.length) * 100)}%` }}
                />
              </div>
              <span className="text-sm font-black text-blue-600">{Math.min(100, Math.round((inputValue.length / currentText.content.length) * 100))}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

function ResultCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="bg-zinc-50 dark:bg-zinc-800/50 p-6 rounded-2xl flex flex-col items-center gap-2 border border-zinc-100 dark:border-zinc-800">
            {icon}
            <span className="text-zinc-400 text-xs font-bold uppercase tracking-wider">{label}</span>
            <span className="text-2xl font-black text-zinc-900 dark:text-zinc-100">{value}</span>
        </div>
    );
}

function PenTool(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 19l7-7 3 3-7 7-3-3z" />
      <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
      <path d="M2 2l7.586 7.586" />
      <circle cx="11" cy="11" r="2" />
    </svg>
  );
}
