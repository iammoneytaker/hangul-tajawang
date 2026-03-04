"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Bell, X, Heart, MessageSquare, Clock, ChevronRight, Loader2 } from "lucide-react";
import { SupabaseService, supabase } from "@/lib/supabase";

export const NotificationDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activities, setActivities] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUnreadCount();
    
    // 실시간 알림 구독
    const channel = supabase
      .channel('schema-db-changes')
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

  return (
    <>
      {/* Bell Icon with Badge */}
      <button 
        onClick={handleOpen}
        className="relative p-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all group"
      >
        <Bell size={20} className="text-zinc-500 group-hover:text-blue-600 transition-colors" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-zinc-950 animate-bounce">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsOpen(false)} />
          
          <div className="relative w-full max-w-sm bg-white dark:bg-zinc-950 h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 border-l border-zinc-200 dark:border-zinc-800">
            {/* Header */}
            <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-black">알림 센터</h3>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-tighter">Activity Feed</p>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"><X size={20}/></button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {loading ? (
                    <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" /></div>
                ) : activities.length > 0 ? (
                    activities.map((act) => (
                        <div key={act.id} className={`p-4 rounded-2xl border transition-all flex gap-4 ${act.is_read ? 'bg-transparent border-transparent opacity-60' : 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30'}`}>
                            <div className="shrink-0 pt-1">
                                {act.type === 'like' ? (
                                    <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-xl flex items-center justify-center text-red-500"><Heart size={18} fill="currentColor" /></div>
                                ) : (
                                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-500"><MessageSquare size={18} fill="currentColor" /></div>
                                )}
                            </div>
                            <div className="flex-1">
                                <p className="text-sm leading-snug">
                                    <span className="font-black text-zinc-900 dark:text-zinc-100">{act.actor?.nickname || '익명'}</span>님이 
                                    <span className="text-zinc-500 dark:text-zinc-400"> "{act.content?.title || '작성하신 글'}"</span>에 
                                    {act.type === 'like' ? ' 좋아요를 눌렀습니다.' : ' 댓글을 남겼습니다.'}
                                </p>
                                <div className="flex items-center gap-1.5 mt-2 text-[10px] font-bold text-zinc-400">
                                    <Clock size={10} />
                                    {new Date(act.created_at).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-32 text-zinc-400">
                        <Bell size={48} className="mx-auto mb-4 opacity-10" />
                        <p className="text-sm font-medium">새로운 알림이 없습니다.</p>
                    </div>
                )}
            </div>
            
            {/* Footer */}
            <div className="p-6 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 text-center">
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Hangul Tajawang Realtime Notification</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
