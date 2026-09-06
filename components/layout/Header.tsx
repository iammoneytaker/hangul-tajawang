"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { User as UserIcon, Layout, PenTool, Gamepad2, Users, BookOpenCheck, LogOut, Loader2, Menu, X, ChevronRight, ChevronDown, Zap, Newspaper, Timer, TramFront, Wrench, Globe, BookOpen } from "lucide-react";
import { usePathname } from "next/navigation";
import { SupabaseService, supabase } from "@/lib/supabase";
import { NotificationDrawer } from "./NotificationDrawer";
import { localeFromPathname, switchLocaleHref } from "@/lib/i18n/routes";
import { getChromeDict, NAV_ITEMS } from "@/lib/i18n/chrome";

/** 언어 선택기 — JS 상태 전환이 아닌 실제 <a> 링크 (크롤러의 /en 발견 경로 겸용) */
function LanguageSwitch({ pathname, label, className = "" }: { pathname: string; label: string; className?: string }) {
  return (
    <a
      href={switchLocaleHref(pathname)}
      className={`flex items-center gap-1.5 px-2.5 py-2 text-sm font-bold whitespace-nowrap rounded-lg text-zinc-500 hover:text-primary hover:bg-surface-low transition-all ${className}`}
    >
      <Globe size={15} />
      <span>{label}</span>
    </a>
  );
}

