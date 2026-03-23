"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { LONG_TEXT_DB } from "@/lib/long-text-data";
import { TypingUtils, TypingReport } from "@/lib/typing-speed";
import { Clock, Target, Zap, RotateCcw, BookOpen, ScrollText, Keyboard, Award, Sparkles, User, Send, MessageSquare, Trash2, Users, Heart, ArrowRight, Type, Star, Flame, ChevronRight } from "lucide-react";
import { SupabaseService, supabase } from "@/lib/supabase";
import { KeyboardRecommendationBanner } from "../layout/KeyboardRecommendationBanner";
import Link from "next/link";
import Image from "next/image";

interface Props {
  externalContent?: any;
}

type FontType = "font-noto" | "font-myeongjo" | "font-batang" | "font-dodum" | "font-pen" | "font-brush" | "font-gaegu" | "font-poor" | "font-dokdo" | "font-gamja" | "font-single" | "font-yeon" | "font-stylish" | "font-jua";

export const LongPractice: React.FC<Props> = ({ externalContent }) => {
  const [selectedTextId, setSelectedTextId] = useState(LONG_TEXT_DB[0].id);
  const [inputValue, setInputValue] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [report, setReport] = useState<TypingReport | null>(null);
  const [fontSize, setFontSize] = useState(24);
  const [fontFamily, setFontFamily] = useState<FontType>("font-myeongjo");
  const [paperType, setPaperType] = useState<"white" | "hanji" | "kraft">("white");
  
  const [user, setUser] = useState<any>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState<number>(externalContent?.like_count || 0);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [related, setRelated] = useState<{ authorOther: any[], popular: any[] }>({ authorOther: [], popular: [] });

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentText = useMemo(() => 
    externalContent || LONG_TEXT_DB.find(t => t.id === selectedTextId) || LONG_TEXT_DB[0],
  [externalContent, selectedTextId]);

  const fetchSocialData = useCallback(async () => {
    if (!externalContent) return;
    const currentUser = await SupabaseService.getCurrentUser();
    setUser(currentUser);
    if (currentUser) {
        const { data: like } = await supabase.from('likes').select().match({ user_id: currentUser.id, content_id: externalContent.id }).maybeSingle();
        setIsLiked(!!like);
    }
    const [cData, relData] = await Promise.all([
        supabase.from('typing_comments').select('*, profiles(nickname, avatar_url)').eq('content_id', externalContent.id).order('created_at', { ascending: false }),
        SupabaseService.getRelatedContents(externalContent.author_id, externalContent.id)
    ]);
    setComments(cData.data || []);
    setRelated(relData);
  }, [externalContent]);

  useEffect(() => {
    fetchSocialData();
  }, [fetchSocialData]);

  useEffect(() => {
    let timer: any;
    if (startTime && !report) {
      timer = setInterval(() => setElapsedSeconds((Date.now() - startTime) / 1000), 100);
    }
    return () => clearInterval(timer);
  }, [startTime, report]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (!startTime && val.length > 0) setStartTime(Date.now());
    setInputValue(val);
    if (val.length >= currentText.content.length) {
      const finalReport = TypingUtils.generateReport(currentText.content, val, 0, elapsedSeconds);
      setReport(finalReport);
      if (externalContent) {
        SupabaseService.saveResult(externalContent.id, finalReport.kpm, finalReport.accuracy, Math.round(elapsedSeconds));
      }
    }
  };

  const handleToggleLike = async () => {
    if (!user) return alert("로그인 후 이용 가능합니다.");
    try {
      await SupabaseService.toggleLike(externalContent.id, isLiked, externalContent.author_id);
      setIsLiked(!isLiked);
      setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    } catch (e) { alert("처리 실패"); }
  };

  const handleAddComment = async () => {
    if (!user || !newComment.trim()) return;
    setCommentLoading(true);
    try {
      await SupabaseService.addComment(externalContent.id, newComment.trim(), externalContent.author_id);
      setNewComment("");
      const { data } = await supabase.from('typing_comments').select('*, profiles(nickname, avatar_url)').eq('content_id', externalContent.id).order('created_at', { ascending: false });
      setComments(data || []);
    } finally { setCommentLoading(false); }
  };

  const handleDeleteComment = async (id: string) => {
    if (!confirm("댓글을 삭제하시겠습니까?")) return;
    await SupabaseService.deleteComment(id);
    setComments(prev => prev.filter(c => c.id !== id));
  };

  const resetState = () => { setInputValue(""); setStartTime(null); setElapsedSeconds(0); setReport(null); };

  const liveKPM = useMemo(() => {
    if (!startTime || elapsedSeconds < 0.5) return 0;
    return Math.round((TypingUtils.getStrokeCount(inputValue) / elapsedSeconds) * 60);
  }, [inputValue, elapsedSeconds, startTime]);

  const liveAccuracy = useMemo(() => {
    if (inputValue.length === 0) return 100;
    const typedNorm = TypingUtils.normalize(inputValue);
    const targetNorm = TypingUtils.normalize(currentText.content.substring(0, inputValue.length));
    let correct = 0;
    for(let i=0; i<typedNorm.length; i++) if(typedNorm[i] === targetNorm[i]) correct++;
    return Math.round((correct / Math.max(1, typedNorm.length)) * 100);
  }, [inputValue, currentText.content]);

  const renderHighlightedText = () => {
    const chars = currentText.content.split("");
    const typedNorm = TypingUtils.normalize(inputValue);
    return chars.map((char: string, i: number) => {
      const normChar = TypingUtils.normalize(char);
      let color = "text-zinc-400"; let bg = ""; let deco = "";
      if (i === inputValue.length) { 
          color = "text-primary font-black"; 
          bg = "bg-primary/10 ring-4 ring-primary/5 rounded-sm"; 
      }
      else if (i < inputValue.length) {
        const tChar = typedNorm.charAt(i);
        if (tChar === normChar) color = "text-on-surface font-bold";
        else { color = "text-red-500 line-through opacity-80"; }
      }
      return <span key={i} className={`${color} ${bg} ${deco} transition-all`}>{char === "\n" ? <br /> : char}</span>;
    });
  };

  const progressValue = Math.min(100, (inputValue.length / currentText.content.length) * 100);

  const paperAssets = {
    white: { bg: "bg-surface-lowest", img: "/images/paper/basic.jpg", overlay: "opacity-100" },
    hanji: { bg: "bg-[#fdfcf8]", img: "https://www.transparenttextures.com/patterns/natural-paper.png", overlay: "opacity-100" },
    kraft: { bg: "bg-surface-lowest", img: "/images/paper/craft.jpg", overlay: "opacity-100" }
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-12 px-6 flex flex-col gap-10 relative animate-in fade-in duration-1000">
      <div className="flex justify-center gap-8 mb-4">
        <MetricItem icon={<Zap size={18}/>} label="현재 타수" value={liveKPM} unit="타" color="text-primary" />
        <MetricItem icon={<Target size={18}/>} label="정확도" value={liveAccuracy} unit="%" color="text-green-600" />
        <MetricItem icon={<Clock size={18}/>} label="진행 시간" value={Math.floor(elapsedSeconds)} unit="초" color="text-secondary" />
      </div>

      {report && (
        <div className="fixed inset-0 bg-on-surface/80 backdrop-blur-xl z-[100] flex items-center justify-center p-6 overflow-y-auto">
          <div className="relative max-w-2xl w-full my-auto animate-in zoom-in duration-500">
            <div className={`relative overflow-hidden rounded-[3.5rem] shadow-2xl ${paperAssets[paperType].bg} p-16 text-center`}>
                <div className={`absolute inset-0 pointer-events-none z-0 ${paperAssets[paperType].overlay}`} style={{ backgroundImage: `url(${paperAssets[paperType].img})`, backgroundSize: paperType === 'hanji' ? 'auto' : 'cover' }} />
                <div className="relative z-10 text-on-surface">
                    <div className="flex justify-center mb-8"><div className="primary-gradient text-white p-6 rounded-full shadow-2xl"><Award size={60} /></div></div>
                    <h2 className={`display-lg !text-5xl mb-4 ${fontFamily}`}>{currentText.title}</h2>
                    <p className="text-zinc-500 text-xs font-black mb-16 tracking-[0.3em] uppercase">By {currentText.author} / {currentText.source || '한글타자왕'}</p>
                    <div className="grid grid-cols-3 gap-8 mb-16">
                        <ResultItem label="Keystrokes" value={report.kpm} unit="타" />
                        <ResultItem label="Accuracy" value={report.accuracy} unit="%" />
                        <ResultItem label="Time" value={report.elapsedSeconds} unit="s" />
                    </div>
                    <div className="relative z-10">
                        <KeyboardRecommendationBanner variant="light" className="!mt-0 !rounded-[2.5rem]" />
                    </div>
                </div>
            </div>
            <div className="mt-10 flex gap-6">
                <button onClick={resetState} className="flex-1 py-6 bg-white/10 text-white font-black rounded-[2rem] hover:bg-white/20 transition-all">연습 종료</button>
                <button onClick={() => window.location.reload()} className="flex-[2] py-6 primary-gradient text-white font-black rounded-[2rem] shadow-2xl shadow-primary/30 hover:scale-[1.02] transition-all">다시 연습하기</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
            <span className="text-primary font-black text-[10px] uppercase tracking-[0.5em] mb-2 block">{externalContent ? "Challenge Transcription" : "Editorial Practice"}</span>
            <h2 className="display-lg !text-5xl text-on-surface flex items-center gap-4">{currentText.title}</h2>
            <p className="text-sm text-zinc-400 font-black flex items-center gap-2 mt-4"><BookOpen size={14} className="text-primary" /> {currentText.author} · {currentText.source}</p>
        </div>
        <div className="flex items-center gap-4 bg-surface-lowest p-3 rounded-[2rem] shadow-sm">
          <div className="flex items-center gap-4 px-4 border-r border-surface-high">
            <Type size={18} className="text-primary" />
            <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value as FontType)} className="bg-transparent text-sm font-black outline-hidden cursor-pointer appearance-none hover:text-primary transition-colors">
                <option value="font-noto">본고딕</option><option value="font-myeongjo">나눔명조</option><option value="font-batang">고운바탕</option><option value="font-dodum">고운돋움</option><option value="font-pen">나눔펜</option><option value="font-brush">나눔브러쉬</option><option value="font-gaegu">개구체</option><option value="font-poor">푸어스토리</option><option value="font-dokdo">독도체</option><option value="font-gamja">감자꽃</option><option value="font-single">싱글데이</option><option value="font-yeon">연성체</option><option value="font-stylish">스타일리시</option><option value="font-jua">배민 주아</option>
            </select>
            <input type="range" min="16" max="40" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="w-24 accent-primary" />
          </div>
          <div className="flex items-center gap-2 px-2">
            <PaperBtn active={paperType==='white'} label="White" onClick={()=>setPaperType('white')} />
            <PaperBtn active={paperType==='hanji'} label="Hanji" onClick={()=>setPaperType('hanji')} />
            <PaperBtn active={paperType==='kraft'} label="Kraft" onClick={()=>setPaperType('kraft')} />
          </div>
        </div>
      </div>

      <div className={`w-full h-[75vh] shadow-[0_40px_80px_rgba(21,28,39,0.1)] rounded-[4rem] overflow-hidden flex flex-col md:flex-row transition-all duration-700 relative`}>
        <div className={`absolute inset-0 pointer-events-none z-0 ${paperAssets[paperType].overlay}`} style={{ backgroundImage: `url(${paperAssets[paperType].img})`, backgroundSize: paperType === 'hanji' ? 'auto' : 'cover' }} />
        
        <div ref={scrollRef} className={`flex-1 p-12 md:p-20 overflow-y-auto relative scroll-smooth border-r border-on-surface/5 z-10 ${fontFamily}`} style={{ fontSize: `${fontSize}px`, lineHeight: 1.8 }}>
            <div className="max-w-none text-left tracking-tight whitespace-pre-wrap select-none text-on-surface">{renderHighlightedText()}</div>
        </div>

        <div className={`flex-1 p-12 md:p-20 relative flex flex-col bg-on-surface/5 backdrop-blur-sm z-10 ${fontFamily}`}>
          <div className="flex justify-between items-center mb-10">
            <span className="px-4 py-1.5 primary-gradient text-white text-[10px] font-black rounded-full uppercase tracking-widest shadow-lg shadow-primary/20">Active Transcription</span>
            <div className="flex gap-8 text-sm font-black text-zinc-400">
                <span className="flex items-center gap-2"><Keyboard size={16}/> {TypingUtils.getStrokeCount(inputValue)}</span>
                <span className="flex items-center gap-2"><Clock size={16}/> {Math.floor(elapsedSeconds/60)}:{String(Math.floor(elapsedSeconds)%60).padStart(2,'0')}</span>
            </div>
          </div>
          <textarea ref={textareaRef} value={inputValue} onChange={handleInputChange} className="flex-1 w-full bg-transparent resize-none outline-hidden leading-relaxed z-10 py-0 text-on-surface placeholder:text-zinc-400/30" style={{ fontSize: `${fontSize}px`, lineHeight: 1.8 }} placeholder="이곳에 필사를 시작하세요..." />
          
          <div className="mt-12 relative h-16 w-full flex items-end">
              <div className="absolute w-full h-2 bg-surface-high rounded-full mb-2 shadow-inner" />
              <div className="absolute h-2 bg-primary rounded-full transition-all duration-300 mb-2 shadow-[0_0_20px_rgba(0,74,198,0.4)]" style={{ width: `${progressValue}%` }} />
              <div className="absolute transition-all duration-700 ease-in-out flex flex-col items-center" style={{ left: `${progressValue}%`, transform: 'translateX(-50%)', bottom: '8px' }}>
                  <div className="text-4xl filter drop-shadow-lg">🐢</div>
                  <div className="text-[10px] font-black text-primary mt-2">{Math.round(progressValue)}%</div>
              </div>
          </div>
        </div>
      </div>

      {externalContent && (
        <div className="mt-32 space-y-32 z-10">
            <section className="bg-surface-lowest p-16 rounded-[4rem] shadow-[0_20px_60px_rgba(21,28,39,0.06)] flex flex-col md:flex-row items-center gap-16">
                {externalContent.profiles?.avatar_url ? (
                    <Image src={externalContent.profiles.avatar_url} alt="작가" width={180} height={180} className="w-40 h-40 md:w-56 md:h-56 rounded-[4rem] object-cover shadow-2xl" />
                ) : (
                    <div className="w-40 h-40 md:w-56 md:h-56 bg-surface-low rounded-[4rem] flex items-center justify-center text-primary/30 shadow-2xl"><User size={80} /></div>
                )}
                <div className="flex-1 text-center md:text-left">
                    <span className="text-primary font-black text-[10px] uppercase tracking-[0.5em] mb-4 block underline decoration-4 decoration-primary/20 underline-offset-8">Original Author</span>
                    <h3 className="display-lg !text-5xl mb-8">{externalContent.profiles?.nickname || '익명 작가'}</h3>
                    <div className="flex flex-wrap justify-center md:justify-start gap-16">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Likes</span>
                            <span className={`text-4xl font-black flex items-center gap-4 transition-all ${isLiked ? 'text-red-500 scale-110' : 'text-on-surface'}`}>
                                <Heart size={32} className={isLiked ? "fill-red-500 text-red-500" : ""} onClick={handleToggleLike} /> {likeCount}
                            </span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Participants</span>
                            <span className="text-4xl font-black text-primary flex items-center gap-4">
                                <Users size={32} /> {externalContent.complete_count || 0}
                            </span>
                        </div>
                    </div>
                </div>
                <Link href={`/challenge?authorId=${externalContent.author_id}`} className="px-12 py-6 bg-on-surface text-white font-black rounded-3xl hover:scale-105 transition-all shadow-2xl shadow-on-surface/20 flex items-center gap-3">작가의 글 더보기 <ChevronRight size={20}/></Link>
            </section>

            <section className="bg-surface-lowest p-16 rounded-[4rem] shadow-xl">
                <div className="flex items-center gap-4 mb-16">
                    <MessageSquare className="text-primary" size={32} />
                    <h3 className="headline-md">Comments <span className="text-primary opacity-30">/ {comments.length}</span></h3>
                </div>

                <div className="relative mb-20">
                    <input 
                        type="text" 
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                        placeholder={user ? "작가님께 따뜻한 응원의 한마디를 남겨주세요" : "로그인 후 댓글을 남길 수 있습니다"}
                        disabled={!user || commentLoading}
                        className="w-full p-8 bg-surface-low border-none rounded-[2.5rem] outline-hidden focus:shadow-xl transition-all text-xl font-medium pr-28"
                    />
                    <button 
                        onClick={handleAddComment}
                        disabled={!user || !newComment.trim() || commentLoading}
                        className="absolute right-4 top-4 bottom-4 px-8 primary-gradient text-white rounded-2xl font-black hover:scale-105 disabled:opacity-50 transition-all flex items-center justify-center shadow-xl shadow-primary/20"
                    >
                        {commentLoading ? <RotateCcw className="animate-spin" size={24} /> : <Send size={24} />}
                    </button>
                </div>

                <div className="space-y-12 max-h-[60vh] overflow-y-auto pr-8 custom-scrollbar">
                    {comments.length > 0 ? comments.map((c) => (
                        <div key={c.id} className="flex gap-8 group/comment animate-in slide-in-from-bottom duration-500">
                            {c.profiles?.avatar_url ? (
                                <Image src={c.profiles.avatar_url} alt="avatar" width={64} height={64} className="w-16 h-16 rounded-[1.5rem] object-cover shadow-md" />
                            ) : (
                                <div className="w-16 h-16 bg-surface-high rounded-[1.5rem] flex items-center justify-center font-black text-primary/30 text-2xl">{c.profiles?.nickname?.[0] || '?'}</div>
                            )}
                            <div className="flex-1">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="font-black text-xl text-on-surface">{c.profiles?.nickname || '익명'}</span>
                                    <div className="flex items-center gap-6">
                                        <span className="text-xs font-black text-zinc-300 uppercase tracking-widest">{new Date(c.created_at).toLocaleDateString()}</span>
                                        {user?.id === c.user_id && (
                                            <button onClick={() => handleDeleteComment(c.id)} className="text-red-400 opacity-0 group-hover/comment:opacity-100 transition-all hover:scale-125"><Trash2 size={18}/></button>
                                        )}
                                    </div>
                                </div>
                                <p className="text-zinc-500 text-lg leading-relaxed">{c.comment}</p>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-24 text-zinc-300 font-black text-2xl uppercase tracking-[0.2em] opacity-30">아직 댓글이 없습니다</div>
                    )}
                </div>
            </section>
        </div>
      )}

      {!externalContent && (
        <div className="mt-32 w-full p-16 bg-on-surface rounded-[4rem] text-white flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden shadow-[0_40px_80px_rgba(21,28,39,0.2)]">
            <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none scale-150">
                <ScrollText size={300} />
            </div>
            <div className="relative z-10 text-center md:text-left flex-1">
                <div className="inline-flex px-5 py-1.5 bg-primary rounded-full text-[10px] font-black uppercase tracking-widest mb-8 shadow-lg shadow-primary/20">커뮤니티와 함께</div>
                <h2 className="display-lg !text-5xl mb-6">유저들이 만든 글은 어때요?</h2>
                <p className="text-zinc-400 font-medium text-xl leading-relaxed max-w-xl">매일 새로운 감성 명문이 올라오는 필사 챌린지에서 다른 유저들과 소통하며 연습해 보세요.</p>
            </div>
            <Link 
                href="/challenge" 
                className="px-12 py-7 bg-white text-on-surface font-black rounded-[2rem] hover:scale-[1.05] transition-all flex items-center gap-4 whitespace-nowrap shadow-2xl group relative z-10"
            >
                필사 챌린지 참여하기 <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform text-primary" />
            </Link>
        </div>
      )}
    </div>
  );
};

function MetricItem({ icon, label, value, unit, color }: { icon: any, label: string, value: number, unit?: string, color: string }) {
    return (
        <div className="flex items-center gap-3 bg-surface-lowest px-6 py-3 rounded-[1.5rem] shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
            <div className={color}>{icon}</div>
            <div className="flex flex-col">
                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-0.5">{label}</span>
                <span className={`text-xl font-black ${color}`}>{value}<span className="text-xs ml-0.5 opacity-50">{unit}</span></span>
            </div>
        </div>
    );
}

function ResultItem({ label, value, unit }: { label: string, value: number, unit: string }) {
    return (
        <div className="bg-on-surface/5 backdrop-blur-sm p-8 rounded-[2.5rem] text-on-surface">
            <p className="text-zinc-400 text-[10px] font-black uppercase mb-2 tracking-widest">{label}</p>
            <p className="text-4xl font-black text-primary">{value}<span className="text-xs ml-1 font-bold opacity-50">{unit}</span></p>
        </div>
    );
}

function PaperBtn({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
    return (
        <button onClick={onClick} className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${active ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-zinc-400 hover:bg-surface-high'}`}>
            {label}
        </button>
    );
}
