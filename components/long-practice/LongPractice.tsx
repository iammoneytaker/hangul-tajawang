"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { LONG_TEXT_DB, LONG_TEXT_CATEGORIES } from "@/lib/long-text-data";
import { TypingUtils, TypingReport } from "@/lib/typing-speed";
import { Trophy, Clock, Target, Keyboard, RotateCcw, CheckCircle2, X, Type, ScrollText, Share2, Info, ArrowRight, Zap, Award, Sparkles, Filter, BookOpen } from "lucide-react";
import { SupabaseService } from "@/lib/supabase";

interface Progress {
  textId: string;
  typedText: string;
  elapsedSeconds: number;
  lastSaved: number;
}

type PaperType = 'white' | 'hanji' | 'kraft';
type FontType = 'font-noto' | 'font-myeongjo' | 'font-pen' | 'font-jua' | 'font-batang' | 'font-dodum' | 'font-gamja' | 'font-single' | 'font-stylish' | 'font-yeon' | 'font-brush' | 'font-gaegu' | 'font-poor' | 'font-dokdo';

export const LongPractice: React.FC<{ externalContent?: any }> = ({ externalContent }) => {
  const [user, setUser] = useState<any>(null);
  const [selectedTextId, setSelectedTextId] = useState(externalContent?.id || LONG_TEXT_DB[0].id);
  const [activeCategory, setActiveCategory] = useState("전체");
  const [inputValue, setInputValue] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [report, setReport] = useState<TypingReport | null>(null);
  const [rankings, setRankings] = useState<any[]>([]);
  
  const [liveKPM, setLiveKPM] = useState(0);
  const [liveAccuracy, setLiveAccuracy] = useState(100);

  const [fontSize, setFontSize] = useState(24);
  const [paperType, setPaperType] = useState<PaperType>('hanji');
  const [fontFamily, setFontFamily] = useState<FontType>('font-myeongjo');

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    SupabaseService.getCurrentUser().then(setUser);
  }, []);

  const filteredTexts = useMemo(() => {
    if (activeCategory === "전체") return LONG_TEXT_DB;
    return LONG_TEXT_DB.filter(t => t.category === activeCategory);
  }, [activeCategory]);

  const currentText = useMemo(() => {
    if (externalContent) return externalContent;
    const found = filteredTexts.find(t => t.id === selectedTextId);
    return found || filteredTexts[0] || LONG_TEXT_DB[0];
  }, [selectedTextId, externalContent, filteredTexts]);

  const originalNorm = useMemo(() => TypingUtils.normalize(currentText.content), [currentText]);

  useEffect(() => {
    const saved = localStorage.getItem(`progress_${selectedTextId}`);
    if (saved) setShowResumeModal(true);
    else resetState();
  }, [selectedTextId]);

  useEffect(() => {
    if (isActive && startTime && !report) {
      timerRef.current = setInterval(() => {
        const now = Date.now();
        const diff = (now - startTime) / 1000;
        setElapsedSeconds(diff);
        const currentStrokes = TypingUtils.getStrokeCount(inputValue);
        if (diff > 0.5) setLiveKPM(Math.round((currentStrokes / diff) * 60));
      }, 100);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isActive, report, inputValue, startTime]);

  const resetState = () => {
    setInputValue("");
    setStartTime(null);
    setElapsedSeconds(0);
    setLiveKPM(0);
    setLiveAccuracy(100);
    setIsActive(false);
    setReport(null);
    setRankings([]);
  };

  const handleResume = () => {
    const saved = localStorage.getItem(`progress_${selectedTextId}`);
    if (saved) {
      const data: Progress = JSON.parse(saved);
      setInputValue(data.typedText);
      setElapsedSeconds(data.elapsedSeconds || 0);
      setStartTime(Date.now() - (data.elapsedSeconds * 1000));
      setIsActive(true);
    }
    setShowResumeModal(false);
    textareaRef.current?.focus();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (report) return;
    const newValue = e.target.value;
    let currentStartTime = startTime;
    if (!isActive && newValue.length > 0) {
        setIsActive(true);
        currentStartTime = Date.now();
        setStartTime(currentStartTime);
    }
    setInputValue(newValue);
    const nowElapsed = currentStartTime ? (Date.now() - currentStartTime) / 1000 : 0.1;
    const currentStrokes = TypingUtils.getStrokeCount(newValue);
    setLiveKPM(Math.round((currentStrokes / (nowElapsed || 0.1)) * 60));
    const currentReport = TypingUtils.generateReport(currentText.content, newValue, 0, nowElapsed);
    setLiveAccuracy(currentReport.accuracy);
    const typedNorm = TypingUtils.normalize(newValue);
    if (typedNorm.length >= originalNorm.length && typedNorm.charAt(typedNorm.length - 1) === originalNorm.charAt(originalNorm.length - 1)) {
      finishTyping(newValue, nowElapsed);
    }
  };

  const finishTyping = async (finalValue: string, finalElapsed: number) => {
    setIsActive(false);
    const finalReport = TypingUtils.generateReport(currentText.content, finalValue, 0, finalElapsed);
    setReport(finalReport);
    localStorage.removeItem(`progress_${selectedTextId}`);
    if (user) {
        await SupabaseService.saveResult(currentText.id, finalReport.kpm, finalReport.accuracy, finalElapsed);
    }
    try {
        const topRankings = await SupabaseService.getRankings(currentText.id);
        setRankings(topRankings);
    } catch (e) { console.error("Ranking fetch failed:", e); }
  };

  const handleShare = async () => {
    if (!report) return;
    const shareText = `✍️ 한글타자왕 필사 완료!\n\n📜 글 제목: ${currentText.title}\n⚡ 타수: ${report.kpm}타\n🎯 정확도: ${report.accuracy}%\n⏱️ 시간: ${report.elapsedSeconds}초\n\n한글타자왕에서 연습해보세요!`;
    if (navigator.share) {
      try { await navigator.share({ title: '한글타자왕', text: shareText, url: window.location.href }); } catch (e) { console.log('Share failed'); }
    } else {
      await navigator.clipboard.writeText(shareText);
      alert('복사되었습니다!');
    }
  };

  const renderHighlightedText = () => {
    const chars = currentText.content.split("");
    const typedNorm = TypingUtils.normalize(inputValue);
    return chars.map((char: string, i: number) => {
      const normChar = TypingUtils.normalize(char);
      let color = "text-zinc-400"; 
      let bg = "";
      let deco = "";
      if (i === inputValue.length) {
        color = "text-blue-600 font-black";
        bg = "bg-blue-500/10 ring-2 ring-blue-500/20 rounded-sm";
      } else if (i < inputValue.length) {
        const tChar = typedNorm.charAt(i);
        if (tChar === normChar) color = "text-zinc-900 dark:text-zinc-50 font-bold";
        else { color = "text-red-500"; deco = "line-through opacity-80"; }
      }
      return <span key={i} className={`${color} ${bg} ${deco} transition-all`}>{char === "\n" ? <br /> : char}</span>;
    });
  };

  const progressValue = Math.min(100, (inputValue.length / currentText.content.length) * 100);

  const paperAssets = {
    white: { bg: "bg-white", img: "/images/paper/basic.jpg", overlay: "opacity-100" },
    hanji: { bg: "bg-[#fdfcf8]", img: "https://www.transparenttextures.com/patterns/natural-paper.png", overlay: "opacity-100" },
    kraft: { bg: "bg-white", img: "/images/paper/craft.jpg", overlay: "opacity-100" }
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-8 px-4 flex flex-col gap-6 relative">
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-20">
          <div className="absolute inset-[-10%] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] animate-pulse" />
      </div>

      {!externalContent && (
        <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
            {LONG_TEXT_CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-6 py-2.5 rounded-full text-sm font-black transition-all ${activeCategory === cat ? 'bg-zinc-900 text-white shadow-lg' : 'bg-white dark:bg-zinc-900 text-zinc-500 border border-zinc-200 dark:border-zinc-800 hover:border-blue-400'}`}>{cat}</button>
            ))}
        </div>
      )}

      <div className="flex justify-center gap-6 mb-2">
        <MetricItem icon={<Zap size={16}/>} label="현재 타수" value={liveKPM} unit="타" color="text-blue-600" />
        <MetricItem icon={<Target size={16}/>} label="정확도" value={liveAccuracy} unit="%" color="text-green-600" />
        <MetricItem icon={<Clock size={16}/>} label="시간" value={Math.floor(elapsedSeconds)} unit="초" color="text-purple-600" />
      </div>

      {report && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative max-w-2xl w-full my-auto animate-in zoom-in duration-500">
            <div className={`relative overflow-hidden rounded-[2.5rem] shadow-2xl border-8 border-white/20 ${paperAssets[paperType].bg} p-12 text-center`}>
                <div className={`absolute inset-0 pointer-events-none z-0 ${paperAssets[paperType].overlay}`} style={{ backgroundImage: `url(${paperAssets[paperType].img})`, backgroundSize: paperType === 'hanji' ? 'auto' : 'cover' }} />
                <div className="relative z-10 text-zinc-900">
                    <div className="flex justify-center mb-6"><div className="bg-yellow-400 text-white p-4 rounded-full shadow-xl"><Award size={48} /></div></div>
                    <h3 className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Completion Certificate</h3>
                    <h2 className={`text-4xl font-black mb-2 ${fontFamily}`}>{currentText.title}</h2>
                    <p className="text-zinc-500 text-xs font-bold mb-12">By {currentText.author} / 출처: {currentText.source || '한글타자왕'}</p>
                    <div className="grid grid-cols-3 gap-4 my-12">
                        <ResultItem label="Keystrokes" value={report.kpm} unit="타" />
                        <ResultItem label="Accuracy" value={report.accuracy} unit="%" />
                        <ResultItem label="Time" value={report.elapsedSeconds} unit="s" />
                    </div>
                    <div className="flex items-center justify-center gap-2 text-zinc-400 text-[10px] font-black uppercase tracking-widest"><Sparkles size={14} className="text-yellow-400" /> 한글타자왕 Web Edition <Sparkles size={14} className="text-yellow-400" /></div>
                </div>
            </div>
            <div className="mt-8 flex gap-4">
                <button onClick={resetState} className="flex-1 py-5 bg-white/10 text-white font-black rounded-2xl backdrop-blur-md transition-all">연습 종료</button>
                <button onClick={handleShare} className="flex-[2] py-5 bg-blue-600 text-white font-black rounded-2xl shadow-2xl flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all"><Share2 size={24} /> 결과 카드 공유</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 z-10">
        <div className="flex flex-col gap-1">
            <h2 className="text-3xl font-black text-zinc-900 dark:text-white flex items-center gap-2"><PenTool size={28} className="text-blue-600" /> {externalContent ? "챌린지 필사" : "긴 글 연습"}</h2>
            <p className="text-xs text-zinc-400 font-medium flex items-center gap-1"><BookOpen size={12}/> {currentText.author} · {currentText.source}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md p-2 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2 px-3 border-r border-zinc-100 dark:border-zinc-800">
            <Type size={16} className="text-zinc-400" />
            <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value as FontType)} className="bg-transparent text-xs font-bold outline-hidden cursor-pointer">
                <option value="font-noto">본고딕</option><option value="font-myeongjo">나눔명조</option><option value="font-batang">고운바탕</option><option value="font-dodum">고운돋움</option><option value="font-pen">나눔펜</option><option value="font-brush">나눔브러쉬</option><option value="font-gaegu">개구체</option><option value="font-poor">푸어스토리</option><option value="font-dokdo">독도체</option><option value="font-gamja">감자꽃</option><option value="font-single">싱글데이</option><option value="font-yeon">연성체</option><option value="font-stylish">스타일리시</option><option value="font-jua">배민 주아</option>
            </select>
            <input type="range" min="16" max="40" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="w-16 accent-blue-600" />
          </div>
          <div className="flex items-center gap-1 px-3 border-r border-zinc-100 dark:border-zinc-800">
            <ScrollText size={16} className="text-zinc-400 mr-1" />
            <PaperBtn active={paperType==='white'} label="기본" onClick={()=>setPaperType('white')} />
            <PaperBtn active={paperType==='hanji'} label="한지" onClick={()=>setPaperType('hanji')} />
            <PaperBtn active={paperType==='kraft'} label="크라프트" onClick={()=>setPaperType('kraft')} />
          </div>
          {!externalContent && <select value={selectedTextId} onChange={(e) => setSelectedTextId(e.target.value)} className="bg-transparent text-sm font-bold outline-hidden cursor-pointer px-2 max-w-[150px]">{filteredTexts.map(text => <option key={text.id} value={text.id}>{text.title}</option>)}</select>}
        </div>
      </div>

      <div className={`w-full h-[70vh] bg-white dark:bg-zinc-950 shadow-2xl rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row border-4 border-zinc-200 dark:border-zinc-800 transition-all duration-500 z-10 relative`}>
        <div className={`absolute inset-0 pointer-events-none z-0 ${paperAssets[paperType].overlay}`} style={{ backgroundImage: `url(${paperAssets[paperType].img})`, backgroundSize: paperType === 'hanji' ? 'auto' : 'cover' }} />
        <div ref={scrollRef} className={`flex-1 p-10 overflow-y-auto relative scroll-smooth border-r border-zinc-200/20 z-10 ${fontFamily}`} style={{ fontSize: `${fontSize}px`, lineHeight: 1.6 }}><div className="max-w-none text-left tracking-wide whitespace-pre-wrap select-none text-zinc-900 dark:text-zinc-100">{renderHighlightedText()}</div></div>
        <div className={`flex-1 p-10 relative flex flex-col bg-zinc-50/30 dark:bg-white/5 z-10 ${fontFamily}`}>
          <div className="flex justify-between items-center mb-6">
            <span className="px-3 py-1 bg-blue-600 text-white text-[10px] font-black rounded-full uppercase">Typing</span>
            <div className="flex gap-4 text-sm font-black text-zinc-500">
                <span className="flex items-center gap-1"><Keyboard size={14}/> {TypingUtils.getStrokeCount(inputValue)}</span>
                <span className="flex items-center gap-1"><Clock size={14}/> {Math.floor(elapsedSeconds/60)}:{String(Math.floor(elapsedSeconds)%60).padStart(2,'0')}</span>
            </div>
          </div>
          <textarea ref={textareaRef} value={inputValue} onChange={handleInputChange} className="flex-1 w-full bg-transparent resize-none outline-hidden leading-relaxed z-10 py-0 text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400/20" style={{ fontSize: `${fontSize}px`, lineHeight: 1.6 }} placeholder="이곳에 필사를 시작하세요..." />
          <div className="mt-10 relative h-12 w-full flex items-end">
              <div className="absolute w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full mb-1" />
              <div className="absolute h-1 bg-blue-500 rounded-full transition-all duration-300 mb-1" style={{ width: `${progressValue}%` }} />
              <div className="absolute transition-all duration-700 ease-in-out flex flex-col items-center" style={{ left: `${progressValue}%`, transform: 'translateX(-50%)', bottom: '4px' }}><div className="text-4xl animate-crawl">🐢</div><div className="text-[10px] font-black text-blue-600 dark:text-blue-400 mt-1">{Math.round(progressValue)}%</div></div>
              <div className="absolute right-0 bottom-4 text-2xl opacity-30">🏁</div>
          </div>
        </div>
      </div>

      {!externalContent && (
        <div className="mt-4 p-6 bg-white dark:bg-zinc-900 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600 font-bold text-xl">✍️</div>
                <div><h4 className="font-black text-zinc-900 dark:text-zinc-100">더 많은 글을 찾으시나요?</h4><p className="text-sm text-zinc-500 font-medium">유저들이 창작한 오픈 챌린지에서 다양한 문장으로 필사 연습을 즐겨보세요!</p></div>
            </div>
            <button onClick={() => window.location.href = '/challenge'} className="px-6 py-3 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 rounded-xl font-bold text-sm flex items-center gap-2 hover:scale-105 transition-all text-center">오픈 챌린지 구경하기 <ArrowRight size={16} /></button>
        </div>
      )}
    </div>
  );
};

function MetricItem({ icon, label, value, unit, color }: { icon: any, label: string, value: number, unit?: string, color: string }) {
    return (
        <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 px-4 py-2 rounded-xl border border-zinc-100 dark:border-zinc-800 shadow-sm transition-all hover:scale-105">
            <div className={color}>{icon}</div>
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-tighter">{label}</span>
            <span className={`text-lg font-black ${color}`}>{value}{unit}</span>
        </div>
    );
}

function ResultItem({ label, value, unit }: { label: string, value: number, unit: string }) {
    return (
        <div className="bg-white/50 backdrop-blur-sm p-6 rounded-3xl border border-white/50 text-zinc-900">
            <p className="text-zinc-400 text-[10px] font-black uppercase mb-1">{label}</p>
            <p className="text-3xl font-black text-blue-600">{value}<span className="text-xs ml-1 font-bold">{unit}</span></p>
        </div>
    );
}

function PaperBtn({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
    return (
        <button onClick={onClick} className={`px-2 py-1 rounded-md text-[10px] font-black transition-all ${active ? 'bg-blue-600 text-white shadow-md' : 'text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>
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
