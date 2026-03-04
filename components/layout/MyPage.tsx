"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { User, Keyboard, Trophy, Clock, Heart, BookOpen, Trash2, Edit3, Loader2, ChevronRight, Settings, MessageSquare, Play, X, Save, Sparkles, Zap, Target, Layout, Camera } from "lucide-react";
import { SupabaseService, supabase } from "@/lib/supabase";

export const MyPage: React.FC<{ onStartChallenge: (content: any) => void }> = ({ onStartChallenge }) => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [results, setResults] = useState<any[]>([]);
  const [myContents, setMyContents] = useState<any[]>([]);
  const [likedContents, setLikedContents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'records' | 'my-posts' | 'likes'>('records');

  // Edit Profile State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [newNickname, setNewNickname] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit Content State
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editCategory, setEditCategory] = useState("UGC");

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
      setNewNickname(p?.nickname || "");
      setResults(res);
      setMyContents(contents);
      setLikedContents(likes);
    } catch (error) {
      console.error("Error fetching my page data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 프로필 이미지 업로드
  const handleImageClick = () => fileInputRef.current?.click();
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await SupabaseService.uploadAvatar(file);
      await fetchData();
    } catch (error) {
      alert("이미지 업로드 실패");
    } finally {
      setUploading(false);
    }
  };

  // 닉네임 저장
  const handleSaveProfile = async () => {
    if (!newNickname.trim()) return;
    try {
      setLoading(true);
      await SupabaseService.updateProfile({ nickname: newNickname.trim() });
      setIsEditingProfile(false);
      await fetchData();
    } catch (error) {
      alert("닉네임 변경 실패");
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
    if (!confirm("정말로 삭제하시겠습니까? 관련 모든 기록이 함께 사라집니다.")) return;
    try {
      await SupabaseService.deleteContent(id);
      fetchData();
    } catch (error) {
      alert("삭제 실패");
    }
  };

  const handleUpdate = async () => {
    if (!editTitle.trim() || !editContent.trim()) return alert("내용을 입력하세요.");
    try {
      setLoading(true);
      await SupabaseService.updateContent({ contentId: editingItem.id, title: editTitle, content: editContent, category: editCategory });
      setEditingItem(null);
      await fetchData();
    } catch (error) {
      alert("수정 실패");
      setLoading(false);
    }
  };

  if (loading && !editingItem && !isEditingProfile) return <div className="flex justify-center py-32"><Loader2 className="animate-spin w-12 h-12 text-blue-600" /></div>;
  if (!user) return <div className="text-center py-32 font-bold text-zinc-400">로그인이 필요한 서비스입니다.</div>;

  return (
    <div className="w-full max-w-5xl mx-auto py-12 px-4 animate-in fade-in duration-500">
      {/* Edit Content Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-zinc-950/60 backdrop-blur-xl z-[150] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-zinc-900 rounded-[3rem] p-8 md:p-12 max-w-2xl w-full shadow-2xl border border-zinc-200 dark:border-zinc-800 animate-in zoom-in duration-300">
                <div className="flex justify-between items-center mb-10">
                    <h2 className="text-2xl font-black">챌린지 글 수정</h2>
                    <button onClick={() => setEditingItem(null)} className="p-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-2xl transition-all"><X size={24}/></button>
                </div>
                <div className="space-y-6">
                    <div className="flex flex-wrap gap-2 mb-4">
                        {["시", "명언", "소설", "수필", "UGC"].map(cat => (
                            <button key={cat} onClick={() => setEditCategory(cat)} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${editCategory === cat ? 'bg-blue-600 text-white shadow-lg' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}>{cat}</button>
                        ))}
                    </div>
                    <input 
                        type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)}
                        className="w-full p-5 text-xl border border-zinc-200 dark:border-zinc-700 rounded-3xl bg-transparent outline-hidden focus:border-blue-500 font-black text-zinc-900 dark:text-zinc-100"
                        placeholder="제목"
                    />
                    <textarea 
                        value={editContent} onChange={e => setEditContent(e.target.value)}
                        className="w-full p-6 text-lg border border-zinc-200 dark:border-zinc-700 rounded-3xl bg-transparent outline-hidden focus:border-blue-500 h-80 resize-none font-serif leading-relaxed text-zinc-900 dark:text-zinc-100"
                        placeholder="내용"
                    />
                    <div className="flex gap-4 justify-end pt-4">
                        <button onClick={() => setEditingItem(null)} className="px-8 py-4 font-bold text-zinc-500">취소</button>
                        <button onClick={handleUpdate} className="px-10 py-4 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 font-black rounded-2xl shadow-xl flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition-all">
                            <Save size={20} /> 저장하기
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Profile Dashboard */}
      <div className="bg-white dark:bg-zinc-900 rounded-[3rem] p-10 md:p-16 shadow-2xl border border-zinc-100 dark:border-zinc-800 mb-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 rotate-12 scale-150 pointer-events-none">
            <Trophy size={200} className="text-blue-600" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
            <div className="relative group cursor-pointer" onClick={handleImageClick}>
                {profile?.avatar_url ? (
                    <Image 
                        src={profile.avatar_url} 
                        alt="프로필" 
                        width={160} 
                        height={160} 
                        className="w-40 h-40 rounded-[3rem] object-cover aspect-square shadow-2xl border-8 border-zinc-50 dark:border-zinc-800 transition-all group-hover:brightness-75 duration-500" 
                    />
                ) : (
                    <div className="w-40 h-40 bg-blue-50 dark:bg-blue-900/20 rounded-[3rem] flex items-center justify-center border-8 border-zinc-50 dark:border-zinc-800 shadow-2xl group-hover:bg-blue-100 transition-colors">
                        <User size={80} className="text-blue-200" />
                    </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera size={32} className="text-white drop-shadow-lg" />
                </div>
                {uploading && (
                    <div className="absolute inset-0 bg-black/40 rounded-[3rem] flex items-center justify-center">
                        <Loader2 className="animate-spin text-white" />
                    </div>
                )}
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
            </div>

            <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
                    {isEditingProfile ? (
                        <div className="flex items-center gap-2">
                            <input 
                                type="text" 
                                value={newNickname} 
                                onChange={e => setNewNickname(e.target.value)}
                                className="px-4 py-2 text-2xl font-black bg-zinc-50 dark:bg-zinc-800 border-2 border-blue-500 rounded-xl outline-hidden text-zinc-900 dark:text-zinc-100"
                                autoFocus
                            />
                            <button onClick={handleSaveProfile} className="p-2 bg-blue-600 text-white rounded-xl shadow-lg"><Save size={20} /></button>
                            <button onClick={() => { setIsEditingProfile(false); setNewNickname(profile?.nickname || ""); }} className="p-2 bg-zinc-200 dark:bg-zinc-700 text-zinc-500 rounded-xl"><X size={20} /></button>
                        </div>
                    ) : (
                        <>
                            <h2 className="text-5xl font-black text-zinc-900 dark:text-zinc-100">{profile?.nickname || '필사 작가'}</h2>
                            <button onClick={() => setIsEditingProfile(true)} className="p-2 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"><Edit3 size={20} /></button>
                        </>
                    )}
                </div>
                <p className="text-zinc-400 font-bold mb-10">{user.email}</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <StatBox icon={<Zap size={18}/>} label="최고 타수" value={`${Math.round(profile?.best_speed || 0)}타`} color="text-blue-600" bg="bg-blue-50/50 dark:bg-blue-900/10" />
                    <StatBox icon={<BookOpen size={18}/>} label="필사 완료" value={`${results.length}회`} color="text-green-600" bg="bg-green-50/50 dark:bg-green-900/10" />
                    <StatBox icon={<Heart size={18}/>} label="받은 좋아요" value={`${myContents.reduce((acc, curr) => acc + (curr.like_count || 0), 0)}개`} color="text-red-500" bg="bg-red-50/50 dark:bg-red-900/10" />
                </div>
            </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex justify-center md:justify-start gap-3 mb-10 bg-zinc-100 dark:bg-zinc-800 p-2 rounded-[2rem] w-fit shadow-inner mx-auto md:mx-0">
        <TabBtn active={activeTab === 'records'} label="연습 기록" icon={<Clock size={16}/>} onClick={() => setActiveTab('records')} />
        <TabBtn active={activeTab === 'my-posts'} label="나의 챌린지" icon={<Layout size={16}/>} onClick={() => setActiveTab('my-posts')} />
        <TabBtn active={activeTab === 'likes'} label="좋아요 한 글" icon={<Heart size={16}/>} onClick={() => setActiveTab('likes')} />
      </div>

      {/* Tab Content Area */}
      <div className="min-h-[50vh] animate-in slide-in-from-bottom-4 duration-700">
        {activeTab === 'records' && (
            <div className="space-y-4">
                {resultsWithAttempt.length > 0 ? resultsWithAttempt.map((r, i) => (
                    <div key={i} className="bg-white dark:bg-zinc-900 p-8 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between group hover:shadow-xl transition-all hover:-translate-y-1">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{new Date(r.created_at).toLocaleString()}</span>
                                <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-[10px] font-black rounded-lg"># {r.attempt}회차 도전</span>
                            </div>
                            <h4 className="text-2xl font-black group-hover:text-blue-600 transition-colors">{r.typing_contents?.title || '연습 글'}</h4>
                        </div>
                        <div className="flex gap-12 mt-6 md:mt-0">
                            <div className="text-center">
                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Speed</p>
                                <p className="text-3xl font-black text-blue-600">{Math.round(r.speed)}<span className="text-sm ml-1">타</span></p>
                            </div>
                            <div className="text-center border-l border-zinc-50 dark:border-zinc-800 pl-12">
                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Accuracy</p>
                                <p className="text-3xl font-black text-green-600">{Math.round(r.accuracy)}<span className="text-sm ml-1">%</span></p>
                            </div>
                        </div>
                    </div>
                )) : <EmptyState message="아직 연습 기록이 없네요. 감성적인 글들을 필사해보세요!" />}
            </div>
        )}

        {activeTab === 'my-posts' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {myContents.length > 0 ? myContents.map((item) => (
                    <div key={item.id} className="bg-white dark:bg-zinc-900 p-10 rounded-[3rem] border border-zinc-100 dark:border-zinc-800 relative group flex flex-col justify-between hover:shadow-2xl transition-all">
                        <div>
                            <div className="flex justify-between items-start mb-6">
                                <span className="px-4 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 text-[10px] font-black rounded-xl uppercase tracking-widest">{item.category}</span>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => { setEditingItem(item); setEditTitle(item.title); setEditContent(item.content); setEditCategory(item.category || "UGC"); }} className="p-2.5 bg-zinc-50 dark:bg-zinc-800 text-blue-600 rounded-xl hover:bg-blue-50 transition-all"><Edit3 size={18}/></button>
                                    <button onClick={() => handleDeletePost(item.id)} className="p-2.5 bg-zinc-50 dark:bg-zinc-800 text-red-600 rounded-xl hover:bg-red-50 transition-all"><Trash2 size={18}/></button>
                                </div>
                            </div>
                            <h3 className="text-2xl font-black mb-4 text-zinc-900 dark:text-zinc-100">{item.title}</h3>
                            <p className="text-zinc-500 dark:text-zinc-400 line-clamp-3 mb-10 font-serif italic leading-relaxed">"{item.content}"</p>
                        </div>
                        
                        <div className="flex items-center justify-between pt-8 border-t border-zinc-50 dark:border-zinc-800">
                            <div className="flex gap-6">
                                <div className="flex items-center gap-2 text-zinc-400"><Heart size={18} className="fill-red-500 text-red-500" /><span className="text-sm font-black">{item.like_count || 0}</span></div>
                                <div className="flex items-center gap-2 text-zinc-400"><MessageSquare size={18} /><span className="text-sm font-black">{item.comment_count || 0}</span></div>
                            </div>
                            <Link href={`/challenge/${item.id}`} className="p-3 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 rounded-2xl hover:scale-110 transition-transform shadow-xl">
                                <ChevronRight size={20} />
                            </Link>
                        </div>
                    </div>
                )) : <EmptyState message="세상에 하나뿐인 나만의 챌린지 글을 등록해보세요." />}
            </div>
        )}

        {activeTab === 'likes' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {likedContents.length > 0 ? likedContents.map((item) => (
                    <div key={item.id} className="bg-white dark:bg-zinc-900 p-10 rounded-[3rem] border border-zinc-100 dark:border-zinc-800 group hover:shadow-2xl transition-all">
                        <div className="flex justify-between items-start mb-6">
                            <span className="px-4 py-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-[10px] font-black rounded-xl uppercase tracking-widest">{item.category}</span>
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-bold text-zinc-400">by {item.profiles?.nickname}</span>
                                {item.profiles?.avatar_url && <Image src={item.profiles.avatar_url} alt="작기" width={24} height={24} className="rounded-full object-cover" />}
                            </div>
                        </div>
                        <h3 className="text-2xl font-black mb-4 text-zinc-900 dark:text-zinc-100">{item.title}</h3>
                        <p className="text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-10 font-serif italic">"{item.content}"</p>
                        <div className="flex justify-end">
                            <Link href={`/challenge/${item.id}`} className="flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-[1.5rem] text-sm font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 dark:shadow-none">
                                <Play size={16} fill="currentColor" /> 다시 도전하기
                            </Link>
                        </div>
                    </div>
                )) : <EmptyState message="마음에 드는 글에 좋아요를 누르고 보관해보세요." />}
            </div>
        )}
      </div>
    </div>
  );
};