export const Header: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const locale = localeFromPathname(pathname);
  const t = getChromeDict(locale);
  const nav = NAV_ITEMS[locale];
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    let isMounted = true;

    const initAuth = async () => {
      const timeoutId = setTimeout(() => {
        if (isMounted) {
          setLoading(false);
        }
      }, 2000);

      try {
        const { data: { session } } = await supabase.auth.getSession();
        const initialUser = session?.user || null;
        
        if (initialUser && isMounted) {
          setUser(initialUser);
          setLoading(false); 
          
          (async () => {
            let p = await SupabaseService.getMyProfile(initialUser.id);
            if (!p && isMounted) {
              await new Promise(r => setTimeout(r, 800));
              p = await SupabaseService.getMyProfile(initialUser.id);
            }
            if (isMounted) setProfile(p);
          })();
        } else {
          setLoading(false);
        }
      } catch (error) {
        setLoading(false);
      } finally {
        clearTimeout(timeoutId);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        const currentUser = session?.user || null;
        if (currentUser && isMounted) {
          setUser(currentUser);
          setLoading(false); 

          (async () => {
            const p = await SupabaseService.getMyProfile(currentUser.id);
            if (isMounted) setProfile(p);
            if (event === 'SIGNED_IN') {
              router.refresh(); 
            }
          })();
        } else {
          setLoading(false);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        setLoading(false);
        router.refresh(); 
      }
    });

    // 카카오 로그인 페이지에서 뒤로가기로 돌아오면(bfcache 복원) 스피너가 남아있지 않도록 해제
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) setLoading(false);
    };
    window.addEventListener('pageshow', onPageShow);

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      window.removeEventListener('pageshow', onPageShow);
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

  const mobileMenuContent = (
    <div className="fixed inset-0 z-[10000] flex justify-end">
        <div className="absolute inset-0 bg-on-surface/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsMobileMenuOpen(false)} />
        <div className="relative w-80 h-full bg-surface shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-6 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 primary-gradient rounded-lg flex items-center justify-center text-white font-bold text-lg">한</div>
                    <span className="editorial-heading">{t.menu}</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-zinc-400 hover:text-on-surface transition-colors"><X size={24} /></button>
            </div>

            <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
                {locale === "ko" ? (
                  <>
                    <MobileNavItem href="/journey" icon={<TramFront size={20} />} label="지식타자" onClick={() => setIsMobileMenuOpen(false)} highlight />
                    <MobileNavItem href="/challenge" icon={<Users size={20} />} label="필사 챌린지" onClick={() => setIsMobileMenuOpen(false)} highlight />
                    <MobileNavItem href="/game" icon={<Gamepad2 size={20} />} label="한글 게임" onClick={() => setIsMobileMenuOpen(false)} highlight />
                    <p className="pt-4 pb-1 px-2 text-[11px] font-bold uppercase tracking-widest text-zinc-400">도구</p>
                    <MobileNavItem href="/test" icon={<Timer size={20} />} label="1분 타자 테스트" onClick={() => setIsMobileMenuOpen(false)} />
                    <MobileNavItem href="/practice" icon={<Layout size={20} />} label="타자 연습장" onClick={() => setIsMobileMenuOpen(false)} />
                    <MobileNavItem href="/transcription" icon={<PenTool size={20} />} label="원고지 필사" onClick={() => setIsMobileMenuOpen(false)} />
                    <MobileNavItem href="/quiz" icon={<BookOpenCheck size={20} />} label="맞춤법 퀴즈" onClick={() => setIsMobileMenuOpen(false)} />
                    <MobileNavItem href="/blog" icon={<Newspaper size={20} />} label="블로그" onClick={() => setIsMobileMenuOpen(false)} />
                  </>
                ) : (
                  <>
                    <MobileNavItem href="/en/game" icon={<Gamepad2 size={20} />} label="Typing Games" onClick={() => setIsMobileMenuOpen(false)} highlight />
                    <MobileNavItem href="/en/test" icon={<Timer size={20} />} label="Typing Test" onClick={() => setIsMobileMenuOpen(false)} highlight />
                    <MobileNavItem href="/en/practice" icon={<Layout size={20} />} label="Practice" onClick={() => setIsMobileMenuOpen(false)} highlight />
                    <p className="pt-4 pb-1 px-2 text-[11px] font-bold uppercase tracking-widest text-zinc-400">{t.toolsSection}</p>
                    <MobileNavItem href="/en/guide" icon={<BookOpen size={20} />} label="How to Type in Korean" onClick={() => setIsMobileMenuOpen(false)} />
                  </>
                )}
                {locale === "en" && (
                  <div className="pt-4">
                    <LanguageSwitch pathname={pathname} label={t.languageSwitch} className="w-full justify-center border border-surface-high" />
                  </div>
                )}
            </div>

            <div className="p-6 bg-surface-low">
                {user ? (
                    <div className="flex flex-col gap-4">
                        <Link href={locale === "en" ? "/en/mypage" : "/mypage"} prefetch={false} onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 p-2">
                            {profile?.avatar_url ? <Image src={profile.avatar_url} alt="p" width={40} height={40} className="w-10 h-10 rounded-full object-cover" /> : <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-primary font-bold">U</div>}
                            <div>
                                <p className="editorial-heading text-sm">{profile?.nickname || t.defaultNickname}</p>
                                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">My Page</p>
                            </div>
                        </Link>
                        <button onClick={handleLogout} className="flex items-center justify-center gap-2 w-full py-3 bg-surface-lowest border border-outline-variant text-zinc-500 rounded-xl text-xs font-bold">
                            <LogOut size={14} /> {t.logout}
                        </button>
                    </div>
                ) : (
                    <button onClick={handleLogin} className="w-full py-4 bg-[#FEE500] text-black font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg">
                        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M12 3c-5.5 0-10 3.5-10 7.8 0 2.8 1.8 5.3 4.5 6.6l-1.1 4.1c-.1.5.4.8.8.6l4.8-3.2c.3 0 .7.1 1 .1 5.5 0 10-3.5 10-7.8S17.5 3 12 3" /></svg>
                        {t.loginLong}
                    </button>
                )}
            </div>
        </div>
    </div>
  );

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="w-full bg-surface-high/85 backdrop-blur-md border-b border-outline-variant">
        <div className="container mx-auto max-w-7xl h-16 flex items-center justify-between px-4 lg:px-8">
            <Link href={locale === "en" ? "/en" : "/"} prefetch={false} className="flex items-center gap-2 cursor-pointer group shrink-0">
                <div className="w-8 h-8 primary-gradient rounded-md flex items-center justify-center text-white font-bold text-xl group-hover:scale-110 transition-transform">한</div>
                <span className="serif-display text-xl whitespace-nowrap">{locale === "en" ? "Hangul Tajawang" : "한글타자왕"}</span>
            </Link>

            {/* 데스크톱 내비: 코어 3 + 도구 드롭다운 (URL은 전부 기존 그대로). en은 /en 버전이 있는 메뉴만 노출 */}
            <nav className="hidden lg:flex items-center gap-1 min-w-0">
                {nav.main.map((item) => (
                  <NavButton key={item.href} label={item.label} href={item.href} highlight={item.highlight} />
                ))}
                {locale === "ko" ? (
                  // 한국어 내비에는 언어 선택기를 노출하지 않는다("영문 타자 연습" 오독 방지) — /en 발견 경로는 푸터 링크가 담당
                  <ToolsDropdown />
                ) : (
                  <>
                    {nav.tools.map((item) => <NavButton key={item.href} label={item.label} href={item.href} />)}
                    <LanguageSwitch pathname={pathname} label={t.languageSwitch} />
                  </>
                )}
            </nav>

            <div className="flex items-center gap-2 shrink-0">
                {loading ? (
                    <div className="w-10 h-10 flex items-center justify-center">
                        <Loader2 className="animate-spin text-zinc-300" size={20} />
                    </div>
                ) : (
                    <>
                        {user && <NotificationDrawer userId={user.id} />}
                        <div className="hidden lg:flex items-center gap-2">
                            {user ? (
                                <>
                                    <Link href={locale === "en" ? "/en/mypage" : "/mypage"} prefetch={false} className="flex items-center gap-2 p-1 pr-4 bg-surface-low rounded-full hover:bg-surface-high transition-all">
                                        {profile?.avatar_url ? <Image src={profile.avatar_url} alt="p" width={32} height={32} className="w-8 h-8 rounded-full object-cover" /> : <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-primary font-bold text-xs">U</div>}
                                        <span className="text-sm font-bold text-zinc-700">{t.mypage}</span>
                                    </Link>
                                    <button onClick={handleLogout} title={t.logout} aria-label={t.logout} className="p-2.5 text-zinc-400 hover:text-red-500 hover:bg-surface-low rounded-full transition-all">
                                        <LogOut size={16} />
                                    </button>
                                </>
                            ) : (
                                // 영문권 타깃(한국어 학습자)은 카카오톡 보유율이 높아 en에서도 카카오 로그인 노출
                                <button onClick={handleLogin} className="flex items-center gap-2 px-4 py-2 bg-[#FEE500] text-black rounded-full text-sm font-bold hover:opacity-90">
                                    <Zap size={14} fill="currentColor" /> {t.login}
                                </button>
                            )}
                        </div>
                        <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 lg:hidden text-zinc-600 hover:bg-surface-low rounded-xl">
                            <Menu size={24} />
                        </button>
                    </>
                )}
            </div>
        </div>
      </div>
      {mounted && isMobileMenuOpen && createPortal(mobileMenuContent, document.body)}
      {mounted && <BottomTabBar />}
    </header>
  );
};

