"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { LONG_TEXT_DB } from "@/lib/long-text-data";
import { TypingUtils, TypingReport } from "@/lib/typing-speed";
import { Trophy, Clock, Target, Keyboard, RotateCcw, Save, CheckCircle2, X, Type, ScrollText, Share2, Info, ArrowRight } from "lucide-react";
import { SupabaseService } from "@/lib/supabase";

interface Progress {
  textId: string;
  typedText: string;
  totalKeystrokes: number;
  correctChars: number;
  elapsedSeconds: number;
  lastSaved: number;
}

type PaperType = 'white' | 'hanji' | 'kraft';
// CSS 유틸리티 클래스 명칭으로 통일
type FontType = 'font-noto' | 'font-myeongjo' | 'font-pen' | 'font-jua' | 'font-batang' | 'font-dodum' | 'font-gamja';

export const LongPractice: React.FC<{ externalContent?: any }> = ({ externalContent }) => {
  const [user, setUser] = useState<any>(null);
  const [selectedTextId, setSelectedTextId] = useState(externalContent?.id || LONG_TEXT_DB[0].id);
  const [inputValue, setInputValue] = useState("");
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [report, setReport] = useState<TypingReport | null>(null);
  const [rankings, setRankings] = useState<any[]>([]);

  // 설정
  const [fontSize, setFontSize] = useState(24);
  const [paperType, setPaperType] = useState<PaperType>('hanji');
  const [fontFamily, setFontFamily] = useState<FontType>('font-myeongjo');

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    SupabaseService.getCurrentUser().then(setUser);
  }, []);

  const currentText = useMemo(() => {
    if (externalContent) return externalContent;
    return LONG_TEXT_DB.find(t => t.id === selectedTextId) || LONG_TEXT_DB[0];
  }, [selectedTextId, externalContent]);

  const originalNorm = useMemo(() => TypingUtils.normalize(currentText.content), [currentText]);

  useEffect(() => {
    const saved = localStorage.getItem(`progress_${selectedTextId}`);
    if (saved) setShowResumeModal(true);
    else resetState();
  }, [selectedTextId]);

  useEffect(() => {
    if (isActive && !report) {
      timerRef.current = setInterval(() => setElapsedSeconds(prev => prev + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isActive, report]);

  useEffect(() => {
    if (scrollRef.current && isActive) {
      const lineIndex = Math.floor(inputValue.length / 25);
      const targetScroll = lineIndex * (fontSize * 1.6) - (scrollRef.current.clientHeight * 0.3);
      scrollRef.current.scrollTo({ top: Math.max(0, targetScroll), behavior: 'smooth' });
    }
  }, [inputValue, isActive, fontSize]);

  const resetState = () => {
    setInputValue("");
    setTotalKeystrokes(0);
    setElapsedSeconds(0);
    setIsActive(false);
    setReport(null);
    setRankings([]);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (report) return;
    const newValue = e.target.value;
    const diff = Math.abs(newValue.length - inputValue.length);
    setTotalKeystrokes(prev => prev + diff);
    setInputValue(newValue);
    if (!isActive && newValue.length > 0) setIsActive(true);

    const typedNorm = TypingUtils.normalize(newValue);
    if (typedNorm.length >= originalNorm.length && 
        typedNorm[typedNorm.length - 1] === originalNorm[originalNorm.length - 1]) {
      finishTyping(newValue);
    }
  };

  const finishTyping = async (finalValue: string) => {
    setIsActive(false);
    const finalReport = TypingUtils.generateReport(currentText.content, finalValue, totalKeystrokes, elapsedSeconds);
    setReport(finalReport);
    localStorage.removeItem(`progress_${selectedTextId}`);
    
    if (user) {
        await SupabaseService.saveResult(currentText.id, finalReport.netSpeed, finalReport.accuracy, elapsedSeconds);
    }
    
    try {
        const topRankings = await SupabaseService.getRankings(currentText.id);
        setRankings(topRankings);
    } catch (e) { console.error(e); }
  };

  const handleShare = async () => {
    if (!report) return;
    const shareText = `✍️ 한글타자왕 필사 완료!\n\n📜 글 제목: ${currentText.title}\n⚡ 타수: ${report.netSpeed}타\n🎯 정확도: ${report.accuracy}%\n⏱️ 시간: ${report.elapsedSeconds}초\n\n한글타자왕에서 긴 글 연습을 즐겨보세요!`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: '한글타자왕 필사 결과',
          text: shareText,
          url: window.location.href
        });
      } catch (e) { console.log('Share failed'); }
    } else {
      await navigator.clipboard.writeText(shareText);
      alert('결과가 클립보드에 복사되었습니다!');
    }
  };

  const renderHighlightedText = () => {
    const chars = currentText.content.split("");
    const typedNorm = TypingUtils.normalize(inputValue);
    return chars.map((char, i) => {
      const normChar = TypingUtils.normalize(char);
      let color = "text-zinc-400";
      let bg = "";
      let deco = "";

      if (i === inputValue.length) {
        color = "text-blue-600 font-black";
        bg = "bg-blue-500/10 ring-2 ring-blue-500/20 rounded-sm";
      } else if (i < inputValue.length) {
        if (typedNorm[i] === normChar) {
            color = "text-zinc-900 dark:text-zinc-50 font-bold";
        } else {
            color = "text-red-500";
            deco = "line-through opacity-80";
        }
      }
      return (
        <span key={i} className={`${color} ${bg} ${deco} transition-all`}>
          {char === "\n" ? <br /> : char}
        </span>
      );
    });
  };

  const progress = Math.min(100, (inputValue.length / currentText.content.length) * 100);

  const paperAssets = {
    white: { img: "/images/paper/basic.jpg", overlay: "opacity-[0.08] mix-blend-multiply dark:opacity-0" },
    hanji: { img: "https://www.transparenttextures.com/patterns/natural-paper.png", overlay: "opacity-[0.15] mix-blend-multiply" },
    kraft: { img: "/images/paper/craft.jpg", overlay: "opacity-[0.12] mix-blend-multiply" }
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-8 px-4 flex flex-col gap-6 relative">
      {/* Dust/Analog Particle Effect */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-20">
          <div className="absolute inset-[-10%] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] animate-pulse" />
      </div>

      {/* Completion Modal */}
      {report && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-10 max-w-2xl w-full shadow-2xl my-auto animate-in zoom-in duration-300">
            <div className="text-center mb-8">
                <Trophy className="w-16 h-16 mx-auto text-yellow-400 mb-4" />
                <h2 className="text-3xl font-black mb-1">연습 완료!</h2>
                <p className="text-zinc-500">{currentText.title}</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <ResultCard icon={<Target className="text-blue-500"/>} label="정확도" value={`${report.accuracy}%`} />
                <ResultCard icon={<Keyboard className="text-green-500"/>} label="순 타수" value={`${report.netSpeed}타`} />
                <ResultCard icon={<Clock className="text-purple-500"/>} label="시간" value={`${report.elapsedSeconds}초`} />
                <ResultCard icon={<CheckCircle2 className="text-yellow-500"/>} label="등급" value={report.grade.split(' ')[0]} />
            </div>
            <div className="flex gap-4">
                <button onClick={resetState} className="flex-1 py-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-bold rounded-xl transition-all">연습 종료</button>
                <button onClick={handleShare} className="flex-1 py-4 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 shadow-lg transition-all flex items-center justify-center gap-2">
                    <Share2 size={20} /> 결과 인증하기
                </button>
            </div>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 z-10">
        <h2 className="text-3xl font-black text-zinc-900 dark:text-white flex items-center gap-2">
          <PenTool className="text-blue-600" /> {externalContent ? "챌린지 필사" : "긴 글 연습"}
        </h2>
        
        <div className="flex flex-wrap items-center gap-3 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md p-2 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2 px-3 border-r border-zinc-100 dark:border-zinc-800">
            <Type size={16} className="text-zinc-400" />
            <select 
                value={fontFamily} 
                onChange={(e) => setFontFamily(e.target.value as FontType)} 
                className="bg-transparent text-xs font-bold outline-hidden cursor-pointer"
            >
                <option value="font-noto" className="font-noto">본고딕 (기본)</option>
                <option value="font-myeongjo" className="font-myeongjo">나눔명조</option>
                <option value="font-batang" className="font-batang">고운바탕</option>
                <option value="font-dodum" className="font-dodum">고운돋움</option>
                <option value="font-pen" className="font-pen">나눔펜 (필기체)</option>
                <option value="font-gamja" className="font-gamja">감자꽃 (손글씨)</option>
                <option value="font-jua" className="font-jua">배민 주아</option>
            </select>
            <input type="range" min="16" max="40" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="w-16 accent-blue-600" />
          </div>
          
          <div className="flex items-center gap-1 px-3 border-r border-zinc-100 dark:border-zinc-800">
            <ScrollText size={16} className="text-zinc-400 mr-1" />
            <PaperBtn active={paperType==='white'} label="기본" onClick={()=>setPaperType('white')} />
            <PaperBtn active={paperType==='hanji'} label="한지" onClick={()=>setPaperType('hanji')} />
            <PaperBtn active={paperType==='kraft'} label="크라프트" onClick={()=>setPaperType('kraft')} />
          </div>

          {!externalContent && (
            <select value={selectedTextId} onChange={(e) => setSelectedTextId(e.target.value)} className="bg-transparent text-sm font-bold outline-hidden cursor-pointer px-2">
                {LONG_TEXT_DB.map(text => <option key={text.id} value={text.id}>{text.title}</option>)}
            </select>
          )}
        </div>
      </div>

      {/* Main UI */}
      <div className={`w-full h-[70vh] bg-white dark:bg-zinc-950 shadow-2xl rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row border-4 border-zinc-200 dark:border-zinc-800 transition-all duration-500 z-10 relative`}>
        <div 
            className={`absolute inset-0 pointer-events-none z-0 ${paperAssets[paperType].overlay}`}
            style={{ backgroundImage: `url(${paperAssets[paperType].img})`, backgroundSize: paperType === 'hanji' ? 'auto' : 'cover' }}
        />

        <div ref={scrollRef} className={`flex-1 p-10 overflow-y-auto relative scroll-smooth border-r border-zinc-200/20 z-10 ${fontFamily}`} style={{ fontSize: `${fontSize}px`, lineHeight: 1.6 }}>
          <div className="max-w-none text-left tracking-wide whitespace-pre-wrap select-none text-zinc-900 dark:text-zinc-100">{renderHighlightedText()}</div>
        </div>

        <div className={`flex-1 p-10 relative flex flex-col bg-zinc-50/30 dark:bg-white/5 z-10 ${fontFamily}`}>
          <div className="flex justify-between items-center mb-6">
            <span className="px-3 py-1 bg-blue-600 text-white text-[10px] font-black rounded-full uppercase">Typing</span>
            <div className="flex gap-4 text-sm font-black text-zinc-500">
                <span className="flex items-center gap-1"><Keyboard size={14}/> {totalKeystrokes}</span>
                <span className="flex items-center gap-1"><Clock size={14}/> {Math.floor(elapsedSeconds/60)}:{String(elapsedSeconds%60).padStart(2,'0')}</span>
            </div>
          </div>
          
          <textarea ref={textareaRef} value={inputValue} onChange={handleInputChange} className="flex-1 w-full bg-transparent resize-none outline-hidden leading-relaxed z-10 py-0 text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400/20" style={{ fontSize: `${fontSize}px`, lineHeight: 1.6 }} placeholder="이곳에 필사를 시작하세요..." />
          
          <div className="mt-10 relative h-12 w-full flex items-end">
              <div className="absolute w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full mb-1" />
              <div className="absolute h-1 bg-blue-500 rounded-full transition-all duration-300 mb-1" style={{ width: `${progress}%` }} />
              <div className="absolute transition-all duration-700 ease-in-out flex flex-col items-center" style={{ left: `${progress}%`, transform: 'translateX(-50%)', bottom: '4px' }}>
                <div className="text-4xl animate-crawl">🐢</div>
                <div className="text-[10px] font-black text-blue-600 dark:text-blue-400 mt-1">{Math.round(progress)}%</div>
              </div>
              <div className="absolute right-0 bottom-4 text-2xl opacity-30">🏁</div>
          </div>
        </div>
      </div>

      {!externalContent && (
        <div className="mt-4 p-6 bg-white dark:bg-zinc-900 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600 font-bold text-xl">✍️</div>
                <div>
                    <h4 className="font-black text-zinc-900 dark:text-zinc-100">더 많은 글을 찾으시나요?</h4>
                    <p className="text-sm text-zinc-500 font-medium">유저들이 창작한 오픈 챌린지에서 다양한 문장으로 필사 연습을 즐겨보세요!</p>
                </div>
            </div>
            <button onClick={() => window.location.hash = 'challenge'} className="px-6 py-3 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 rounded-xl font-bold text-sm flex items-center gap-2 hover:scale-105 transition-all">
                오픈 챌린지 구경하기 <ArrowRight size={16} />
            </button>
        </div>
      )}
    </div>
  );
};

function PaperBtn({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
    return (
        <button onClick={onClick} className={`px-2 py-1 rounded-md text-[10px] font-black transition-all ${active ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>
            {label}
        </button>
    );
}

function ResultCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-2xl flex flex-col items-center gap-1 border border-zinc-200 dark:border-zinc-700">
            {icon}
            <span className="text-zinc-400 text-[10px] font-bold uppercase">{label}</span>
            <span className="text-lg font-black">{value}</span>
        </div>
    );
}

function PenTool(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 19l7-7 3 3-7 7-3-3z" /><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" /><path d="M2 2l7.586 7.586" /><circle cx="11" cy="11" r="2" />
    </svg>
  );
}