function StatBox({ icon, label, value, color, bg }: { icon: any, label: string, value: string, color: string, bg: string }) {
    return (
        <div className={`flex items-center gap-4 ${bg} px-6 py-4 rounded-3xl border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 transition-all group`}>
            <div className={`p-3 rounded-2xl bg-white dark:bg-zinc-900 shadow-sm ${color} group-hover:scale-110 transition-transform`}>{icon}</div>
            <div>
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1.5">{label}</p>
                <p className={`text-xl font-black ${color}`}>{value}</p>
            </div>
        </div>
    );
}

function TabBtn({ active, label, icon, onClick }: { active: boolean, label: string, icon: React.ReactNode, onClick: () => void }) {
    return (
        <button onClick={onClick} className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-black transition-all ${active ? 'bg-white dark:bg-zinc-900 text-blue-600 shadow-lg scale-105' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'}`}>
            {icon}
            {label}
        </button>
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="text-center py-40 bg-zinc-50 dark:bg-zinc-900/50 rounded-[4rem] border-4 border-dashed border-zinc-100 dark:border-zinc-800">
            <Sparkles size={48} className="text-zinc-200 mx-auto mb-6" />
            <p className="text-zinc-400 font-black text-lg max-w-xs mx-auto leading-relaxed">{message}</p>
        </div>
    );
}
