"use client";

import React, { useState, useEffect } from "react";
import { Volume2, VolumeX, Moon, Sun, User, Layout, PenTool, Gamepad2, Users, BookOpenCheck, LogOut, Loader2 } from "lucide-react";
import { SupabaseService, supabase } from "@/lib/supabase";

export const Header: React.FC<{ onModeChange: (mode: any) => void }> = ({ onModeChange }) => {
  const [asmr, setAsmr] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 1. 초기 사용자 확인
    const checkUser = async () => {
      console.log("Checking current session...");
      const currentUser = await SupabaseService.getCurrentUser();
      if (currentUser) {
        console.log("User session found:", currentUser.email);
        setUser(currentUser);
      } else {
        console.log("No active session found.");
      }
    };
    checkUser();

    // 2. 인증 상태 변경 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth State Changed:", event, session?.user?.email);
      setUser(session?.user || null);
      if (session?.user) setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async () => {
    console.log("카카오 로그인 버튼 클릭");
    setLoading(true);
    try {
      // Supabase OAuth 로그인 호출
      await SupabaseService.signInWithKakao();
    } catch (error: any) {
      console.error("로그인 프로세스 오류:", error.message);
      alert("로그인 요청 중 오류가 발생했습니다. 콘솔 로그를 확인해주세요.");
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    console.log("로그아웃 시도");
    try {
      await SupabaseService.signOut();
      console.log("로그아웃 성공");
    } catch (error) {
      console.error("로그아웃 실패:", error);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
      <div className="container mx-auto max-w-7xl h-16 flex items-center justify-between px-4 lg:px-8">
        {/* Left: Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => onModeChange("home")}>
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-xl">한</div>
          <span className="hidden sm:block text-xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">한글타자왕 <span className="text-blue-600">Web</span></span>
        </div>

        {/* Center: GNB */}
        <nav className="hidden md:flex items-center gap-1">
          <NavButton icon={<Layout size={18} />} label="타자 연습장" onClick={() => onModeChange("position")} />
          <NavButton icon={<PenTool size={18} />} label="감성 필사" onClick={() => onModeChange("long")} />
          <NavButton icon={<Gamepad2 size={18} />} label="아케이드" onClick={() => onModeChange("game")} />
          <NavButton icon={<BookOpenCheck size={18} />} label="맞춤법 퀴즈" onClick={() => onModeChange("quiz")} />
          <NavButton icon={<Users size={18} />} label="오픈 챌린지" onClick={() => onModeChange("challenge")} />
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
            <button 
              onClick={handleLogout}
              className="ml-2 flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white rounded-full text-sm font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">로그아웃</span>
            </button>
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

function NavButton({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center gap-2 px-4 py-2 text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg font-medium transition-all">
      {icon}
      <span>{label}</span>
    </button>
  );
}