/* 도구 링크 — 코어(챌린지·게임·지식타자)를 받치는 유통망. 삭제 금지, 강등만. */
const TOOL_LINKS = [
  { href: "/test", label: "1분 타자 테스트" },
  { href: "/practice", label: "타자 연습장" },
  { href: "/transcription", label: "원고지 필사" },
  { href: "/quiz", label: "맞춤법 퀴즈" },
  { href: "/blog", label: "블로그" },
];

function ToolsDropdown() {
  return (
    <div className="relative group">
      <button
        aria-haspopup="true"
        className="serif-display flex items-center gap-1 px-2.5 py-2 text-sm whitespace-nowrap rounded-lg text-zinc-600 hover:text-primary hover:bg-surface-low transition-all"
      >
        도구 <ChevronDown size={14} className="transition-transform group-hover:rotate-180" />
      </button>
      {/* hover/포커스로 열리는 패널 — pt-2로 버튼과 패널 사이 hover 끊김 방지 */}
      <div className="absolute right-0 top-full pt-2 hidden group-hover:block group-focus-within:block z-50">
        <div className="w-52 paper-card p-2 flex flex-col">
          {TOOL_LINKS.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              prefetch={false}
              className="px-3 py-2.5 rounded-xl text-sm font-bold text-zinc-700 hover:text-primary hover:bg-surface-low transition-colors"
            >
              {t.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

/* 모바일 하단 고정 탭 — 코어 3 + 도구 시트. 허브 화면에서만 노출(플레이 화면 가림 방지). */
const BOTTOM_TAB_PATHS = new Set([
  "/", "/challenge", "/game", "/journey", "/test", "/practice", "/transcription", "/quiz", "/blog", "/mypage",
  "/en", "/en/game", "/en/test", "/en/practice", "/en/guide", "/en/transcription",
]);

function BottomTabBar() {
  const pathname = usePathname();
  const [sheetOpen, setSheetOpen] = useState(false);
  const visible = BOTTOM_TAB_PATHS.has(pathname);

  useEffect(() => {
    if (!visible) return;
    const mq = window.matchMedia("(min-width: 1024px)");
    const apply = () => { document.body.style.paddingBottom = mq.matches ? "" : "76px"; };
    apply();
    mq.addEventListener("change", apply);
    return () => { mq.removeEventListener("change", apply); document.body.style.paddingBottom = ""; };
  }, [visible]);

  useEffect(() => { setSheetOpen(false); }, [pathname]);

  if (!visible) return null;

  const isEn = localeFromPathname(pathname) === "en";
  const tabs = isEn
    ? [
        { href: "/en/game", label: "Games", icon: <Gamepad2 size={20} /> },
        { href: "/en/test", label: "Test", icon: <Timer size={20} /> },
        { href: "/en/practice", label: "Practice", icon: <Layout size={20} /> },
        { href: "/en/guide", label: "Guide", icon: <BookOpen size={20} /> },
      ]
    : [
        { href: "/journey", label: "지식타자", icon: <TramFront size={20} /> },
        { href: "/challenge", label: "챌린지", icon: <Users size={20} /> },
        { href: "/game", label: "게임", icon: <Gamepad2 size={20} /> },
      ];

  return (
    <>
      {sheetOpen && (
        <div className="fixed inset-0 z-[9998] lg:hidden" onClick={() => setSheetOpen(false)}>
          <div className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm" />
          <div className="absolute bottom-[72px] left-3 right-3 paper-card p-3 grid grid-cols-2 gap-1 animate-in slide-in-from-bottom-4 duration-200" onClick={(e) => e.stopPropagation()}>
            {TOOL_LINKS.map((t) => (
              <Link key={t.href} href={t.href} prefetch={false} onClick={() => setSheetOpen(false)} className="px-4 py-3.5 rounded-xl text-sm font-bold text-zinc-700 hover:text-primary hover:bg-surface-low transition-colors">
                {t.label}
              </Link>
            ))}
          </div>
        </div>
      )}
      <nav className="fixed bottom-0 left-0 right-0 z-[9999] lg:hidden bg-surface-lowest/95 backdrop-blur-md border-t border-outline-variant pb-[env(safe-area-inset-bottom)]" aria-label="주요 메뉴">
        <div className="grid grid-cols-4 h-[68px]">
          {tabs.map((t) => {
            const active = pathname === t.href;
            return (
              <Link key={t.href} href={t.href} prefetch={false} className={`flex flex-col items-center justify-center gap-1 text-[11px] font-bold transition-colors ${active ? "text-primary" : "text-zinc-500"}`}>
                {t.icon}
                {t.label}
              </Link>
            );
          })}
          {!isEn && (
            <button onClick={() => setSheetOpen((v) => !v)} className={`flex flex-col items-center justify-center gap-1 text-[11px] font-bold transition-colors ${sheetOpen ? "text-primary" : "text-zinc-500"}`}>
              <Wrench size={20} />
              도구
            </button>
          )}
        </div>
      </nav>
    </>
  );
}

function NavButton({ label, href, className = "flex", highlight = false }: { label: string; href: string; className?: string; highlight?: boolean }) {
  return (
    <Link
      href={href}
      prefetch={false}
      className={`${className} serif-display items-center gap-1.5 px-2.5 py-2 text-sm whitespace-nowrap rounded-lg transition-all ${
        highlight
          ? "text-on-surface hover:text-primary hover:bg-primary/5"
          : "text-zinc-600 hover:text-primary hover:bg-surface-low"
      }`}
    >
      {highlight && <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" aria-hidden />}
      <span>{label}</span>
    </Link>
  );
}

function MobileNavItem({ href, icon, label, onClick, highlight = false }: { href: string; icon: React.ReactNode; label: string; onClick: () => void; highlight?: boolean }) {
    return (
        <Link
          href={href}
          prefetch={false}
          onClick={onClick}
          className={`flex items-center justify-between p-4 rounded-2xl transition-all ${
            highlight
              ? "bg-primary/5 border border-primary/20 hover:bg-primary/10"
              : "bg-surface-lowest hover:bg-surface-low"
          }`}
        >
            <div className={`flex items-center gap-4 ${highlight ? "text-primary" : "text-zinc-600"}`}>
                {icon}
                <span className={`editorial-heading text-lg ${highlight ? "text-on-surface" : ""}`}>{label}</span>
            </div>
            <ChevronRight size={18} className={highlight ? "text-primary/50" : "text-zinc-300"} />
        </Link>
    );
}
