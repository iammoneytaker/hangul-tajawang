"use client";
import { useGameAnalytics } from '@/hooks/useGameAnalytics';

import { useGameT } from "@/lib/i18n/game-ui";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Trophy, RotateCcw, Play, Loader2, Star, Zap, Flame, Brain, Timer, ChevronRight, Keyboard } from "lucide-react";
import { SupabaseService } from "@/lib/supabase";
import { useMobileGamePlay } from "@/hooks/useMobileGamePlay";
import { MobileGameShell } from "./MobileGameShell";
import Image from "next/image";
import Link from "next/link";
import { AdSenseUnit } from "../layout/AdSenseUnit";

// 카드 뒷면 트리거 단어들 (무작위 16개 선택됨)
const TRIGGER_WORDS = [
  '바람', '구름', '하늘', '바다', '모래', '나무', '풀잎', '꽃잎', '햇살', '달빛', 
  '별빛', '파도', '숲속', '공기', '안개', '이슬', '눈꽃', '단풍', '낙엽', '들판',
  '강물', '샘물', '산들', '산울', '길가', '정원', '마당', '지붕', '창가', '그늘'
];

// 카드 앞면 짝꿍 콘텐츠 (이모지 8쌍)
const PAIR_CONTENTS = ['🍎', '🍏', '🍋', '🫐', '🍓', '🍒', '🍑', '🍇'];

