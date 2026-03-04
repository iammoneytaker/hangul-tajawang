"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Bell, X, Heart, MessageSquare, Clock, ChevronRight, Loader2, Sparkles, User } from "lucide-react";
import { SupabaseService, supabase } from "@/lib/supabase";

export const NotificationDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activities, setActivities] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchUnreadCount();
    
    const channel = supabase
      .channel('realtime-activities')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'typing_activities' 
      }, () => {
        fetchUnreadCount();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchUnreadCount = async () => {
    const count = await SupabaseService.getUnreadActivityCount();
    setUnreadCount(count);
  };

  const handleOpen = async () => {
    setIsOpen(true);
    setLoading(true);
    try {
      const data = await SupabaseService.getActivities();
      setActivities(data);
      if (unreadCount > 0) {
        await SupabaseService.markActivitiesAsRead();
        setUnreadCount(0);
      }
    } finally {
      setLoading(false);
    }
  };

  // 알림창 본체 (Portal로 띄울 내용)
  const drawerContent = (
    <div className="fixed inset-0 z-[99999] flex justify-end overflow-hidden">
      {/* 배경 오버레이 */}
      <div 
        className="absolute inset-0 bg-zinc-950/60 backdrop-blur-md animate-in fade-in duration-500" 
        onClick={() => setIsOpen(false)} 
      />
      
      {/* 드로어 몸체 */}
      <div className="relative w-full max-w-sm bg-white dark:bg-zinc-900 h-full shadow-[-20px_0_80px_rgba(0,0,0,0.4)] flex flex-col animate-in slide-in-from-right duration-500 border-l border-zinc-200 dark:border-zinc-800">
        <div className="p-8 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-950/50">
            <div>
                <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-100">알림 센터</h3>
                <div className="flex items-center gap-1.5 mt-1">
                    <Sparkles size={12} className="text-blue-500" />
                    <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">Realtime Activity</p>
                </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-3 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-2xl transition-all active:scale-90 text-zinc-400">
                <X size={20}/>
            </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 gap-4">
                    <Loader2 className="animate-spin text-blue-600" size={32} />
                    <p className="text-sm font-bold text-zinc-400">알림을 불러오는 중...</p>
                </div>
            ) : activities.length > 0 ? (
                activities.map((act) => (
                    <div key={act.id} className={`p-5 rounded-[2rem] border transition-all flex gap-4 ${act.is_read ? 'bg-transparent border-transparent opacity-60' : 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30'}`}>
                        <div className="shrink-0">
                            {act.actor?.avatar_url ? (
                                <Image src={act.actor.avatar_url} alt="actor" width={40} height={40} className="w-10 h-10 rounded-2xl object-cover border-2 border-white dark:border-zinc-800 shadow-sm" />
                            ) : (
                                <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-400"><User size={20} /></div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm leading-tight text-zinc-700 dark:text-zinc-300">
                                <span className="font-black text-zinc-900 dark:text-zinc-100">{act.actor?.nickname || '익명'}</span>님이 
                                <span className="font-bold text-blue-600"> {act.content?.title || '작성하신 글'}</span>에 
                                {act.type === 'like' ? ' 좋아요를 눌렀습니다.' : ' 댓글을 남겼습니다.'}
                            </p>
                            <div className="flex items-center gap-1.5 mt-2 text-[10px] font-bold text-zinc-400">
                                <Clock size={10} />
                                {new Date(act.created_at).toLocaleString()}
                            </div>
                        </div>
                        <div className="shrink-0 self-center">
                            {act.type === 'like' ? <Heart size={14} className="text-red-500 fill-red-500" /> : <MessageSquare size={14} className="text-blue-500 fill-blue-500" />}
                        </div>
                    </div>
                ))
            ) : (
                <div className="text-center py-40">
                    <div className="w-20 h-20 bg-zinc-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Bell size={32} className="text-zinc-200" />
                    </div>
                    <p className="text-sm font-bold text-zinc-400">최근 도착한 알림이 없습니다.</p>
                </div>
            )}
        </div>
        
        <div className="p-8 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50">
            <button onClick={() => setIsOpen(false)} className="w-full py-4 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-black rounded-2xl hover:scale-[1.02] transition-all shadow-xl">확인 완료</button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* 종 아이콘 버튼 (헤더에 렌더링) */}
      <button 
        onClick={handleOpen}
        className="relative p-2.5 bg-zinc-100 dark:bg-zinc-800 border border-transparent hover:border-blue-500/30 rounded-2xl transition-all group active:scale-90"
      >
        <Bell size={20} className="text-zinc-500 group-hover:text-blue-600 transition-colors" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] px-1 items-center justify-center bg-red-500 text-white text-[10px] font-black rounded-full border-2 border-white dark:border-zinc-950 animate-in zoom-in">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* 알림창 본체 (Body 하단으로 Portal 처리) */}
      {isOpen && mounted && createPortal(drawerContent, document.body)}
    </>
  );
};
