"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { User, Layout, PenTool, Gamepad2, Users, BookOpenCheck, LogOut, Loader2, Menu, X, ChevronRight, Zap } from "lucide-react";
import { SupabaseService, supabase } from "@/lib/supabase";
import { NotificationDrawer } from "./NotificationDrawer";

export const Header: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    let isInitialMount = true;

    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          const p = await SupabaseService.getMyProfile();
          setProfile(p);
        }
      } catch (error) {
        console.error("초기 유저 정보 확인 실패:", error);
      } finally {
        setLoading(false);
      }
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user || null;
      
      // 유저 상태가 변경되었을 때만 상태 업데이트
      setUser(prevUser => {
        if (prevUser?.id !== currentUser?.id) {
          return currentUser;
        }
        return prevUser;
      });

      if (currentUser) {
        try {
          const p = await SupabaseService.getMyProfile();
          setProfile(prevProfile => {
            if (JSON.stringify(prevProfile) !== JSON.stringify(p)) {
              return p;
            }
            return prevProfile;
          });
          
          // SIGNED_IN 이벤트이고 초기 마운트가 아닐 때만 refresh (무한 루프 방지)
          if (event === 'SIGNED_IN' && !isInitialMount) {
            router.refresh();
          }
        } catch (err) { 
          console.error(err); 
        }
      } else {
        setProfile(null);
      }
      
      setLoading(false);
      isInitialMount = false;
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const handleLogin = async () => {
    setLoading(true);
    try { await SupabaseService.signInWithKakao(); } 
    catch (error) { setLoading(false); }
  };

  const handleLogout = async () => {
    try {
      await SupabaseService.signOut();
      setIsMobileMenuOpen(false);
      router.refresh();
    } catch (error) { console.error(error); }
  };

  // 모바일 메뉴 드로어 JSX
  const mobileMenuContent = (
    <div className="fixed inset-0 z-[10000] flex justify-end">
        <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsMobileMenuOpen(false)} />
        <div className="relative w-80 h-full bg-white dark:bg-zinc-950 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-zinc-100 dark:border-zinc-900 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-lg">한</div>
                    <span className="font-black dark:text-white">메뉴</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"><X size={24} /></button>
            </div>

            <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
                <MobileNavItem href="/practice" icon={<Layout size={20} />} label="타자 연습장" onClick={() => setIsMobileMenuOpen(false)} />
                <MobileNavItem href="/transcription" icon={<PenTool size={20} />} label="긴 글 연습" onClick={() => setIsMobileMenuOpen(false)} />
                <MobileNavItem href="/game" icon={<Gamepad2 size={20} />} label="한글 게임" onClick={() => setIsMobileMenuOpen(false)} />
                <MobileNavItem href="/quiz" icon={<BookOpenCheck size={20} />} label="맞춤법 퀴즈" onClick={() => setIsMobileMenuOpen(false)} />
                <MobileNavItem href="/challenge" icon={<Users size={20} />} label="필사 챌린지" onClick={() => setIsMobileMenuOpen(false)} />
            </div>

            <div className="p-6 border-t border-zinc-100 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-900/50">
                {user ? (
                    <div className="flex flex-col gap-4">
                        <Link href="/mypage" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 p-2">
                            {profile?.avatar_url ? <Image src={profile.avatar_url} alt="p" width={40} height={40} className="w-10 h-10 rounded-full object-cover" /> : <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">U</div>}
                            <div>
                                <p className="font-black text-sm dark:text-white">{profile?.nickname || '필사 작가'}</p>
                                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">My Page</p>
                            </div>
                        </Link>
                        <button onClick={handleLogout} className="flex items-center justify-center gap-2 w-full py-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-500 rounded-xl text-xs font-black">
                            <LogOut size={14} /> 로그아웃
                        </button>
                    </div>
                ) : (
                    <button onClick={handleLogin} className="w-full py-4 bg-[#FEE500] text-black font-black rounded-xl flex items-center justify-center gap-2 shadow-lg">
                        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M12 3c-5.5 0-10 3.5-10 7.8 0 2.8 1.8 5.3 4.5 6.6l-1.1 4.1c-.1.5.4.8.8.6l4.8-3.2c.3 0 .7.1 1 .1 5.5 0 10-3.5 10-7.8S17.5 3 12 3" /></svg>
                        3초 만에 시작하기
                    </button>
                )}
            </div>
        </div>
    </div>
  );

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Mobile-only Notice Banner */}
      <div className="md:hidden w-full bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-100 dark:border-yellow-900/30 py-2 px-4 text-center">
        <p className="text-[10px] font-bold text-yellow-700 dark:text-yellow-500 leading-tight">
          한글타자왕은 컴퓨터 화면에 최적화되어 있습니다.<br/>가급적 컴퓨터로 접속하여 연습해 주세요!
        </p>
      </div>

      <div className="w-full bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
        <div className="container mx-auto max-w-7xl h-16 flex items-center justify-between px-4 lg:px-8">
            <Link href="/" className="flex items-center gap-2 cursor-pointer group">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-xl group-hover:scale-110 transition-transform">한</div>
                <span className="text-xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">한글타자왕</span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
                <NavButton icon={<Layout size={18} />} label="타자 연습장" href="/practice" />
                <NavButton icon={<PenTool size={18} />} label="긴 글 연습" href="/transcription" />
                <NavButton icon={<Gamepad2 size={18} />} label="한글 게임" href="/game" />
                <NavButton icon={<BookOpenCheck size={18} />} label="맞춤법 퀴즈" href="/quiz" />
                <NavButton icon={<Users size={18} />} label="필사 챌린지" href="/challenge" />
            </nav>

            <div className="flex items-center gap-2">
                {loading ? (
                    <div className="w-10 h-10 flex items-center justify-center">
                        <Loader2 className="animate-spin text-zinc-300" size={20} />
                    </div>
                ) : (
                    <>
                        {user && <NotificationDrawer />}
                        <div className="hidden md:flex items-center gap-2">
                            {user ? (
                                <Link href="/mypage" className="flex items-center gap-2 p-1 pr-4 bg-zinc-100 dark:bg-zinc-800 rounded-full hover:bg-zinc-200 transition-all">
                                    {profile?.avatar_url ? <Image src={profile.avatar_url} alt="p" width={32} height={32} className="w-8 h-8 rounded-full object-cover border border-white" /> : <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs">U</div>}
                                    <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">마이페이지</span>
                                </Link>
                            ) : (
                                <button onClick={handleLogin} className="flex items-center gap-2 px-4 py-2 bg-[#FEE500] text-black rounded-full text-sm font-bold hover:opacity-90">
                                    <Zap size={14} fill="currentColor" /> 시작하기
                                </button>
                            )}
                        </div>
                        <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 md:hidden text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl">
                            <Menu size={24} />
                        </button>
                    </>
                )}
            </div>
        </div>
      </div>
      {mounted && isMobileMenuOpen && createPortal(mobileMenuContent, document.body)}
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

function MobileNavItem({ href, icon, label, onClick }: { href: string; icon: React.ReactNode; label: string; onClick: () => void }) {
    return (
        <Link href={href} onClick={onClick} className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-2xl transition-all">
            <div className="flex items-center gap-4 text-zinc-600 dark:text-zinc-400">
                {icon}
                <span className="font-black text-lg">{label}</span>
            </div>
            <ChevronRight size={18} className="text-zinc-300" />
        </Link>
    );
}