interface Card {
  id: number;
  triggerWord: string;
  hiddenContent: string;
  pairId: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export const CardFlipGame: React.FC = () => {
  const { isEn, t } = useGameT();
  const [cards, setCards] = useState<Card[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [isLocked, setIsLocked] = useState(false);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(180);
  const [gameState, setGameState] = useState<"ready" | "playing" | "gameover">("ready");
  useGameAnalytics('card-flip', gameState);
  const [mounted, setMounted] = useState(false);
  
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [rankings, setRankings] = useState<any[]>([]);
  const [rankingLoading, setRankingLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // 모바일 풀스크린 몰입 모드 (visualViewport 동기화 / 스크롤 잠금 / 포커스 이탈 일시정지)
  const { isMobilePlaying, paused, overlay, resume } =
    useMobileGamePlay({ playing: gameState === "playing", inputRef });

  // 판정 잠금이 풀릴 때마다 입력창으로 포커스 자동 이동
  useEffect(() => {
    if (!isLocked && gameState === "playing") {
      inputRef.current?.focus();
    }
  }, [isLocked, gameState]);

  useEffect(() => {
    setMounted(true);
    SupabaseService.getCurrentUser().then(u => {
        if (u) {
            setUser(u);
            SupabaseService.getMyProfile().then(setProfile);
        }
    });
  }, []);

  const fetchRankings = async () => {
    setRankingLoading(true);
    try {
      const data = await SupabaseService.getGameRankings("card-flip");
      setRankings(data);
    } catch (e) { console.error(e); } 
    finally { setRankingLoading(false); }
  };

  useEffect(() => {
    if (gameState === "gameover" || gameState === "ready") fetchRankings();
  }, [gameState]);

  // 게임 초기화 및 시작
  const initGame = () => {
    const shuffledTriggers = [...TRIGGER_WORDS].sort(() => Math.random() - 0.5).slice(0, 16);
    const pairedEmojis = [...PAIR_CONTENTS, ...PAIR_CONTENTS].sort(() => Math.random() - 0.5);
    const newCards: Card[] = shuffledTriggers.map((word, idx) => ({
      id: idx,
      triggerWord: word,
      hiddenContent: pairedEmojis[idx],
      pairId: pairedEmojis[idx],
      isFlipped: false,
      isMatched: false
    }));

    setCards(newCards);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setTimeLeft(180);
    setFlippedIndices([]);
    setIsLocked(false);
    setGameState("playing");
    setTimeout(() => inputRef.current?.focus(), 100); // 시작 직후 포커스
  };

  // 타이머 루프 (모바일 일시정지 중에는 시간도 멈춤)
  useEffect(() => {
    let timer: any;
    if (gameState === "playing" && timeLeft > 0 && !paused) {
      timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0 && gameState === "playing") {
      handleGameOver();
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft, paused]);

  // 모든 짝을 맞췄는지 체크
  useEffect(() => {
    if (gameState === "playing" && cards.length > 0 && cards.every(c => c.isMatched)) {
      handleGameOver();
    }
  }, [cards, gameState]);

  const handleGameOver = async () => {
    setGameState("gameover");
    if (user) {
      try {
        await SupabaseService.saveGameScore("card-flip", score, 1, maxCombo);
        await fetchRankings(); // 방금 저장한 기록까지 반영해 다시 로드
      } catch (e) {
        console.error("게임 점수 저장 실패:", e);
      }
    }
  };

  // 타자 입력 처리
  const handleInput = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked || gameState !== "playing") return;

    const targetWord = inputValue.trim();
    const cardIdx = cards.findIndex(c => c.triggerWord === targetWord && !c.isFlipped && !c.isMatched);

    if (cardIdx !== -1) {
      setInputValue("");
      flipCard(cardIdx);
    } else {
      setInputValue(""); 
    }
  };

  const flipCard = (index: number) => {
    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setIsLocked(true);
      const [firstIdx, secondIdx] = newFlipped;

      if (cards[firstIdx].pairId === cards[secondIdx].pairId) {
        setTimeout(() => {
          setCards(prev => prev.map((c, i) => 
            (i === firstIdx || i === secondIdx) ? { ...c, isMatched: true } : c
          ));
          const newCombo = combo + 1;
          setCombo(newCombo);
          if (newCombo > maxCombo) setMaxCombo(newCombo);
          setScore(s => s + 100 + (newCombo * 50));
          setFlippedIndices([]);
          setIsLocked(false);
        }, 600);
      } else {
        setTimeout(() => {
          setCards(prev => prev.map((c, i) => 
            (i === firstIdx || i === secondIdx) ? { ...c, isFlipped: false } : c
          ));
          setCombo(0);
          setFlippedIndices([]);
          setIsLocked(false);
        }, 1000);
      }
    }
  };

  const gameOverModal = gameState === "gameover" && (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6">
        <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-xl animate-in fade-in duration-500" />
        <div className="relative max-w-lg w-full max-h-[90vh] overflow-y-auto no-scrollbar bg-white rounded-2xl p-8 shadow-2xl text-center border border-zinc-200 animate-in zoom-in duration-500">
            <div className="inline-flex p-6 bg-purple-50 rounded-full mb-8"><Brain className="w-20 h-20 text-purple-500" /></div>
            <h2 className="text-5xl font-bold text-zinc-900 mb-2 tracking-tighter">FINISH!</h2>
            <p className="text-zinc-500 font-bold mb-10">{timeLeft > 0 ? t("놀라운 기억력입니다!") : t("시간이 다 되었습니다. 다시 도전해보세요!")}</p>
            <div className="grid grid-cols-2 gap-4 mb-10">
                <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-100"><p className="text-[10px] font-bold text-zinc-400 uppercase mb-1 tracking-widest">Score</p><p className="text-3xl font-bold text-zinc-900">{score.toLocaleString()}</p></div>
                <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-100"><p className="text-[10px] font-bold text-zinc-400 uppercase mb-1 tracking-widest">Max Combo</p><p className="text-3xl font-bold text-zinc-900">{maxCombo}</p></div>
            </div>
            {!user ? (
                <div className="mb-6 p-8 bg-blue-50 rounded-2xl border border-blue-100"><p className="text-sm font-bold text-blue-600 mb-6 flex items-center justify-center gap-2"><Zap size={16} fill="currentColor" /> {t("기록을 남겨보세요!")}</p><button onClick={() => SupabaseService.signInWithKakao()} className="w-full py-5 bg-[#FEE500] text-black font-bold rounded-2xl flex items-center justify-center gap-3 hover:opacity-90 transition-all shadow-xl active:scale-95"><svg viewBox="0 0 24 24" className="w-6 h-6 fill-current"><path d="M12 3c-5.5 0-10 3.5-10 7.8 0 2.8 1.8 5.3 4.5 6.6l-1.1 4.1c-.1.5.4.8.8.6l4.8-3.2c.3 0 .7.1 1 .1 5.5 0 10-3.5 10-7.8S17.5 3 12 3" /></svg>{t("3초 만에 로그인하고 저장")}</button></div>
            ) : <div className="mb-6 text-sm font-bold text-green-600 animate-pulse">{t("랭킹에 기록이 성공적으로 등록되었습니다!")}</div>}
            

            <div className="mb-6 flex justify-center empty:hidden">
              <AdSenseUnit label="content-banner-mobile" width={320} height={100} tight />
            </div>
            <button onClick={initGame} className="w-full py-5 bg-zinc-900 text-white text-xl font-bold rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl flex items-center justify-center gap-3"><RotateCcw size={24} /> {t("다시 시작하기")}</button>
        </div>
    </div>
  );

  // 셸(모바일 풀스크린)/인라인(데스크톱) 공용 카드 그리드
  const cardBoard = (
    <div className={`relative overflow-hidden ${isMobilePlaying ? "w-full h-full bg-zinc-950 p-2" : "flex-1 bg-zinc-100 rounded-2xl p-6 border-4 border-zinc-200"}`}>
      {gameState === "ready" && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-30 flex items-center justify-center p-4">
              <div className="bg-white p-10 rounded-2xl shadow-2xl flex flex-col items-center gap-8 max-w-sm w-full border border-zinc-200">
                  <div className="w-20 h-20 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 shadow-xl"><Brain size={40} /></div>
                  <div className="text-center"><h3 className="text-3xl font-bold text-zinc-900 mb-2 leading-tight">{t("기억력 타자")}</h3><p className="text-zinc-500 text-sm font-medium">{t("카드 뒷면의 단어를 치면 뒤집힙니다.")}<br/>{t("기억력을 발휘해 짝을 맞추세요!")}</p></div>
                  <button onClick={initGame} className="w-full py-5 bg-purple-600 hover:bg-purple-700 text-white text-xl font-bold rounded-2xl transition-all shadow-xl shadow-purple-200">{t("게임 시작")}</button>
              </div>
          </div>
      )}
      <div className={`grid grid-cols-4 h-full ${isMobilePlaying ? "gap-1.5" : "gap-4"}`}>
          {cards.map((card) => (
              <div key={card.id} className={`group relative perspective-1000 transition-all duration-500 ${card.isMatched ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100'}`}>
                  <div className={`relative w-full h-full transition-transform duration-700 preserve-3d cursor-default ${card.isFlipped ? 'rotate-y-180' : ''}`}>
                      <div className={`absolute inset-0 backface-hidden rotate-y-180 bg-white flex items-center justify-center shadow-2xl ${isMobilePlaying ? "rounded-xl border-2 border-purple-500 text-2xl" : "rounded-2xl border-4 border-purple-500 text-5xl"}`}>{card.hiddenContent}</div>
                      <div className={`absolute inset-0 backface-hidden bg-[#f4ecd8] flex flex-col items-center justify-center p-1 text-center shadow-lg group-hover:border-purple-300 transition-colors ${isMobilePlaying ? "rounded-xl border-2 border-zinc-700" : "rounded-2xl border-4 border-zinc-200 p-2"}`}>{!isMobilePlaying && <div className="absolute top-3 left-3 opacity-10"><Zap size={24}/></div>}<span className={`font-serif font-bold text-zinc-800 break-keep ${isMobilePlaying ? "text-sm" : "text-xl md:text-2xl"}`}>{card.triggerWord}</span></div>
                  </div>
              </div>
          ))}
      </div>
    </div>
  );

