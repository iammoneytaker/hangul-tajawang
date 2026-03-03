"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Plus, MessageSquare, Heart, Share2, Loader2, Send, X, Play, Filter, MoreVertical, Trash2, Edit3, ShieldAlert, ArrowRight, User } from "lucide-react";
import { SupabaseService, supabase } from "@/lib/supabase";

const CATEGORIES = ["전체", "시", "명언", "소설", "수필", "UGC"];

export const OpenChallenge: React.FC<{ onStartChallenge: (content: any) => void }> = ({ onStartChallenge }) => {
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  
  // UI State
  const [isWriting, setIsWriting] = useState(false);
  const [editingContentId, setEditingContentId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("전체");
  
  // Author Profile State
  const [selectedAuthorProfile, setSelectedAuthorProfile] = useState<any>(null);
  const [authorContents, setAuthorContents] = useState<any[]>([]);
  const [authorLoading, setAuthorLoading] = useState(false);

  // Form State
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState("UGC");
  
  // Comment State
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);

  useEffect(() => {
    fetchData();
    SupabaseService.getCurrentUser().then(setUser);
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });
    return () => subscription.unsubscribe();
  }, [activeCategory]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await SupabaseService.getContents(activeCategory === '전체' ? undefined : activeCategory, '최신순');
      setChallenges(data);
    } catch (error) {
      console.error("Error fetching challenges:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAuthorProfile = async (authorId: string) => {
    setAuthorLoading(true);
    try {
      const [profile, contents] = await Promise.all([
        SupabaseService.getAuthorProfile(authorId),
        SupabaseService.getAuthorContents(authorId)
      ]);
      setSelectedAuthorProfile(profile);
      setAuthorContents(contents);
    } catch (error) {
      console.error("Error fetching author data:", error);
    } finally {
      setAuthorLoading(false);
    }
  };

  const fetchComments = async (contentId: string) => {
    setCommentLoading(true);
    try {
      const { data, error } = await supabase
        .from('typing_comments')
        .select('*, profiles(nickname, avatar_url)')
        .eq('content_id', contentId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setCommentLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!user) return alert("로그인 후 이용 가능합니다.");
    if (!newComment.trim()) return;

    try {
      await SupabaseService.addComment(selectedContent.id, newComment.trim(), selectedContent.author_id);
      setNewComment("");
      fetchComments(selectedContent.id);
      fetchData(); 
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("댓글을 삭제하시겠습니까?")) return;
    try {
      await SupabaseService.deleteComment(commentId);
      fetchComments(selectedContent.id);
      fetchData();
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const handleLike = async (contentId: string, item: any) => {
    if (!user) return alert("로그인 후 이용 가능합니다.");
    try {
      const { data: existingLike } = await supabase
        .from('likes')
        .select()
        .match({ user_id: user.id, content_id: contentId })
        .maybeSingle();

      await SupabaseService.toggleLike(contentId, !!existingLike, item.author_id);
      await fetchData();
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleCreateOrUpdate = async () => {
    if (!user) return alert("로그인이 필요합니다.");
    if (!newTitle.trim() || !newContent.trim()) return alert("제목과 내용을 입력해주세요.");
    
    try {
      setLoading(true);
      if (editingContentId) {
        await SupabaseService.updateContent(editingContentId, newTitle, newContent, newCategory);
      } else {
        await SupabaseService.createContent(newTitle, newContent, newCategory);
      }
      setIsWriting(false);
      setEditingContentId(null);
      setNewTitle("");
      setNewContent("");
      await fetchData();
    } catch (error) {
      alert("처리 실패: " + (error as any).message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditInit = (item: any) => {
    setEditingContentId(item.id);
    setNewTitle(item.title);
    setNewContent(item.content);
    setNewCategory(item.category || "UGC");
    setIsWriting(true);
  };

  const handleDeleteContent = async (contentId: string) => {
    if (!confirm("정말로 이 글을 삭제하시겠습니까? 관련 기록들이 모두 삭제됩니다.")) return;
    try {
      await SupabaseService.deleteContent(contentId);
      await fetchData();
    } catch (error) {
      console.error("Error deleting content:", error);
    }
  };

  const handleReport = async (contentId: string) => {
    if (!confirm("부적절한 게시글로 신고하시겠습니까?")) return;
    try {
      await SupabaseService.reportContent(contentId);
      alert("신고가 접수되었습니다.");
      await fetchData();
    } catch (error) {
      console.error("Error reporting:", error);
    }
  };

  if (isWriting) {
    return (
      <div className="w-full max-w-4xl mx-auto py-8 px-4 animate-in slide-in-from-bottom duration-500">
        <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800">
          <h2 className="text-2xl font-black mb-8">{editingContentId ? "챌린지 수정하기" : "새로운 챌린지 만들기"}</h2>
          
          <div className="space-y-6">
            <div>
                <label className="block text-xs font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">카테고리</label>
                <div className="flex flex-wrap gap-2">
                    {CATEGORIES.slice(1).map(cat => (
                        <button 
                            key={cat}
                            onClick={() => setNewCategory(cat)}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${newCategory === cat ? 'bg-blue-600 text-white shadow-lg' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-xs font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">제목</label>
                <input 
                    type="text" 
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="글의 제목을 입력하세요" 
                    className="w-full p-4 text-lg border border-zinc-200 dark:border-zinc-700 rounded-2xl bg-transparent outline-hidden focus:border-blue-500 font-bold"
                />
            </div>

            <div>
                <label className="block text-xs font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">내용</label>
                <textarea 
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    placeholder="타자 연습으로 함께 치고 싶은 내용을 입력하세요..." 
                    rows={8}
                    className="w-full p-4 text-lg border border-zinc-200 dark:border-zinc-700 rounded-2xl bg-transparent outline-hidden focus:border-blue-500 resize-none font-serif leading-relaxed"
                />
            </div>
          </div>

          <div className="flex gap-4 justify-end mt-10">
            <button onClick={() => { setIsWriting(false); setEditingContentId(null); }} className="px-8 py-4 font-bold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-2xl transition-colors">취소</button>
            <button onClick={handleCreateOrUpdate} disabled={loading} className="px-10 py-4 font-black bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-xl transition-all disabled:opacity-50">
                {loading ? <Loader2 className="animate-spin" /> : (editingContentId ? "수정 완료" : "등록하기")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-4 relative min-h-[80vh]">
      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-10 overflow-x-auto pb-2 no-scrollbar">
        <div className="flex items-center gap-2 mr-4 text-zinc-400 font-bold">
            <Filter size={18} /> <span className="text-sm">분류</span>
        </div>
        {CATEGORIES.map(cat => (
            <button 
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2.5 rounded-full text-sm font-black whitespace-nowrap transition-all ${
                    activeCategory === cat 
                    ? 'bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 shadow-md' 
                    : 'bg-white dark:bg-zinc-900 text-zinc-500 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400'
                }`}
            >
                {cat}
            </button>
        ))}
      </div>

      {/* Challenge Cards */}
      {loading ? (
        <div className="flex justify-center py-32"><Loader2 className="w-12 h-12 animate-spin text-blue-600" /></div>
      ) : challenges.length === 0 ? (
        <div className="text-center py-32 bg-white dark:bg-zinc-900 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800">
          <p className="text-zinc-400 font-medium">이 카테고리에는 아직 등록된 글이 없습니다. <br/>첫 번째 주인공이 되어보세요!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {challenges.map((item) => {
            const isMyPost = user?.id === item.author_id;
            return (
              <div key={item.id} className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-100 dark:border-zinc-800 hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between border-b-4 hover:border-b-blue-500 active:scale-[0.98]">
                <div>
                  <div className="flex justify-between items-start mb-6">
                      <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] font-black rounded-lg uppercase">{item.category}</span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleOpenAuthorProfile(item.author_id); }}
                        className="flex items-center gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 p-1 pr-3 rounded-full transition-all"
                      >
                          <div className="text-right hidden sm:block">
                              <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 leading-none">{item.profiles?.nickname || '익명'}</p>
                              <p className="text-[10px] text-zinc-400 mt-1">{new Date(item.created_at).toLocaleDateString()}</p>
                          </div>
                          {item.profiles?.avatar_url ? (
                            <Image 
                                src={item.profiles.avatar_url} 
                                alt="avatar" 
                                width={32} 
                                height={32} 
                                className="w-8 h-8 rounded-full object-cover aspect-square border border-zinc-100 dark:border-zinc-800 shadow-sm" 
                            />
                          ) : (
                            <div className="w-8 h-8 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-xs font-bold text-zinc-400 border border-zinc-100 dark:border-zinc-800 aspect-square">
                                {item.profiles?.nickname?.[0] || '?'}
                            </div>
                          )}
                      </button>
                  </div>
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-black mb-3 group-hover:text-blue-600 transition-colors line-clamp-1 flex-1">{item.title}</h3>
                    {isMyPost && (
                      <div className="flex gap-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => { e.stopPropagation(); handleEditInit(item); }} className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 rounded-lg"><Edit3 size={16}/></button>
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteContent(item.id); }} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 rounded-lg"><Trash2 size={16}/></button>
                      </div>
                    )}
                  </div>
                  <p className="text-zinc-500 dark:text-zinc-400 line-clamp-3 mb-8 font-serif leading-relaxed italic">"{item.content}"</p>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-zinc-50 dark:border-zinc-800">
                  <div className="flex gap-4">
                      <button 
                          onClick={(e) => { e.stopPropagation(); handleLike(item.id, item); }}
                          className="flex items-center gap-1.5 text-zinc-400 hover:text-red-500 transition-colors"
                      >
                          <Heart size={18} className={item.like_count > 0 ? "fill-red-500 text-red-500" : ""} />
                          <span className="text-xs font-black">{item.like_count || 0}</span>
                      </button>
                      <button 
                          onClick={(e) => { e.stopPropagation(); setSelectedContent(item); fetchComments(item.id); }}
                          className="flex items-center gap-1.5 text-zinc-400 hover:text-blue-500 transition-colors"
                      >
                          <MessageSquare size={18} />
                          <span className="text-xs font-black">{item.comment_count || 0}</span>
                      </button>
                  </div>
                  <div className="flex items-center gap-3">
                    {!isMyPost && (
                      <button onClick={(e) => { e.stopPropagation(); handleReport(item.id); }} className="p-2 text-zinc-300 hover:text-zinc-500" title="신고하기"><ShieldAlert size={16}/></button>
                    )}
                    <button 
                        onClick={() => onStartChallenge(item)}
                        className="flex items-center gap-2 px-5 py-2 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 rounded-xl text-xs font-black hover:scale-105 transition-all shadow-lg shadow-zinc-200 dark:shadow-none"
                    >
                        <Play size={14} fill="currentColor" /> 도전하기
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Author Profile Sidebar (작가 정보 및 작성글) */}
      {selectedAuthorProfile && (
        <div className="fixed inset-0 z-[110] flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setSelectedAuthorProfile(null)} />
          <div className="relative w-full max-w-lg bg-zinc-50 dark:bg-zinc-900 h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
            <div className="p-8 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                <div className="flex justify-between items-start mb-8">
                    <div className="flex items-center gap-6">
                        {selectedAuthorProfile.avatar_url ? (
                            <Image src={selectedAuthorProfile.avatar_url} alt="author" width={80} height={80} className="w-20 h-20 rounded-3xl object-cover border-4 border-zinc-50 dark:border-zinc-800 shadow-xl" />
                        ) : (
                            <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-3xl flex items-center justify-center border-4 border-white dark:border-zinc-800 shadow-xl">
                                <User size={40} className="text-blue-200" />
                            </div>
                        )}
                        <div>
                            <p className="text-blue-600 font-black text-[10px] uppercase tracking-widest mb-1">Author Profile</p>
                            <h3 className="text-3xl font-black">{selectedAuthorProfile.nickname || '익명 작가'}</h3>
                            <div className="flex gap-4 mt-2">
                                <span className="text-xs font-bold text-zinc-400">최고 타수: <span className="text-zinc-900 dark:text-white">{Math.round(selectedAuthorProfile.best_speed || 0)}타</span></span>
                                <span className="text-xs font-bold text-zinc-400">작성 글: <span className="text-zinc-900 dark:text-white">{authorContents.length}개</span></span>
                            </div>
                        </div>
                    </div>
                    <button onClick={() => setSelectedAuthorProfile(null)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"><X size={24}/></button>
                </div>
                <p className="text-sm text-zinc-500 font-medium leading-relaxed italic">"작가가 직접 등록한 다양한 챌린지 글들에 도전해보세요."</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-4 ml-2">작가의 다른 글 목록</h4>
                {authorContents.map((post) => (
                    <div key={post.id} className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:shadow-lg transition-all group">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] font-black text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded uppercase">{post.category}</span>
                            <span className="text-[10px] text-zinc-400 font-bold">{new Date(post.created_at).toLocaleDateString()}</span>
                        </div>
                        <h5 className="font-black text-lg mb-2 group-hover:text-blue-600 transition-colors">{post.title}</h5>
                        <p className="text-zinc-500 text-xs line-clamp-2 mb-6 font-serif italic">"{post.content}"</p>
                        <div className="flex items-center justify-between">
                            <div className="flex gap-3 text-zinc-400 text-[10px] font-black">
                                <span className="flex items-center gap-1"><Heart size={12} className={post.like_count > 0 ? "fill-red-500 text-red-500" : ""} /> {post.like_count || 0}</span>
                                <span className="flex items-center gap-1"><MessageSquare size={12} /> {post.comment_count || 0}</span>
                            </div>
                            <button 
                                onClick={() => { setSelectedAuthorProfile(null); onStartChallenge(post); }}
                                className="flex items-center gap-1.5 px-4 py-1.5 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 rounded-lg text-[10px] font-black hover:scale-105 transition-all"
                            >
                                <Play size={10} fill="currentColor" /> 도전하기
                            </button>
                        </div>
                    </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Comment Drawer */}
      {selectedContent && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedContent(null)} />
          <div className="relative w-full max-w-md bg-white dark:bg-zinc-950 h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-black">댓글</h3>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase mt-1 tracking-tighter">Community Feedback</p>
                </div>
                <button onClick={() => setSelectedContent(null)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"><X size={20}/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {commentLoading ? (
                    <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-600"/></div>
                ) : comments.length > 0 ? comments.map((c, i) => {
                    const isMyComment = user?.id === c.user_id;
                    return (
                      <div key={i} className="flex gap-4 animate-in fade-in duration-300 group/comment">
                          {c.profiles?.avatar_url ? (
                            <Image 
                                src={c.profiles.avatar_url} 
                                alt="avatar" 
                                width={40} 
                                height={40} 
                                className="w-10 h-10 rounded-xl object-cover aspect-square border border-zinc-100 dark:border-zinc-800 shadow-sm" 
                            />
                          ) : (
                            <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-xl flex-shrink-0 flex items-center justify-center font-bold text-zinc-400 aspect-square">
                                {c.profiles?.nickname?.[0] || '?'}
                            </div>
                          )}
                          <div className="flex-1">
                              <div className="flex justify-between items-center mb-1">
                                  <button 
                                    onClick={() => { setSelectedContent(null); handleOpenAuthorProfile(c.user_id); }}
                                    className="font-black text-sm hover:text-blue-600 transition-colors"
                                  >
                                    {c.profiles?.nickname || '익명'}
                                  </button>
                                  <div className="flex items-center gap-3">
                                    <span className="text-[10px] text-zinc-400 font-bold">{new Date(c.created_at).toLocaleDateString()}</span>
                                    {isMyComment && (
                                      <button onClick={() => handleDeleteComment(c.id)} className="text-red-400 opacity-0 group-hover/comment:opacity-100 transition-opacity"><Trash2 size={12}/></button>
                                    )}
                                  </div>
                              </div>
                              <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">{c.comment}</p>
                          </div>
                      </div>
                    );
                }) : (
                    <div className="text-center py-32 text-zinc-400">
                        <MessageSquare size={48} className="mx-auto mb-4 opacity-10" />
                        <p className="text-sm font-medium">아직 댓글이 없습니다. <br/>따뜻한 한마디를 남겨보세요!</p>
                    </div>
                )}
            </div>

            <div className="p-6 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                <div className="relative">
                    <input 
                        type="text" 
                        placeholder={user ? "따뜻한 댓글을 남겨주세요" : "로그인 후 댓글을 남길 수 있습니다"}
                        disabled={!user}
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                        className="w-full py-4 pl-5 pr-14 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl outline-hidden focus:border-blue-500 shadow-inner text-sm font-medium"
                    />
                    <button 
                        onClick={handleAddComment}
                        disabled={!user || !newComment.trim()}
                        className="absolute right-2 top-2 p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg"
                    >
                        <Send size={18}/>
                    </button>
                </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button 
        onClick={() => {
          if (!user) alert("로그인이 필요합니다.");
          else setIsWriting(true);
        }}
        className="fixed bottom-12 right-12 w-16 h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 z-50 group border-b-4 border-blue-800"
      >
        <Plus size={32} />
        <span className="absolute right-20 bg-zinc-900 text-white px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl">
          {user ? "새 글 쓰기" : "로그인하고 글쓰기"}
        </span>
      </button>
    </div>
  );
};
