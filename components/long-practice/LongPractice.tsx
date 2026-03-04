"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { LONG_TEXT_DB, LONG_TEXT_CATEGORIES } from "@/lib/long-text-data";
import { TypingUtils, TypingReport } from "@/lib/typing-speed";
import { Trophy, Clock, Target, Zap, RotateCcw, Layout, ChevronLeft, ChevronRight, Settings, Image as ImageIcon, Save, Share2, Star, ArrowRight, Heart, Flame, X, Type, BookOpen, ScrollText, Keyboard, Award, Sparkles, User, Eye, Send, MessageSquare, Trash2, Users } from "lucide-react";
import { SupabaseService, supabase } from "@/lib/supabase";
import Link from "next/link";
import Image from "next/image";

interface Props {
  externalContent?: any;
}

type FontType = "font-noto" | "font-myeongjo" | "font-batang" | "font-dodum" | "font-pen" | "font-brush" | "font-gaegu" | "font-poor" | "font-dokdo" | "font-gamja" | "font-single" | "font-yeon" | "font-stylish" | "font-jua";

export const LongPractice: React.FC<Props> = ({ externalContent }) => {
  const [selectedTextId, setSelectedTextId] = useState(LONG_TEXT_DB[0].id);
  const [activeCategory, setActiveCategory] = useState("전체");
  const [inputValue, setInputValue] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [report, setReport] = useState<TypingReport | null>(null);
  const [fontSize, setFontSize] = useState(24);
  const [fontFamily, setFontFamily] = useState<FontType>("font-myeongjo");
  const [paperType, setPaperType] = useState<"white" | "hanji" | "kraft">("white");
  
  // 소셜 및 추천 상태
  const [user, setUser] = useState<any>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(externalContent?.like_count || 0);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [related, setRelated] = useState<{ authorOther: any[], popular: any[] }>({ authorOther: [], popular: [] });

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentText = useMemo(() => 
    externalContent || LONG_TEXT_DB.find(t => t.id === selectedTextId) || LONG_TEXT_DB[0],
  [externalContent, selectedTextId]);

  const lines = useMemo(() => currentText.content.split("\n") || [], [currentText]);

  // 데이터 로딩 및 초기화
  const fetchSocialData = useCallback(async () => {
    if (!externalContent) return;
    
    const currentUser = await SupabaseService.getCurrentUser();
    setUser(currentUser);

    // 좋아요 여부 확인
    if (currentUser) {
        const { data: like } = await supabase.from('likes').select().match({ user_id: currentUser.id, content_id: externalContent.id }).maybeSingle();
        setIsLiked(!!like);
    }

    // 댓글 및 추천 글 가져오기
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

  // 소셜 핸들러
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
      // 목록 갱신
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
      if (i === inputValue.length) { color = "text-blue-600 font-black"; bg = "bg-blue-500/10 ring-2 ring-blue-500/20 rounded-sm"; }
      else if (i < inputValue.length) {
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
                    <h2 className={`text-4xl font-black mb-2 ${fontFamily}`}>{currentText.title}</h2>
                    <p className="text-zinc-500 text-xs font-bold mb-12">By {currentText.author} / 출처: {currentText.source || '한글타자왕'}</p>
                    <div className="grid grid-cols-3 gap-4 my-12">
                        <ResultItem label="Keystrokes" value={report.kpm} unit="타" />
                        <ResultItem label="Accuracy" value={report.accuracy} unit="%" />
                        <ResultItem label="Time" value={report.elapsedSeconds} unit="s" />
                    </div>
                </div>
            </div>
            <div className="mt-8 flex gap-4">
                <button onClick={resetState} className="flex-1 py-5 bg-white/10 text-white font-black rounded-2xl">연습 종료</button>
                <button onClick={() => window.location.reload()} className="flex-[2] py-5 bg-blue-600 text-white font-black rounded-2xl shadow-2xl">다시 연습하기</button>
            </div>
          </div>
        </div>
      )}

      {/* 헤더 및 컨트롤 */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 z-10">
        <div>
            <h2 className="text-3xl font-black text-zinc-900 dark:text-white flex items-center gap-2"><PenTool size={28} className="text-blue-600" /> {externalContent ? "챌린지 필사" : "긴 글 연습"}</h2>
            <p className="text-xs text-zinc-400 font-medium flex items-center gap-1"><BookOpen size={12}/> {currentText.author} · {currentText.source}</p>
        </div>
        <div className="flex items-center gap-3 bg-white/90 dark:bg-zinc-900/90 p-2 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2 px-3 border-r border-zinc-100 dark:border-zinc-800">
            <Type size={16} className="text-zinc-400" />
            <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value as FontType)} className="bg-transparent text-xs font-bold outline-hidden cursor-pointer">
                <option value="font-noto">본고딕</option><option value="font-myeongjo">나눔명조</option><option value="font-batang">고운바탕</option><option value="font-dodum">고운돋움</option><option value="font-pen">나눔펜</option><option value="font-brush">나눔브러쉬</option><option value="font-gaegu">개구체</option><option value="font-poor">푸어스토리</option><option value="font-dokdo">독도체</option><option value="font-gamja">감자꽃</option><option value="font-single">싱글데이</option><option value="font-yeon">연성체</option><option value="font-stylish">스타일리시</option><option value="font-jua">배민 주아</option>
            </select>
            <input type="range" min="16" max="40" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="w-16 accent-blue-600" />
          </div>
          <div className="flex items-center gap-1 px-2">
            <PaperBtn active={paperType==='white'} label="기본" onClick={()=>setPaperType('white')} />
            <PaperBtn active={paperType==='hanji'} label="한지" onClick={()=>setPaperType('hanji')} />
            <PaperBtn active={paperType==='kraft'} label="크라프트" onClick={()=>setPaperType('kraft')} />
          </div>
        </div>
      </div>

      {/* 원고지 메인 뷰어 */}
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
          </div>
        </div>
      </div>

      {/* 하단 작가 정보 및 댓글 섹션 */}
      {externalContent && (
        <div className="mt-20 space-y-24 z-10 animate-in fade-in duration-1000">
            <section className="bg-white dark:bg-zinc-900 p-10 rounded-[3.5rem] border border-zinc-100 dark:border-zinc-800 shadow-2xl flex flex-col md:flex-row items-center gap-10">
                {externalContent.profiles?.avatar_url ? (
                    <Image src={externalContent.profiles.avatar_url} alt="작가" width={140} height={140} className="w-32 h-32 md:w-40 md:h-40 rounded-[3rem] object-cover border-4 border-white dark:border-zinc-800 shadow-2xl" />
                ) : (
                    <div className="w-32 h-32 md:w-40 md:h-40 bg-blue-50 dark:bg-blue-900/20 rounded-[3rem] flex items-center justify-center text-blue-300 border-4 border-white dark:border-zinc-800 shadow-2xl"><User size={60} /></div>
                )}
                <div className="flex-1 text-center md:text-left">
                    <span className="text-blue-600 font-black text-[10px] uppercase tracking-[0.4em] mb-2 block">Original Author</span>
                    <h3 className="text-4xl font-black mb-6 text-zinc-900 dark:text-zinc-100">{externalContent.profiles?.nickname || '익명 작가'}</h3>
                    <div className="flex flex-wrap justify-center md:justify-start gap-12">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">이 글의 좋아요</span>
                            <span className={`text-3xl font-black flex items-center gap-3 transition-colors ${isLiked ? 'text-red-500' : 'text-zinc-900 dark:text-zinc-100'}`}>
                                <Heart size={24} className={isLiked ? "fill-red-500 text-red-500" : ""} /> {likeCount}
                            </span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">필사 참여 인원</span>
                            <span className="text-3xl font-black text-blue-600 flex items-center gap-3">
                                <Users size={24} /> {externalContent.complete_count || 0}명
                            </span>
                        </div>
                    </div>
                </div>
                <Link href={`/challenge?authorId=${externalContent.author_id}`} className="px-10 py-5 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 font-black rounded-3xl hover:scale-105 transition-all shadow-xl">작가의 글 더보기</Link>
            </section>

            {/* 댓글 시스템 */}
            <section className="bg-white dark:bg-zinc-900 p-10 rounded-[3.5rem] border border-zinc-100 dark:border-zinc-800 shadow-xl">
                <div className="flex items-center gap-3 mb-10">
                    <MessageSquare className="text-blue-600" size={24} />
                    <h3 className="text-2xl font-black">댓글 <span className="text-blue-600">{comments.length}</span></h3>
                </div>

                <div className="relative mb-12">
                    <input 
                        type="text" 
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                        placeholder={user ? "작가님께 따뜻한 응원의 한마디를 남겨주세요" : "로그인 후 댓글을 남길 수 있습니다"}
                        disabled={!user || commentLoading}
                        className="w-full p-6 bg-zinc-50 dark:bg-zinc-800 border-none rounded-[2rem] outline-hidden focus:ring-4 focus:ring-blue-500/20 text-lg font-medium pr-20"
                    />
                    <button 
                        onClick={handleAddComment}
                        disabled={!user || !newComment.trim() || commentLoading}
                        className="absolute right-3 top-3 bottom-3 px-6 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center shadow-lg"
                    >
                        {commentLoading ? <X className="animate-spin" size={20} /> : <Send size={20} />}
                    </button>
                </div>

                <div className="space-y-8 max-h-[50vh] overflow-y-auto pr-4 custom-scrollbar">
                    {comments.length > 0 ? comments.map((c) => (
                        <div key={c.id} className="flex gap-6 group/comment">
                            {c.profiles?.avatar_url ? (
                                <Image src={c.profiles.avatar_url} alt="avatar" width={48} height={48} className="w-12 h-12 rounded-2xl object-cover" />
                            ) : (
                                <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center font-black text-zinc-400">{c.profiles?.nickname?.[0] || '?'}</div>
                            )}
                            <div className="flex-1">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-black text-zinc-900 dark:text-zinc-100">{c.profiles?.nickname || '익명'}</span>
                                    <div className="flex items-center gap-4">
                                        <span className="text-xs font-bold text-zinc-400">{new Date(c.created_at).toLocaleDateString()}</span>
                                        {user?.id === c.user_id && (
                                            <button onClick={() => handleDeleteComment(c.id)} className="text-red-400 opacity-0 group-hover/comment:opacity-100 transition-opacity"><Trash2 size={14}/></button>
                                        )}
                                    </div>
                                </div>
                                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">{c.comment}</p>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-20 text-zinc-400 font-medium">아직 작성된 댓글이 없습니다. 첫 번째 댓글을 남겨보세요!</div>
                    )}
                </div>
            </section>

            {/* 추천 챌린지 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {related.authorOther.length > 0 && (
                    <section>
                        <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-8 ml-4 flex items-center gap-2"><Star size={12} className="text-yellow-400 fill-yellow-400" /> 이 작가의 다른 명문</h4>
                        <div className="space-y-4">
                            {related.authorOther.map(post => (
                                <Link key={post.id} href={`/challenge/${post.id}`} className="block p-8 bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 hover:border-blue-500 transition-all group shadow-sm">
                                    <h5 className="font-black text-lg mb-3 group-hover:text-blue-600 line-clamp-1">{post.title}</h5>
                                    <div className="flex items-center gap-4 text-[10px] font-black text-zinc-400">
                                        <span className="flex items-center gap-1.5"><Zap size={12} fill="currentColor" /> {post.complete_count}회 완료</span>
                                        <span className="flex items-center gap-1.5"><Heart size={12} fill="currentColor" /> {post.like_count}</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}
                <section>
                    <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-8 ml-4 flex items-center gap-2"><Flame size={12} className="text-orange-500 fill-orange-500" /> 지금 가장 핫한 글</h4>
                    <div className="space-y-4">
                        {related.popular.map(post => (
                            <Link key={post.id} href={`/challenge/${post.id}`} className="block p-8 bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 hover:border-blue-500 transition-all group shadow-sm">
                                <h5 className="font-black text-lg mb-3 group-hover:text-blue-600 line-clamp-1">{post.title}</h5>
                                <div className="flex items-center justify-between">
                                    <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg text-[9px] uppercase font-black">{post.category}</span>
                                    <span className="text-[10px] font-black text-zinc-400 flex items-center gap-1.5"><Zap size={12} fill="currentColor" /> {post.complete_count}명이 도전함</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            </div>
        </div>
      )}
    </div>
  );
};

function MetricItem({ icon, label, value, unit, color }: { icon: any, label: string, value: number, unit?: string, color: string }) {
    return (
        <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm transition-all hover:scale-105">
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
        <button onClick={onClick} className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${active ? 'bg-blue-600 text-white shadow-md' : 'text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>
            {label}
        </button>
    );
}

function PenTool(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 19l7-7 3 3-7 7-3-3z" /><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" /><path d="M2 2l7.586 7.586" /><circle cx="11" cy="11" r="2" />
    </svg>
  );
}
