"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { User, Keyboard, Trophy, Clock, Heart, BookOpen, Trash2, Edit3, Loader2, ChevronRight, Settings, MessageSquare, Play, X, Save } from "lucide-react";
import { SupabaseService, supabase } from "@/lib/supabase";

export const MyPage: React.FC<{ onStartChallenge: (content: any) => void }> = ({ onStartChallenge }) => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [results, setResults] = useState<any[]>([]);
  const [myContents, setMyContents] = useState<any[]>([]);
  const [likedContents, setLikedContents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveCategory] = useState<'records' | 'my-posts' | 'likes'>('records');

  // Edit State
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editCategory, setEditCategory] = useState("UGC");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const currentUser = await SupabaseService.getCurrentUser();
      if (!currentUser) return;
      setUser(currentUser);

      const [p, res, contents, likes] = await Promise.all([
        SupabaseService.getMyProfile(),
        SupabaseService.getMyResults(),
        SupabaseService.getMyContents(),
        SupabaseService.getLikedContents()
      ]);

      setProfile(p);
      setResults(res);
      setMyContents(contents);
      setLikedContents(likes);
    } catch (error) {
      console.error("Error fetching my page data:", error);
    } finally {
      setLoading(false);
    }
  };

  const resultsWithAttempt = useMemo(() => {
    const reversed = [...results].reverse();
    const titleCounts: Record<string, number> = {};
    const processed = reversed.map(r => {
      const title = r.typing_contents?.title || '연습 글';
      titleCounts[title] = (titleCounts[title] || 0) + 1;
      return { ...r, attempt: titleCounts[title] };
    });
    return processed.reverse();
  }, [results]);

  const handleDeletePost = async (id: string) => {
    if (!confirm("정말로 삭제하시겠습니까?")) return;
    try {
      await SupabaseService.deleteContent(id);
      fetchData();
    } catch (error) {
      alert("삭제 실패");
    }
  };

  const handleEditInit = (item: any) => {
    setEditingItem(item);
    setEditTitle(item.title);
    setEditContent(item.content);
    setEditCategory(item.category || "UGC");
  };

  const handleUpdate = async () => {
    if (!editTitle.trim() || !editContent.trim()) return alert("내용을 입력하세요.");
    try {
      setLoading(true);
      await SupabaseService.updateContent(editingItem.id, editTitle, editContent, editCategory);
      setEditingItem(null);
      await fetchData();
    } catch (error) {
      alert("수정 실패");
      setLoading(false);
    }
  };

  if (loading && !editingItem) return <div className="flex justify-center py-32"><Loader2 className="animate-spin w-12 h-12 text-blue-600" /></div>;
  if (!user) return <div className="text-center py-32 font-bold text-zinc-400">로그인이 필요한 서비스입니다.</div>;

  return (
    <div className="w-full max-w-5xl mx-auto py-12 px-4 animate-in fade-in duration-500">
      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 md:p-12 max-w-2xl w-full shadow-2xl border border-zinc-200 dark:border-zinc-800 animate-in zoom-in duration-300">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-black">챌린지 수정하기</h2>
                    <button onClick={() => setEditingItem(null)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full"><X size={24}/></button>
                </div>
                <div className="space-y-6">
                    <input 
                        type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)}
                        className="w-full p-4 text-lg border border-zinc-200 dark:border-zinc-700 rounded-2xl bg-transparent outline-hidden focus:border-blue-500 font-bold"
                        placeholder="제목"
                    />
                    <textarea 
                        value={editContent} onChange={e => setEditContent(e.target.value)}
                        className="w-full p-4 text-lg border border-zinc-200 dark:border-zinc-700 rounded-2xl bg-transparent outline-hidden focus:border-blue-500 h-64 resize-none font-serif"
                        placeholder="내용"
                    />
                    <div className="flex gap-4 justify-end">
                        <button onClick={() => setEditingItem(null)} className="px-8 py-4 font-bold text-zinc-500">취소</button>
                        <button onClick={handleUpdate} className="px-10 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl flex items-center gap-2">
                            <Save size={20} /> 수정 완료
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Profile Header */}
      <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-zinc-100 dark:border-zinc-800 mb-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 rotate-12">
            <Trophy size={160} className="text-blue-600" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="relative group">
                {profile?.avatar_url ? (
                    <Image 
                        src={profile.avatar_url} 
                        alt="프로필 아바타" 
                        width={128} 
                        height={128} 
                        className="w-32 h-32 rounded-[2rem] object-cover aspect-square shadow-2xl border-4 border-white dark:border-zinc-800" 
                    />
                ) : (

                    <div className="w-32 h-32 bg-blue-50 dark:bg-blue-900/20 rounded-[2rem] flex items-center justify-center border-4 border-white dark:border-zinc-800 shadow-2xl">
                        <User size={64} className="text-blue-200" />
                    </div>
                )}
            </div>

            <div className="flex-1 text-center md:text-left">
                <p className="text-blue-600 font-black text-xs uppercase tracking-widest mb-2">My Profile</p>
                <h2 className="text-4xl font-black mb-2">{profile?.nickname || '필사 작가'}</h2>
                <p className="text-zinc-400 text-sm font-medium">{user.email}</p>
                
                <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-8">
                    <StatBadge icon={<Keyboard size={14}/>} label="최고 타수" value={`${Math.round(profile?.best_speed || 0)}타`} color="text-blue-600" />
                    <StatBadge icon={<BookOpen size={14}/>} label="총 필사" value={`${results.length}회`} color="text-green-600" />
                    <StatBadge icon={<Heart size={14}/>} label="받은 좋아요" value={`${myContents.reduce((acc, curr) => acc + (curr.like_count || 0), 0)}개`} color="text-red-500" />
                </div>
            </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex justify-center md:justify-start gap-2 mb-8 bg-zinc-100 dark:bg-zinc-800 p-1.5 rounded-2xl w-fit shadow-inner">
        <TabBtn active={activeTab === 'records'} label="연습 기록" onClick={() => setActiveCategory('records')} />
        <TabBtn active={activeTab === 'my-posts'} label="나의 챌린지" onClick={() => setActiveCategory('my-posts')} />
        <TabBtn active={activeTab === 'likes'} label="좋아요 한 글" onClick={() => setActiveCategory('likes')} />
      </div>

      {/* Tab Content */}
      <div className="min-h-[40vh]">
        {activeTab === 'records' && (
            <div className="grid gap-4">
                {resultsWithAttempt.length > 0 ? resultsWithAttempt.map((r, i) => (
                    <div key={i} className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between group hover:shadow-md transition-all">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-tighter">{new Date(r.created_at).toLocaleString()}</p>
                                <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 text-[10px] font-black rounded-md">도전 {r.attempt}회차</span>
                            </div>
                            <h4 className="text-lg font-black group-hover:text-blue-600 transition-colors">{r.typing_contents?.title || '연습 글'}</h4>
                        </div>
                        <div className="flex gap-8 mt-4 md:mt-0">
                            <div className="text-center">
                                <p className="text-[10px] font-bold text-zinc-400 uppercase">Speed</p>
                                <p className="text-xl font-black text-blue-600">{Math.round(r.speed)}타</p>
                            </div>
                            <div className="text-center border-l border-zinc-50 dark:border-zinc-800 pl-8">
                                <p className="text-[10px] font-bold text-zinc-400 uppercase">Accuracy</p>
                                <p className="text-xl font-black text-green-600">{Math.round(r.accuracy)}%</p>
                            </div>
                        </div>
                    </div>
                )) : <EmptyState message="아직 연습 기록이 없습니다. 필사를 시작해보세요!" />}
            </div>
        )}

        {activeTab === 'my-posts' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {myContents.length > 0 ? myContents.map((item) => (
                    <div key={item.id} className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-100 dark:border-zinc-800 relative group">
                        <div className="flex justify-between items-start mb-4">
                            <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 text-[10px] font-black rounded-lg">{item.category}</span>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleEditInit(item)} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"><Edit3 size={16}/></button>
                                <button onClick={() => handleDeletePost(item.id)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"><Trash2 size={16}/></button>
                            </div>
                        </div>
                        <h3 className="text-xl font-black mb-2">{item.title}</h3>
                        <p className="text-zinc-500 text-sm line-clamp-2 mb-6 font-serif">"{item.content}"</p>
                        
                        <div className="flex items-center gap-6 pt-6 border-t border-zinc-50 dark:border-zinc-800">
                            <div className="flex items-center gap-1.5 text-zinc-400">
                                <Heart size={16} className="fill-red-500 text-red-500" />
                                <span className="text-xs font-black">{item.like_count || 0}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-zinc-400">
                                <MessageSquare size={16} />
                                <span className="text-xs font-black">{item.comment_count || 0}</span>
                            </div>
                            <div className="ml-auto">
                                <button onClick={() => onStartChallenge(item)} className="p-2 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 rounded-xl hover:scale-110 transition-transform shadow-lg">
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                )) : <EmptyState message="아직 등록한 챌린지가 없습니다." />}
            </div>
        )}

        {activeTab === 'likes' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {likedContents.length > 0 ? likedContents.map((item) => (
                    <div key={item.id} className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-100 dark:border-zinc-800 relative group">
                        <div className="flex justify-between items-start mb-4">
                            <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-[10px] font-black rounded-lg">{item.category}</span>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-zinc-400">by {item.profiles?.nickname}</span>
                            </div>
                        </div>
                        <h3 className="text-xl font-black mb-2">{item.title}</h3>
                        <p className="text-zinc-500 text-sm line-clamp-2 mb-6 font-serif italic">"{item.content}"</p>
                        <div className="flex justify-end">
                            <button onClick={() => onStartChallenge(item)} className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-xl text-xs font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
                                <Play size={12} fill="currentColor" /> 도전하기
                            </button>
                        </div>
                    </div>
                )) : <EmptyState message="좋아요 한 글이 없습니다." />}
            </div>
        )}
      </div>
    </div>
  );
};

function StatBadge({ icon, label, value, color }: { icon: any, label: string, value: string, color: string }) {
    return (
        <div className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3 rounded-2xl border border-zinc-100 dark:border-zinc-800 transition-all hover:border-blue-200">
            <div className={`p-2 rounded-xl bg-white dark:bg-zinc-900 shadow-sm ${color}`}>{icon}</div>
            <div>
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-tighter leading-none mb-1">{label}</p>
                <p className={`text-sm font-black ${color}`}>{value}</p>
            </div>
        </div>
    );
}

function TabBtn({ active, label, onClick }: { active: boolean, label: string, onClick: () => void }) {
    return (
        <button onClick={onClick} className={`px-6 py-2 rounded-xl text-sm font-black transition-all ${active ? 'bg-white dark:bg-zinc-900 text-blue-600 shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`}>
            {label}
        </button>
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="text-center py-32 bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-dashed border-zinc-200 dark:border-zinc-800 shadow-inner">
            <p className="text-zinc-400 font-bold">{message}</p>
        </div>
    );
}
