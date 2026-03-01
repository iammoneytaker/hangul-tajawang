"use client";

import React, { useState, useEffect } from "react";
import { Plus, MessageSquare, Heart, Share2, Loader2, Send, X } from "lucide-react";
import { SupabaseService, supabase } from "@/lib/supabase";

export const OpenChallenge: React.FC = () => {
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isWriting, setIsWriting] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  
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
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await SupabaseService.getContents('전체', '최신순');
      setChallenges(data);
    } catch (error) {
      console.error("Error fetching challenges:", error);
    } finally {
      setLoading(false);
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
    if (!user) return alert("로그인이 필요합니다.");
    if (!newComment.trim()) return;

    try {
      const { error } = await supabase.from('typing_comments').insert({
        content_id: selectedContent.id,
        user_id: user.id,
        comment: newComment.trim()
      });
      if (error) throw error;
      setNewComment("");
      fetchComments(selectedContent.id);
      fetchData(); // Refresh comment count in list
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleOpenComments = (item: any) => {
    setSelectedContent(item);
    fetchComments(item.id);
  };

  const handleCreate = async () => {
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }
    if (!newTitle.trim() || !newContent.trim()) {
      alert("제목과 내용을 모두 입력해주세요.");
      return;
    }
    try {
      setLoading(true);
      await SupabaseService.createContent(newTitle, newContent, 'UGC');
      setIsWriting(false);
      setNewTitle("");
      setNewContent("");
      await fetchData();
    } catch (error) {
      console.error("Error creating content:", error);
      alert("등록에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (contentId: string, item: any) => {
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }
    try {
      const { data: existingLike } = await supabase
        .from('likes')
        .select()
        .match({ user_id: user.id, content_id: contentId })
        .maybeSingle();

      await SupabaseService.toggleLike(contentId, !!existingLike);
      await fetchData();
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  if (isWriting) {
    return (
      <div className="w-full max-w-4xl mx-auto py-8 px-4 relative min-h-[80vh]">
        <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-800">
          <h2 className="text-2xl font-bold mb-6">새로운 챌린지 등록</h2>
          <input 
            type="text" 
            placeholder="챌린지 제목을 입력하세요 (예: 내가 좋아하는 시)" 
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full p-4 mb-4 text-lg border border-zinc-200 dark:border-zinc-700 rounded-xl bg-transparent outline-hidden focus:border-blue-500"
          />
          <textarea 
            placeholder="타자 연습으로 공유할 내용을 입력하세요..." 
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            rows={10}
            className="w-full p-4 mb-6 text-lg border border-zinc-200 dark:border-zinc-700 rounded-xl bg-transparent outline-hidden focus:border-blue-500 resize-none"
          />
          <div className="flex gap-4 justify-end">
            <button 
              onClick={() => setIsWriting(false)}
              className="px-6 py-3 font-bold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
            >
              취소
            </button>
            <button 
              onClick={handleCreate}
              disabled={loading}
              className="px-8 py-3 font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors flex items-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : "등록하기"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4 relative min-h-[80vh]">
      {/* Comment Sidebar/Drawer */}
      {selectedContent && (
        <div className="fixed inset-0 z-[100] flex justify-end overflow-hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedContent(null)} />
          <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                <h3 className="text-xl font-bold">댓글 <span className="text-blue-600 ml-1">{comments.length}</span></h3>
                <button onClick={() => setSelectedContent(null)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"><X size={20}/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {commentLoading ? (
                    <div className="flex justify-center py-10"><Loader2 className="animate-spin text-zinc-300"/></div>
                ) : comments.length > 0 ? comments.map((c, i) => (
                    <div key={i} className="flex gap-4">
                        <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-zinc-400">
                            {c.profiles?.nickname?.[0] || '?'}
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                                <span className="font-bold text-sm">{c.profiles?.nickname || '익명'}</span>
                                <span className="text-[10px] text-zinc-400">{new Date(c.created_at).toLocaleDateString()}</span>
                            </div>
                            <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">{c.comment}</p>
                        </div>
                    </div>
                )) : (
                    <div className="text-center py-20 text-zinc-400 text-sm">아직 댓글이 없습니다. <br/>첫 댓글을 남겨보세요!</div>
                )}
            </div>

            <div className="p-6 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/20">
                <div className="relative">
                    <input 
                        type="text" 
                        placeholder={user ? "따뜻한 댓글을 남겨주세요" : "로그인 후 댓글을 남길 수 있습니다"}
                        disabled={!user}
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                        className="w-full py-4 pl-5 pr-14 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl outline-hidden focus:border-blue-500 shadow-sm"
                    />
                    <button 
                        onClick={handleAddComment}
                        disabled={!user || !newComment.trim()}
                        className="absolute right-2 top-2 p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all"
                    >
                        <Send size={20}/>
                    </button>
                </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-black text-zinc-900 dark:text-zinc-50 mb-2">오픈 챌린지</h2>
          <p className="text-zinc-500">다른 유저들이 등록한 글에 도전해보세요!</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        </div>
      ) : challenges.length === 0 ? (
        <div className="text-center py-20 text-zinc-500">
          아직 등록된 챌린지가 없습니다. 첫 번째 챌린지를 등록해보세요!
        </div>
      ) : (
        <div className="grid gap-4">
          {challenges.map((item) => (
            <div key={item.id} className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:shadow-md transition-shadow cursor-pointer group">
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">{item.category || 'UGC'}</span>
                <span className="text-sm text-zinc-400">작성자: {item.profiles?.nickname || '익명'}</span>
              </div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors">{item.title}</h3>
              <p className="text-zinc-600 dark:text-zinc-400 line-clamp-2 mb-4 font-serif italic">
                "{item.content}"
              </p>
              <div className="flex gap-4 text-sm text-zinc-400">
                <button 
                  onClick={(e) => { e.stopPropagation(); handleLike(item.id, item); }} 
                  className="flex items-center gap-1 hover:text-red-500 transition-colors"
                >
                  <Heart size={16} /> {item.like_count || 0}
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleOpenComments(item); }}
                  className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                >
                  <MessageSquare size={16} /> {item.typing_comments?.length || item.comment_count || 0}
                </button>
                <span className="flex items-center gap-1 text-blue-500">도전 {item.unique_complete_count || 0}명</span>
                <span className="flex items-center gap-1 ml-auto hover:text-blue-600"><Share2 size={16} /> 공유하기</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Floating Action Button */}
      <button 
        onClick={() => {
          if (!user) alert("로그인이 필요합니다.");
          else setIsWriting(true);
        }}
        className="fixed bottom-12 right-12 w-16 h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 z-50 group"
      >
        <Plus size={32} />
        <span className="absolute right-20 bg-zinc-900 text-white px-3 py-1 rounded text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          {user ? "글쓰기 도전!" : "로그인하고 글쓰기"}
        </span>
      </button>
    </div>
  );
};
