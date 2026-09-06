"use client";
import { useGameAnalytics } from '@/hooks/useGameAnalytics';

import { useGameT } from "@/lib/i18n/game-ui";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Trophy, RotateCcw, Play, Loader2, User, Star, Zap, Flame, Keyboard, X, Send, CloudSnow, ChevronRight } from "lucide-react";
import { SupabaseService, supabase } from "@/lib/supabase";
import Image from "next/image";
import Link from "next/link";
import { getWordForLevel } from "@/lib/game-words";
import { useMobileGamePlay } from "@/hooks/useMobileGamePlay";
import { MobileGameShell } from "./MobileGameShell";
import { AdSenseUnit } from "../layout/AdSenseUnit";

type ItemType = "normal" | "bomb" | "ice" | "gold";
type ObstacleType = "normal" | "hidden" | "blinking" | "moving";

interface FallingWord {
  id: number;
  text: string;
  x: number;
  y: number;
  speed: number;
  itemType: ItemType;
  obstacleType: ObstacleType;
  movingDir: number;
  createdAt: number;
  isVisible: boolean;
}

export const WordGame: React.FC = () => {
  const { isEn, t } = useGameT();
  const [fallingWords, setFallingWords] = useState<FallingWord[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(5);
  const [level, setLevel] = useState(1);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [isSlowed, setIsSlowed] = useState(false);
  const [gameState, setGameState] = useState<"ready" | "playing" | "gameover">("ready");
  useGameAnalytics('acid-rain', gameState);
  const [mounted, setMounted] = useState(false);
  
  const [rankings, setRankings] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [rankingLoading, setRankingLoading] = useState(false);

  const gameAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const requestRef = useRef<number | null>(null);
  const lastSpawnTime = useRef<number>(0);
  const speedMultiplierRef = useRef<number>(1);
  const processedMissedWordsRef = useRef<Set<number>>(new Set());

  // 모바일 풀스크린 몰입 모드 (visualViewport 동기화 / 스크롤 잠금 / 포커스 이탈 일시정지)
  const { isMobilePlaying, paused, overlay, resume } =
    useMobileGamePlay({ playing: gameState === "playing", inputRef });

  // 일시정지 도중 스폰 타이머가 밀리지 않게, 재개 시 타이머 기준 시각을 갱신
  useEffect(() => {
    if (!paused) return;
    return () => { lastSpawnTime.current = performance.now(); };
  }, [paused]);

  useEffect(() => {
    setMounted(true);
    const loadUser = async () => {
        const currentUser = await SupabaseService.getCurrentUser();
        if (currentUser) {
            setUser(currentUser);
            const p = await SupabaseService.getMyProfile();
            setProfile(p);
        }
    };
    loadUser();
  }, []);

  const fetchRankings = async () => {
    setRankingLoading(true);
    try {
      const data = await SupabaseService.getGameRankings("acid-rain");
      setRankings(data);
    } catch (e) { console.error(e); } 
    finally { setRankingLoading(false); }
  };

  useEffect(() => {
    if (gameState === "gameover" || gameState === "ready") fetchRankings();
  }, [gameState]);

  const getObstacleTypeForLevel = useCallback((currentLevel: number): ObstacleType => {
    if (currentLevel <= 2) return "normal";
    if (currentLevel <= 4) return Math.random() < 0.2 ? "hidden" : "normal";
    if (currentLevel <= 6) return Math.random() < 0.3 ? "blinking" : "normal";
    const rand = Math.random();
    if (rand < 0.25) return "hidden";
    if (rand < 0.5) return "blinking";
    if (rand < 0.7) return "moving";
    return "normal";
  }, []);

  const spawnWord = useCallback((time: number) => {
    if (!gameAreaRef.current) return;
    const width = gameAreaRef.current.clientWidth;
    const itemRand = Math.random();
    let itemType: ItemType = "normal";
    let text = getWordForLevel(level);

    if (itemRand > 0.97) { itemType = "bomb"; text = "💣 폭탄"; } 
    else if (itemRand > 0.94) { itemType = "ice"; text = "❄️ 얼음"; } 
    else if (itemRand > 0.91) { itemType = "gold"; text = "✨ 황금"; }

    const obstacleType = itemType === "normal" ? getObstacleTypeForLevel(level) : "normal";

    // 화면 높이에 비례해 낙하 속도 보정 (모바일의 낮은 게임 영역에서 난이도 급상승 방지)
    const heightScale = Math.max(0.45, (gameAreaRef.current.clientHeight || 600) / 600);

    const newWord: FallingWord = {
      id: Date.now() + Math.random(),
      text,
      x: Math.random() * Math.max(40, width - 140) + 20,
      y: -50,
      speed: (0.8 + Math.random() * 0.5 + (level * 0.15)) * heightScale,
      itemType,
      obstacleType,
      movingDir: Math.random() > 0.5 ? 1 : -1,
      createdAt: time,
      isVisible: true,
    };
    setFallingWords((prev) => [...prev, newWord]);
  }, [level, getObstacleTypeForLevel]);

  const updateGame = useCallback((time: number) => {
    if (gameState !== "playing" || paused) return;

    const spawnDelay = Math.max(800, 3000 - (level * 250));
    if (time - lastSpawnTime.current > spawnDelay) {
      spawnWord(time);
      lastSpawnTime.current = time;
    }

    setFallingWords((prev) => {
      const height = gameAreaRef.current?.clientHeight || 600;
      const width = gameAreaRef.current?.clientWidth || 800;
      let missedCount = 0;

      const nextWords = prev.map((w) => {
        let newX = w.x;
        let newDir = w.movingDir;
        let newVis = true;

        if (w.obstacleType === "moving") {
          newX += newDir * 1.5 * speedMultiplierRef.current;
          const wordWidth = w.text.length * 20 + 40; 
          if (newX <= 10 || newX >= width - wordWidth) newDir *= -1;
        }

        const age = time - w.createdAt;
        if (age > 2500) {
          if (w.obstacleType === "hidden") newVis = false;
          if (w.obstacleType === "blinking") newVis = Math.floor(age / 400) % 2 === 0;
        }

        return { ...w, y: w.y + (w.speed * speedMultiplierRef.current), x: newX, movingDir: newDir, isVisible: newVis };
      }).filter((w) => {
        if (w.y > height) {
          if (w.itemType === "normal" && !processedMissedWordsRef.current.has(w.id)) {
            processedMissedWordsRef.current.add(w.id);
            missedCount++;
          }
          return false;
        }
        return true;
      });
      
      if (missedCount > 0) {
        setTimeout(() => {
          setLives((l) => Math.max(0, l - missedCount));
          setCombo(0);
        }, 0);
      }
      return nextWords;
    });

    requestRef.current = requestAnimationFrame(updateGame);
  }, [gameState, level, spawnWord, paused]);

  useEffect(() => {
    if (gameState === "playing" && !paused) requestRef.current = requestAnimationFrame(updateGame);
    else if (requestRef.current) cancelAnimationFrame(requestRef.current);
    return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
  }, [gameState, updateGame, paused]);

  useEffect(() => {
    if (lives <= 0 && gameState === "playing") handleGameOver();
  }, [lives, gameState]);

  const handleGameOver = async () => {
    setGameState("gameover");
    if (user) {
      try {
        await SupabaseService.saveGameScore("acid-rain", score, level, maxCombo);
        await fetchRankings(); // 방금 저장한 기록까지 반영해 다시 로드
      } catch (e) {
        console.error("게임 점수 저장 실패:", e);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    const matchedWord = fallingWords.find((w) => 
      w.text === value || (w.text.includes(" ") && w.text.split(" ")[1] === value)
    );

    if (matchedWord) {
      setFallingWords((prev) => prev.filter((w) => w.id !== matchedWord.id));
      setInputValue("");
      const newCombo = combo + 1;
      setCombo(newCombo);
      if (newCombo > maxCombo) setMaxCombo(newCombo);
      const comboBonus = Math.floor(newCombo / 5) * 30;
      
      let gainedScore = 0;
      switch (matchedWord.itemType) {
        case "bomb": setFallingWords([]); gainedScore = 500; break;
        case "ice": speedMultiplierRef.current = 0.3; setIsSlowed(true); setTimeout(() => { speedMultiplierRef.current = 1; setIsSlowed(false); }, 5000); gainedScore = 200; break;
        case "gold": gainedScore = 1000 + comboBonus; break;
        default: gainedScore = 100 + comboBonus;
      }
      const newTotalScore = score + gainedScore;
      setScore(newTotalScore);
      if (newTotalScore >= level * 500) setLevel(prev => prev + 1);
    }
  };

  const startGame = () => {
    setFallingWords([]); setScore(0); setLives(5); setLevel(1); setCombo(0); setMaxCombo(0);
    speedMultiplierRef.current = 1; processedMissedWordsRef.current.clear(); setGameState("playing"); lastSpawnTime.current = performance.now();
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  // 게임 종료 팝업 (Portal)
  const gameOverModal = gameState === "gameover" && (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6">
        <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-xl animate-in fade-in duration-500" />
        <div className="relative max-w-lg w-full max-h-[90vh] overflow-y-auto no-scrollbar bg-white rounded-2xl p-8 shadow-2xl text-center border border-zinc-200 animate-in zoom-in duration-500">
            <div className="inline-flex p-6 bg-red-50 rounded-full mb-8"><Trophy className="w-20 h-20 text-yellow-500" /></div>
            <h2 className="text-5xl font-bold text-zinc-900 mb-2 tracking-tighter">GAME OVER</h2>
            <p className="text-zinc-500 font-bold mb-10">{t("최고의 집중력을 보여주셨네요!")}</p>
            <div className="grid grid-cols-2 gap-4 mb-10">
                <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-100"><p className="text-[10px] font-bold text-zinc-400 uppercase mb-1 tracking-widest">Final Score</p><p className="text-3xl font-bold text-zinc-900">{score.toLocaleString()}</p></div>
                <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-100"><p className="text-[10px] font-bold text-zinc-400 uppercase mb-1 tracking-widest">Max Combo</p><p className="text-3xl font-bold text-zinc-900">{maxCombo}</p></div>
            </div>
            {!user ? (
                <div className="mb-10 p-8 bg-blue-50 rounded-2xl border border-blue-100"><p className="text-sm font-bold text-blue-600 mb-6 flex items-center justify-center gap-2"><Zap size={16} fill="currentColor" /> {t("랭킹에 이름을 남기고 싶으신가요?")}</p><button onClick={() => SupabaseService.signInWithKakao()} className="w-full py-5 bg-[#FEE500] text-black font-bold rounded-2xl flex items-center justify-center gap-3 hover:opacity-90 transition-all shadow-xl active:scale-95"><svg viewBox="0 0 24 24" className="w-6 h-6 fill-current"><path d="M12 3c-5.5 0-10 3.5-10 7.8 0 2.8 1.8 5.3 4.5 6.6l-1.1 4.1c-.1.5.4.8.8.6l4.8-3.2c.3 0 .7.1 1 .1 5.5 0 10-3.5 10-7.8S17.5 3 12 3" /></svg>{t("3초 만에 로그인하고 기록 저장")}</button></div>
            ) : (
                <div className="mb-10 p-6 bg-green-50 rounded-2xl border border-green-100 flex items-center justify-center gap-3 animate-pulse"><Star size={20} className="text-green-600" fill="currentColor" /><p className="text-sm font-bold text-green-600">{t("방금 세운 기록이 랭킹에 성공적으로 반영되었습니다!")}</p></div>
            )}
            <div className="mb-6 flex justify-center empty:hidden">
              <AdSenseUnit label="content-banner-mobile" width={320} height={100} tight />
            </div>
            <div className="flex flex-col gap-4">
                <button onClick={startGame} className="w-full py-5 bg-zinc-900 text-white text-xl font-bold rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl flex items-center justify-center gap-3"><RotateCcw size={24} /> {t("다시 도전하기")}</button>
                <Link prefetch={false} href={isEn ? "/en/game" : "/game"} className="flex items-center justify-center gap-2 text-zinc-400 font-bold text-sm hover:text-zinc-600 transition-colors">{t("목록으로 돌아가기")} <ChevronRight size={16}/></Link>
            </div>
        </div>
    </div>
  );

  // 셸(모바일 풀스크린)/인라인(데스크톱) 공용 게임 영역 — 위치에 따라 클래스만 분기
  const gameArea = (
    <div ref={gameAreaRef} className={`relative overflow-hidden transition-all duration-500 ${isMobilePlaying ? "w-full h-full" : `flex-1 min-h-[200px] bg-zinc-950 rounded-2xl md:rounded-2xl border-4 ${isSlowed ? "border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]" : "border-zinc-900"}`}`} style={{ backgroundImage: 'radial-gradient(circle, #18181b 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
      {gameState === "ready" && (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-20 p-4">
          <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-6 max-w-sm w-full border border-zinc-200">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600"><Play size={32} fill="currentColor" className="ml-1" /></div>
              <div className="text-center"><h3 className="text-2xl font-bold text-zinc-900 mb-1">{t("산성비 게임")}</h3><p className="text-zinc-500 text-xs font-medium">{t("떨어지는 단어를 바닥에 닿기 전에 입력하세요!")}</p></div>
              <button onClick={startGame} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold rounded-xl transition-all shadow-xl">{t("게임 시작")}</button>
          </div>
      </div>
      )}
      {fallingWords.map((word) => (
      <div key={word.id} className={`absolute px-2.5 py-1.5 md:px-4 md:py-2 rounded-xl shadow-xl font-bold text-sm md:text-lg whitespace-nowrap flex items-center gap-2 ${!word.isVisible ? 'bg-zinc-900 text-zinc-600 border-b-4 border-zinc-800 scale-95 opacity-50' : 'bg-white text-zinc-900 border-b-4 border-zinc-200'}`} style={{ left: `${word.x}px`, top: `${word.y}px` }}>
          {word.isVisible ? word.text : "???"}
      </div>
      ))}
    </div>
  );

  const gameInput = (
    <input data-typing-input ref={inputRef} type="text" value={inputValue} onChange={handleInputChange} onKeyDown={(e) => { if (e.key === "Enter" && !e.nativeEvent.isComposing) { e.preventDefault(); setInputValue(""); } }} disabled={gameState !== "playing"} className={`w-full text-center font-bold outline-hidden transition-all ${isMobilePlaying ? "h-12 px-4 text-lg bg-zinc-800 text-white rounded-xl border-2 border-zinc-700 focus:border-blue-500 placeholder:text-zinc-500" : `h-14 md:h-20 px-5 md:px-8 text-xl md:text-4xl bg-white border-4 rounded-2xl md:rounded-2xl shadow-xl ${gameState === 'playing' ? 'border-zinc-900 focus:border-blue-500' : 'border-zinc-100 opacity-50'}`}`} placeholder={gameState === "playing" ? t("단어를 입력하세요!") : t("준비가 되면 시작하세요")} autoFocus autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} />
  );

  // ── 모바일 풀스크린 몰입 모드: 헤더/광고를 벗어난 포털 셸에서 플레이 ──
  if (isMobilePlaying && overlay) {
    const exitGame = () => {
      if (confirm(t("게임을 그만하고 결과를 볼까요?"))) handleGameOver();
      else resume();
    };
    const mobileHud = (
      <>
        <span className="flex items-center gap-1"><span className="text-[9px] text-zinc-500 font-bold uppercase">SC</span><span className="text-sm font-bold text-yellow-400 tabular-nums">{score.toLocaleString()}</span></span>
        <span className="flex items-center gap-1"><span className="text-[9px] text-zinc-500 font-bold uppercase">LV</span><span className="text-sm font-bold text-blue-400 tabular-nums">{level}</span></span>
        {isSlowed && <CloudSnow size={13} className="text-blue-400 animate-pulse" />}
        {combo > 1 && <span className="text-orange-500 font-bold text-xs italic flex items-center gap-0.5"><Flame size={11} fill="currentColor" />{combo}</span>}
        <span className="flex gap-0.5 ml-auto text-[10px]">{Array(5).fill(0).map((_, i) => (<span key={i} className={i < lives ? "" : "grayscale opacity-20"}>❤️</span>))}</span>
      </>
    );
    return (
      <MobileGameShell overlay={overlay} hud={mobileHud} input={gameInput} paused={paused} onResume={resume} onExit={exitGame}>
        {gameArea}
      </MobileGameShell>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-2 md:gap-4 py-2 animate-in fade-in duration-700 h-[calc(100dvh-140px)] md:h-[calc(100vh-100px)] max-h-[800px] min-h-[420px] md:min-h-[650px]">
      {gameState === "gameover" && mounted && createPortal(gameOverModal, document.body)}

      {/* Game Dashboard (데스크톱 ≥lg) */}
      <div className="hidden lg:flex w-full justify-between items-center px-4 md:px-8 py-3 md:py-4 bg-zinc-900 text-white rounded-2xl md:rounded-2xl shadow-xl border border-zinc-800 shrink-0">
        <div className="flex gap-4 md:gap-8 items-center">
          <div className="flex flex-col"><span className="text-[9px] text-zinc-500 uppercase font-bold mb-0.5">Score</span><span className="text-lg md:text-2xl font-bold text-yellow-400">{score.toLocaleString()}</span></div>
          <div className="flex flex-col"><span className="text-[9px] text-zinc-500 uppercase font-bold mb-0.5">Level</span><span className="text-lg md:text-2xl font-bold text-blue-400">{level}</span></div>
          <div className="flex flex-col"><span className="text-[9px] text-zinc-500 uppercase font-bold mb-0.5">Health</span><div className="flex gap-0.5">{Array(5).fill(0).map((_, i) => (<span key={i} className={`text-sm md:text-lg transition-all ${i < lives ? "grayscale-0 scale-110" : "grayscale opacity-20 scale-90"}`}>❤️</span>))}</div></div>
        </div>
        <div className="hidden sm:flex items-center gap-4">
            {isSlowed && <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg animate-pulse border border-blue-500/30"><CloudSnow size={14} /><span className="text-[10px] font-bold uppercase tracking-widest">Slow</span></div>}
            {combo > 1 && <div className="animate-bounce"><span className="text-orange-500 font-bold text-lg italic flex items-center gap-1"><Flame size={16} fill="currentColor" /> {combo}</span></div>}
            <div className="h-8 w-px bg-zinc-800"></div>
            <div className="text-right"><div className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest leading-tight">Arcade Mode</div><div className="font-bold text-zinc-300 text-sm leading-tight">{t("한글 산성비")}</div></div>
        </div>
      </div>

      <div className="w-full flex flex-col lg:flex-row gap-4 flex-1 overflow-hidden min-h-0">
        {/* Main Column: Game Area + Input Area */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
            {gameArea}
            <div className="w-full shrink-0">{gameInput}</div>
        </div>

        {/* Rankings Sidebar (모바일에서는 게임 영역 확보를 위해 숨김) */}
        <div className="hidden lg:flex w-full lg:w-72 bg-white rounded-2xl border border-zinc-200 p-6 shadow-lg flex-col shrink-0">
            <div className="flex items-center gap-2 mb-6"><Trophy className="text-yellow-500" size={20} /><h3 className="text-lg font-bold">{t("실시간 랭킹")}</h3></div>
            <div className="flex-1 space-y-3 overflow-y-auto pr-1 custom-scrollbar">
                {rankingLoading ? (<div className="flex flex-col items-center justify-center py-10 gap-2"><Loader2 className="animate-spin text-zinc-300" size={20} /></div>) : 
                rankings.length > 0 ? rankings.map((rank, i) => (
                    <div key={i} className="flex items-center gap-3 group">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${i === 0 ? 'bg-yellow-400 text-white' : i === 1 ? 'bg-zinc-300 text-zinc-600' : i === 2 ? 'bg-orange-400 text-white' : 'bg-zinc-100 text-zinc-400'}`}>{i + 1}</div>
                        <div className="flex-1 flex items-center gap-2 min-w-0">
                            {rank.profiles?.avatar_url ? <Image src={rank.profiles.avatar_url} alt="p" width={24} height={32} className="w-6 h-6 rounded-lg object-cover aspect-square" /> : <div className="w-6 h-6 bg-zinc-50 rounded-lg flex items-center justify-center text-zinc-400"><User size={12} /></div>}
                            <div className="min-w-0"><p className="text-sm font-bold truncate text-zinc-900 leading-tight">{rank.profiles?.nickname || t('익명')}</p><p className="text-[9px] font-bold text-zinc-400">Lv.{rank.level}</p></div>
                        </div>
                        <div className="text-right shrink-0"><p className="text-sm font-bold text-blue-600">{rank.score.toLocaleString()}</p></div>
                    </div>
                )) : <div className="text-center py-10 text-zinc-400 text-xs font-medium">{t("기록 없음")}</div>}
            </div>
            {!user && (
                <p className="mt-4 text-[9px] text-zinc-400 font-bold text-center leading-relaxed px-2 animate-pulse">
                    {t("로그인을 하시면 나만의 소중한 기록을")} <br/>{t("실시간 랭킹에 남길 수 있습니다.")}
                </p>
            )}
            <div className="mt-4 pt-4 border-t border-zinc-100 text-center"><div className="bg-zinc-50 p-3 rounded-xl flex items-center justify-center gap-2"><Star size={14} className="text-blue-600" fill="currentColor" /><span className="font-bold text-xs">{profile?.nickname || 'Guest'}</span></div></div>
        </div>
      </div>
    </div>
  );
};
