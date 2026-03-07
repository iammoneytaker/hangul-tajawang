"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Volume2, VolumeX, Moon, Sun, User, Layout, PenTool, Gamepad2, Users, BookOpenCheck, LogOut, Loader2, Settings } from "lucide-react";
import { SupabaseService, supabase } from "@/lib/supabase";
import { NotificationDrawer } from "./NotificationDrawer";

export const Header: React.FC = () => {
  const [asmr, setAsmr] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 1. 초기 로드 시 세션 및 프로필 확인
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        const p = await SupabaseService.getMyProfile();
        setProfile(p);
      }
    };
    checkUser();

    // 2. 세션 상태 변화 감지 (로그인/로그아웃/새로고침 등)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth Event:", event);
      
      if (session?.user) {
        setUser(session.user);
        // 캐시 문제를 피하기 위해 즉시 프로필 재요청
        const p = await SupabaseService.getMyProfile();
        setProfile(p);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await SupabaseService.signInWithKakao();
    } catch (error: any) {
      console.error("Login failed:", error);
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await SupabaseService.signOut();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
      <div className="container mx-auto max-w-7xl h-16 flex items-center justify-between px-4 lg:px-8">
        {/* Left: Logo */}
        <Link href="/" className="flex items-center gap-2 cursor-pointer">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-xl">한</div>
          <span className="hidden sm:block text-xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">한글타자왕 <span className="text-blue-600">Web</span></span>
        </Link>

        {/* Center: GNB */}
        <nav className="hidden md:flex items-center gap-1">
          <NavButton icon={<Layout size={18} />} label="타자 연습장" href="/practice" />
          <NavButton icon={<PenTool size={18} />} label="긴 글 연습" href="/transcription" />
          <NavButton icon={<Gamepad2 size={18} />} label="아케이드" href="/game" />
          <NavButton icon={<BookOpenCheck size={18} />} label="맞춤법 퀴즈" href="/quiz" />
          <NavButton icon={<Users size={18} />} label="필사 챌린지" href="/challenge" />
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button onClick={() => setAsmr(!asmr)} className="p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
            {asmr ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
          <button onClick={() => setDarkMode(!darkMode)} className="p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          
          {user ? (
            <div className="flex items-center gap-2">
              <NotificationDrawer />
              
              <Link 
                href="/mypage"
                className="flex items-center gap-2 p-1 pr-4 bg-zinc-100 dark:bg-zinc-800 rounded-full hover:bg-zinc-200 transition-all group"
              >
                {profile?.avatar_url ? (
                    <Image 
                        src={profile.avatar_url} 
                        alt="프로필 이미지" 
                        width={32} 
                        height={32} 
                        className="w-8 h-8 rounded-full object-cover aspect-square border border-white dark:border-zinc-700 shadow-sm" 
                    />
                ) : (
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xs border border-white dark:border-zinc-700">
                        {profile?.nickname?.[0] || 'U'}
                    </div>
                )}
                <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300 group-hover:text-blue-600 transition-colors">마이페이지</span>
              </Link>
              
              <button onClick={handleLogout} className="p-2 text-zinc-400 hover:text-red-500 transition-colors" title="로그아웃">
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <button 
              onClick={handleLogin}
              disabled={loading}
              className="ml-2 flex items-center gap-2 px-4 py-2 bg-[#FEE500] text-black rounded-full text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50 shadow-sm"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : (
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M12 3c-5.5 0-10 3.5-10 7.8 0 2.8 1.8 5.3 4.5 6.6l-1.1 4.1c-.1.5.4.8.8.6l4.8-3.2c.3 0 .7.1 1 .1 5.5 0 10-3.5 10-7.8S17.5 3 12 3" /></svg>
              )}
              <span className="hidden sm:inline">로그인 / 회원가입</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

function NavButton({ icon, label, href }: { icon: React.ReactNode; label: string; href: string }) {
  return (
    <Link href={href} className="flex items-center gap-2 px-4 py-2 text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg font-medium transition-all">
      {icon}
      <span>{label}</span>
    </Link>
  );
}