  const cardInput = (
    <form onSubmit={handleInput} className={isMobilePlaying ? "w-full" : "w-full max-w-2xl mx-auto shrink-0 pb-2"}>
      <input data-typing-input ref={inputRef} type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.nativeEvent.isComposing) { e.preventDefault(); setInputValue(""); } }} readOnly={isLocked} disabled={gameState !== "playing"} className={`w-full text-center font-bold outline-hidden transition-all ${isMobilePlaying ? `h-12 px-4 text-lg bg-zinc-800 text-white rounded-xl border-2 placeholder:text-zinc-500 ${isLocked ? "border-zinc-700 opacity-60" : "border-purple-500"}` : `h-14 md:h-20 px-5 md:px-8 text-xl md:text-4xl bg-white border-4 rounded-2xl md:rounded-2xl shadow-xl ${isLocked ? 'border-zinc-100 opacity-50' : 'border-purple-500 focus:shadow-purple-200/40 focus:ring-4 ring-purple-100'}`}`} placeholder={isLocked ? t("판정 대기 중...") : t("단어 입력 후 엔터!")} autoFocus autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} />
    </form>
  );

  // ── 모바일 풀스크린 몰입 모드 ──
  if (isMobilePlaying && overlay) {
    const exitGame = () => {
      if (confirm(t("게임을 그만하고 결과를 볼까요?"))) handleGameOver();
      else resume();
    };
    const mobileHud = (
      <>
        <span className="flex items-center gap-1"><span className="text-[9px] text-zinc-500 font-bold uppercase">SC</span><span className="text-sm font-bold text-yellow-400 tabular-nums">{score.toLocaleString()}</span></span>
        <span className={`flex items-center gap-1 text-sm font-bold tabular-nums ${timeLeft < 10 ? "text-red-500 animate-pulse" : "text-blue-400"}`}><Timer size={13} />{timeLeft}s</span>
        <span className="flex items-center gap-1"><span className="text-[9px] text-zinc-500 font-bold uppercase">{t("짝")}</span><span className="text-sm font-bold text-green-400 tabular-nums">{cards.filter(c => c.isMatched).length / 2}/8</span></span>
        {combo > 1 && <span className="text-orange-500 font-bold text-xs italic flex items-center gap-0.5 ml-auto"><Flame size={11} fill="currentColor" />{combo}</span>}
      </>
    );
    return (
      <MobileGameShell overlay={overlay} hud={mobileHud} input={cardInput} paused={paused} onResume={resume} onExit={exitGame}>
        {cardBoard}
      </MobileGameShell>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-4 py-2 animate-in fade-in duration-700 h-[calc(100vh-100px)] max-h-[850px] min-h-[650px]">
      {gameState === "gameover" && mounted && createPortal(gameOverModal, document.body)}

      <div className="w-full flex justify-between items-center px-8 py-4 bg-zinc-900 text-white rounded-2xl shadow-xl border border-zinc-800 shrink-0">
        <div className="flex gap-10 items-center">
          <div className="flex flex-col"><span className="text-[9px] text-zinc-500 uppercase font-bold">Score</span><span className="text-2xl font-bold text-yellow-400">{score.toLocaleString()}</span></div>
          <div className="flex flex-col"><span className="text-[9px] text-zinc-500 uppercase font-bold">Time</span><span className={`text-2xl font-bold flex items-center gap-2 ${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-blue-400'}`}><Timer size={20}/> {timeLeft}s</span></div>
          <div className="flex flex-col"><span className="text-[9px] text-zinc-500 uppercase font-bold">Pairs</span><span className="text-2xl font-bold text-green-400">{cards.filter(c => c.isMatched).length / 2} / 8</span></div>
        </div>
        <div className="flex items-center gap-6">
            {combo > 1 && <div className="animate-bounce"><span className="text-orange-500 font-bold text-xl italic flex items-center gap-1"><Flame size={20} fill="currentColor" /> {combo} COMBO</span></div>}
            <div className="text-right hidden sm:block"><div className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest leading-tight">Memory Mode</div><div className="font-bold text-zinc-300 text-sm leading-tight italic">{t("기억력 타자")}</div></div>
        </div>
      </div>

      <div className="w-full flex flex-col lg:flex-row gap-4 flex-1 overflow-hidden min-h-0">
        {cardBoard}

        <div className="w-full lg:w-72 bg-white rounded-2xl border border-zinc-200 p-6 shadow-lg flex flex-col shrink-0">
            <div className="flex items-center gap-2 mb-6"><Trophy className="text-yellow-500" size={20} /><h3 className="text-lg font-bold">{t("기억력 랭킹")}</h3></div>
            <div className="flex-1 space-y-3 overflow-y-auto pr-1 custom-scrollbar">
                {rankingLoading ? (<div className="flex flex-col items-center justify-center py-10"><Loader2 className="animate-spin text-zinc-300" /></div>) : 
                rankings.length > 0 ? rankings.map((rank, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${i === 0 ? 'bg-yellow-400 text-white' : i === 1 ? 'bg-zinc-300 text-zinc-600' : i === 2 ? 'bg-orange-400 text-white' : 'bg-zinc-100 text-zinc-400'}`}>{i + 1}</div>
                        <div className="flex-1 min-w-0"><p className="text-sm font-bold truncate text-zinc-900 leading-tight">{rank.profiles?.nickname || t('익명')}</p><p className="text-[9px] font-bold text-zinc-400">Combo {rank.max_combo}</p></div>
                        <div className="text-right shrink-0"><p className="text-xs font-bold text-purple-600">{rank.score.toLocaleString()}</p></div>
                    </div>
                )) : <div className="text-center py-10 text-zinc-400 text-xs font-medium">{t("기록 없음")}</div>}
            </div>
            {!user && <p className="mt-4 text-[9px] text-zinc-400 font-bold text-center leading-relaxed px-2 animate-pulse">{t("로그인을 하시면 나만의 소중한 기록을")} <br/>{t("실시간 랭킹에 남길 수 있습니다.")}</p>}
            <div className="mt-4 pt-4 border-t border-zinc-100 text-center"><div className="bg-zinc-50 p-3 rounded-xl flex items-center justify-center gap-2"><Star size={14} className="text-blue-600" fill="currentColor" /><span className="font-bold text-xs">{profile?.nickname || 'Guest'}</span></div></div>
        </div>
      </div>

      {cardInput}

      <style jsx global>{`
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
};
