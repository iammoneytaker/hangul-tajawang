"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, MessageSquare, Heart, Share2, Loader2, Send, X, Play, Filter, MoreVertical, Trash2, Edit3, ShieldAlert, ArrowRight, User, SortDesc, Zap } from "lucide-react";
import { SupabaseService, supabase, SortType } from "@/lib/supabase";
import { useSearchParams } from "next/navigation";

// 검색 파라미터를 사용하는 부분을 별도 컴포넌트로 분리 (Next.js Suspense 요구사항 대응)
const ChallengeList = () => {
  const searchParams = useSearchParams();
  const filterAuthorId = searchParams.get("authorId");

  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [myLikes, setMyLikes] = useState<string[]>([]);
  
  const [isWriting, setIsWriting] = useState(false);
  const [editingContentId, setEditingContentId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("전체");
  const [activeSort, setActiveSort] = useState<SortType>("최신순");
  
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);

  const [selectedAuthorProfile, setSelectedAuthorProfile] = useState<any>(null);
  const [authorContents, setAuthorContents] = useState<any[]>([]);

  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState("UGC");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [data, currentUser] = await Promise.all([
        SupabaseService.getContents(
            activeCategory === '전체' ? undefined : activeCategory, 
            activeSort, 
            filterAuthorId || undefined
        ),
        SupabaseService.getCurrentUser()
      ]);
      setChallenges(data);
      setUser(currentUser);

      if (currentUser) {
        const { data: likes } = await supabase.from('likes').select('content_id').eq('user_id', currentUser.id);
        setMyLikes(likes?.map(l => l.content_id) || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [activeCategory, activeSort, filterAuthorId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleLike = async (item: any) => {
    if (!user) return alert("로그인 후 이용 가능합니다.");
    const isLiked = myLikes.includes(item.id);
    try {
      await SupabaseService.toggleLike(item.id, isLiked, item.author_id);
      setMyLikes(prev => isLiked ? prev.filter(id => id !== item.id) : [...prev, item.id]);
      setChallenges(prev => prev.map(c => c.id === item.id ? { ...c, like_count: (c.like_count || 0) + (isLiked ? -1 : 1) } : c));
    } catch (error) { alert("좋아요 처리에 실패했습니다."); }
  };

  const handleOpenComments = async (item: any) => {
    setSelectedContent(item);
    setCommentLoading(true);
    try {
      const { data } = await supabase.from('typing_comments').select('*, profiles(nickname, avatar_url)').eq('content_id', item.id).order('created_at', { ascending: false });
      setComments(data || []);
    } finally { setCommentLoading(false); }
  };

  const handleAddComment = async () => {
    if (!user || !newComment.trim()) return;
    try {
      await SupabaseService.addComment(selectedContent.id, newComment.trim(), selectedContent.author_id);
      setNewComment("");
      handleOpenComments(selectedContent);
      setChallenges(prev => prev.map(c => c.id === selectedContent.id ? { ...c, comment_count: (c.comment_count || 0) + 1 } : c));
    } catch (e) { alert("댓글 작성 실패"); }
  };

  const handleOpenAuthor = async (authorId: string) => {
    const [profile, contents] = await Promise.all([ SupabaseService.getAuthorProfile(authorId), SupabaseService.getAuthorContents(authorId) ]);
    setSelectedAuthorProfile(profile);
    setAuthorContents(contents);
  };

  if (isWriting) {
    return (
      <div className="w-full max-w-4xl mx-auto py-8 px-4 animate-in slide-in-from-bottom duration-500">
        <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800">
          <h2 className="text-2xl font-black mb-8">{editingContentId ? "챌린지 수정하기" : "새로운 챌린지 만들기"}</h2>
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
                {["시", "명언", "소설", "수필", "UGC"].map(cat => (
                    <button key={cat} onClick={() => setNewCategory(cat)} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${newCategory === cat ? 'bg-blue-600 text-white shadow-lg' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}>{cat}</button>
                ))}
            </div>
            <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="제목" className="w-full p-4 text-lg border border-zinc-200 dark:border-zinc-700 rounded-2xl bg-transparent outline-hidden focus:border-blue-500 font-bold text-zinc-900 dark:text-zinc-100" />
            <textarea value={newContent} onChange={(e) => setNewContent(e.target.value)} placeholder="내용" rows={8} className="w-full p-4 text-lg border border-zinc-200 dark:border-zinc-700 rounded-2xl bg-transparent outline-hidden focus:border-blue-500 resize-none font-serif text-zinc-900 dark:text-zinc-100" />
          </div>
          <div className="flex gap-4 justify-end mt-10">
            <button onClick={() => setIsWriting(false)} className="px-8 py-4 font-bold text-zinc-500">취소</button>
            <button onClick={async () => {
                setLoading(true);
                if (editingContentId) await SupabaseService.updateContent({ contentId: editingContentId, title: newTitle, content: newContent, category: newCategory });
                else await SupabaseService.createContent({ title: newTitle, content: newContent, category: newCategory });
                setIsWriting(false); setEditingContentId(null); setNewTitle(""); setNewContent(""); fetchData();
            }} disabled={loading} className="px-10 py-4 font-black bg-blue-600 text-white rounded-2xl shadow-xl">{loading ? <Loader2 className="animate-spin" /> : "등록하기"}</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-4 relative min-h-[80vh]">
      {/* 상단 타이틀 (필터 시 노출) */}
      {filterAuthorId && challenges.length > 0 && (
        <div className="mb-10 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-[2rem] border border-blue-100 dark:border-blue-900/30 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm"><User size={24}/></div>
                <div>
                    <h2 className="text-xl font-black">{challenges[0].profiles?.nickname} 작가의 글 모음</h2>
                    <p className="text-xs text-zinc-500 font-medium">작가가 직접 창작하고 공유한 소중한 글들입니다.</p>
                </div>
            </div>
            <Link href="/challenge" className="px-4 py-2 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-xl text-xs font-black shadow-sm hover:bg-zinc-50 transition-all">전체 목록 보기</Link>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            <div className="flex items-center gap-2 mr-2 text-zinc-400 font-bold shrink-0"><Filter size={18} /> <span className="text-sm">분류</span></div>
            {["전체", "시", "명언", "소설", "수필", "UGC"].map(cat => (
                <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-5 py-2 rounded-full text-xs font-black whitespace-nowrap transition-all ${activeCategory === cat ? 'bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 shadow-md' : 'bg-white dark:bg-zinc-900 text-zinc-500 border border-zinc-200 dark:border-zinc-800'}`}>{cat}</button>
            ))}
          </div>
          <div className="flex items-center gap-2 self-end md:self-auto">
              <div className="flex bg-white dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800">
                  {["최신순", "인기순", "도전순", "댓글순"].map(opt => (
                      <button key={opt} onClick={() => setActiveSort(opt as SortType)} className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${activeSort === opt ? 'bg-blue-600 text-white shadow-lg' : 'text-zinc-400'}`}>{opt}</button>
                  ))}
              </div>
          </div>
      </div>

      {loading && challenges.length === 0 ? (
        <div className="flex justify-center py-32"><Loader2 className="w-12 h-12 animate-spin text-blue-600" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {challenges.map((item) => {
            const isLiked = myLikes.includes(item.id);
            return (
              <div key={item.id} className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-100 dark:border-zinc-800 hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between border-b-4 hover:border-b-blue-500">
                <Link href={`/challenge/${item.id}`} className="block">
                  <div className="flex justify-between items-start mb-6">
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] font-black rounded-lg uppercase">{item.category}</span>
                        <div className="px-3 py-1 bg-zinc-50 dark:bg-zinc-800 text-zinc-400 text-[10px] font-black rounded-lg flex items-center gap-1.5"><Zap size={10} className="fill-zinc-400" /> {item.complete_count || 0}회 완료</div>
                      </div>
                      <div onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleOpenAuthor(item.author_id); }} className="flex items-center gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 p-1 pr-3 rounded-full transition-all">
                          <div className="text-right hidden sm:block"><p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 leading-none">{item.profiles?.nickname || '익명'}</p></div>
                          {item.profiles?.avatar_url ? <Image src={item.profiles.avatar_url} alt="avatar" width={32} height={32} className="w-8 h-8 rounded-full object-cover aspect-square" /> : <div className="w-8 h-8 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-[10px] font-bold text-zinc-400 aspect-square">{item.profiles?.nickname?.[0] || '?'}</div>}
                      </div>
                  </div>
                  <h3 className="text-xl font-black mb-3 group-hover:text-blue-600 transition-colors line-clamp-1 text-zinc-900 dark:text-zinc-100">{item.title}</h3>
                  <p className="text-zinc-500 dark:text-zinc-400 line-clamp-3 mb-8 font-serif italic leading-relaxed">"{item.content}"</p>
                </Link>

                <div className="flex items-center justify-between pt-6 border-t border-zinc-50 dark:border-zinc-800">
                  <div className="flex gap-4">
                      <button onClick={(e) => { e.stopPropagation(); handleLike(item); }} className={`flex items-center gap-1.5 transition-colors ${isLiked ? 'text-red-500' : 'text-zinc-400 hover:text-red-500'}`}>
                          <Heart size={18} className={isLiked ? "fill-red-500" : ""} />
                          <span className="text-xs font-black">{item.like_count || 0}</span>
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleOpenComments(item); }} className="flex items-center gap-1.5 text-zinc-400 hover:text-blue-500 transition-colors">
                          <MessageSquare size={18} />
                          <span className="text-xs font-black">{item.comment_count || 0}</span>
                      </button>
                  </div>
                  <Link href={`/challenge/${item.id}`} className="flex items-center gap-2 px-5 py-2 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 rounded-xl text-xs font-black hover:scale-105 transition-all shadow-lg">
                      <Play size={14} fill="currentColor" /> 도전하기
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 작가 프로필 사이드바 */}
      {selectedAuthorProfile && (
        <div className="fixed inset-0 z-[10000] flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setSelectedAuthorProfile(null)} />
          <div className="relative w-full max-w-lg bg-white dark:bg-zinc-950 h-full shadow-2xl flex flex-col animate-in slide-in-from-right">
            <div className="p-8 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex justify-between items-start">
                <div className="flex items-center gap-6">
                    {selectedAuthorProfile.avatar_url ? <Image src={selectedAuthorProfile.avatar_url} alt="author" width={80} height={80} className="w-20 h-20 rounded-3xl object-cover aspect-square" /> : <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-3xl flex items-center justify-center aspect-square"><User size={40} className="text-blue-200" /></div>}
                    <div>
                        <h3 className="text-3xl font-black text-zinc-900 dark:text-zinc-100">{selectedAuthorProfile.nickname || '익명 작가'}</h3>
                        <p className="text-xs font-bold text-zinc-400 mt-2">최고 타수: <span className="text-zinc-900 dark:text-white">{Math.round(selectedAuthorProfile.best_speed || 0)}타</span></p>
                    </div>
                </div>
                <button onClick={() => setSelectedAuthorProfile(null)} className="text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"><X size={24}/></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div className="flex items-center justify-between mb-4">
                    <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-2">작가의 다른 글</h4>
                    <Link href={`/challenge?authorId=${selectedAuthorProfile.id}`} onClick={() => setSelectedAuthorProfile(null)} className="text-[10px] font-black text-blue-600 hover:underline">전체보기</Link>
                </div>
                {authorContents.map((post) => (
                    <Link key={post.id} href={`/challenge/${post.id}`} onClick={() => setSelectedAuthorProfile(null)} className="block bg-zinc-50 dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 hover:border-blue-500 transition-all group">
                        <h5 className="font-black text-lg mb-2 group-hover:text-blue-600 text-zinc-900 dark:text-zinc-100">{post.title}</h5>
                        <div className="flex items-center justify-between mt-6">
                            <div className="flex gap-3 text-zinc-400 text-[10px] font-black"><span><Zap size={12} fill="currentColor" className="inline mr-1" /> {post.complete_count || 0}</span><span><Heart size={12} className="inline mr-1" /> {post.like_count || 0}</span></div>
                            <div className="text-blue-600 font-black text-[10px]">도전하기 <ArrowRight size={10} className="inline ml-1" /></div>
                        </div>
                    </Link>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* 댓글 드로어 */}
      {selectedContent && (
        <div className="fixed inset-0 z-[10000] flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedContent(null)} />
          <div className="relative w-full max-w-md bg-white dark:bg-zinc-950 h-full shadow-2xl flex flex-col animate-in slide-in-from-right">
            <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-100">댓글 {comments.length}</h3>
                <button onClick={() => setSelectedContent(null)} className="text-zinc-400"><X size={20}/></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {commentLoading ? <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-600"/></div> : 
                 comments.length > 0 ? comments.map((c, i) => (
                    <div key={i} className="flex gap-4 group/comment">
                        {c.profiles?.avatar_url ? <Image src={c.profiles.avatar_url} alt="avatar" width={40} height={40} className="w-10 h-10 rounded-xl object-cover aspect-square" /> : <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-xl flex-shrink-0 flex items-center justify-center font-bold text-zinc-400 aspect-square">{c.profiles?.nickname?.[0] || '?'}</div>}
                        <div className="flex-1">
                            <div className="flex justify-between items-center mb-1"><span className="font-black text-sm text-zinc-900 dark:text-zinc-100">{c.profiles?.nickname || '익명'}</span><span className="text-[10px] text-zinc-400 font-bold">{new Date(c.created_at).toLocaleDateString()}</span></div>
                            <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">{c.comment}</p>
                        </div>
                    </div>
                )) : <div className="text-center py-32 text-zinc-400">아직 댓글이 없습니다.</div>}
            </div>
            <div className="p-6 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                <div className="relative">
                    <input type="text" placeholder={user ? "따뜻한 댓글을 남겨주세요" : "로그인 후 이용 가능"} disabled={!user} value={newComment} onChange={(e) => setNewComment(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddComment()} className="w-full py-4 pl-5 pr-14 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl outline-hidden focus:border-blue-500 text-sm text-zinc-900 dark:text-zinc-100" />
                    <button onClick={handleAddComment} disabled={!user || !newComment.trim()} className="absolute right-2 top-2 p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg"><Send size={18}/></button>
                </div>
            </div>
          </div>
        </div>
      )}

      <button onClick={() => { if (!user) alert("로그인이 필요합니다."); else setIsWriting(true); }} className="fixed bottom-12 right-12 w-16 h-16 bg-blue-600 text-white rounded-2xl shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 z-[5000] group border-b-4 border-blue-800">
        <Plus size={32} />
        <span className="absolute right-20 bg-zinc-900 text-white px-4 py-2 rounded-xl text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">새 글 쓰기</span>
      </button>
    </div>
  );
};

export const OpenChallenge = () => {
    return (
        <Suspense fallback={<div className="flex justify-center py-32"><Loader2 className="w-12 h-12 animate-spin text-blue-600" /></div>}>
            <ChallengeList />
        </Suspense>
    );
};
