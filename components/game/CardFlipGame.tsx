"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Trophy, RotateCcw, Play, Loader2, Star, Zap, Flame, Brain, Timer, ChevronRight, Keyboard } from "lucide-react";
import { SupabaseService } from "@/lib/supabase";
import { KeyboardRecommendationBanner } from "../layout/KeyboardRecommendationBanner";
import Image from "next/image";
import Link from "next/link";

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
  const [cards, setCards] = useState<Card[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [isLocked, setIsLocked] = useState(false);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(180);
  const [gameState, setGameState] = useState<"ready" | "playing" | "gameover">("ready");
  const [mounted, setMounted] = useState(false);
  
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [rankings, setRankings] = useState<any[]>([]);
  const [rankingLoading, setRankingLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

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

  // 타이머 루프
  useEffect(() => {
    let timer: any;
    if (gameState === "playing" && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0 && gameState === "playing") {
      handleGameOver();
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft]);

  // 모든 짝을 맞췄는지 체크
  useEffect(() => {
    if (gameState === "playing" && cards.length > 0 && cards.every(c => c.isMatched)) {
      handleGameOver();
    }
  }, [cards, gameState]);

  const handleGameOver = async () => {
    setGameState("gameover");
    if (user) {
      await SupabaseService.saveGameScore("card-flip", score, 1, maxCombo);
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
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-xl animate-in fade-in duration-500" />
        <div className="relative max-w-lg w-full bg-white dark:bg-zinc-900 rounded-[3.5rem] p-12 shadow-2xl text-center border border-zinc-200 dark:border-zinc-800 animate-in zoom-in duration-500">
            <div className="inline-flex p-6 bg-purple-50 dark:bg-purple-900/20 rounded-full mb-8"><Brain className="w-20 h-20 text-purple-500" /></div>
            <h2 className="text-5xl font-black text-zinc-900 dark:text-zinc-100 mb-2 tracking-tighter">FINISH!</h2>
            <p className="text-zinc-500 dark:text-zinc-400 font-bold mb-10">{timeLeft > 0 ? "놀라운 기억력입니다!" : "시간이 다 되었습니다. 다시 도전해보세요!"}</p>
            <div className="grid grid-cols-2 gap-4 mb-10">
                <div className="bg-zinc-50 dark:bg-zinc-800 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800"><p className="text-[10px] font-black text-zinc-400 uppercase mb-1 tracking-widest">Score</p><p className="text-3xl font-black text-zinc-900 dark:text-zinc-100">{score.toLocaleString()}</p></div>
                <div className="bg-zinc-50 dark:bg-zinc-800 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800"><p className="text-[10px] font-black text-zinc-400 uppercase mb-1 tracking-widest">Max Combo</p><p className="text-3xl font-black text-zinc-900 dark:text-zinc-100">{maxCombo}</p></div>
            </div>
            {!user ? (
                <div className="mb-6 p-8 bg-blue-50 dark:bg-blue-900/20 rounded-[2.5rem] border border-blue-100 dark:border-blue-900/30"><p className="text-sm font-bold text-blue-600 mb-6 flex items-center justify-center gap-2"><Zap size={16} fill="currentColor" /> 기록을 남겨보세요!</p><button onClick={() => SupabaseService.signInWithKakao()} className="w-full py-5 bg-[#FEE500] text-black font-black rounded-2xl flex items-center justify-center gap-3 hover:opacity-90 transition-all shadow-xl active:scale-95"><svg viewBox="0 0 24 24" className="w-6 h-6 fill-current"><path d="M12 3c-5.5 0-10 3.5-10 7.8 0 2.8 1.8 5.3 4.5 6.6l-1.1 4.1c-.1.5.4.8.8.6l4.8-3.2c.3 0 .7.1 1 .1 5.5 0 10-3.5 10-7.8S17.5 3 12 3" /></svg>3초 만에 로그인하고 저장</button></div>
            ) : <div className="mb-6 text-sm font-black text-green-600 animate-pulse">랭킹에 기록이 성공적으로 등록되었습니다!</div>}
            
            <KeyboardRecommendationBanner 
              variant="light" 
              className="!mt-0 mb-6 !p-4 !rounded-3xl border border-zinc-100" 
              title="반응 속도가 아쉬우신가요?"
              description="당신의 기억력과 타자 속도를 뒷받침할 게이밍 키보드 컬렉션"
            />

            <button onClick={initGame} className="w-full py-5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xl font-black rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl flex items-center justify-center gap-3"><RotateCcw size={24} /> 다시 시작하기</button>
        </div>
    </div>
  );

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-4 py-2 animate-in fade-in duration-700 h-[calc(100vh-100px)] max-h-[850px] min-h-[650px]">
      {gameState === "gameover" && mounted && createPortal(gameOverModal, document.body)}

      <div className="w-full flex justify-between items-center px-8 py-4 bg-zinc-900 text-white rounded-[2rem] shadow-xl border border-zinc-800 shrink-0">
        <div className="flex gap-10 items-center">
          <div className="flex flex-col"><span className="text-[9px] text-zinc-500 uppercase font-black">Score</span><span className="text-2xl font-black text-yellow-400">{score.toLocaleString()}</span></div>
          <div className="flex flex-col"><span className="text-[9px] text-zinc-500 uppercase font-black">Time</span><span className={`text-2xl font-black flex items-center gap-2 ${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-blue-400'}`}><Timer size={20}/> {timeLeft}s</span></div>
          <div className="flex flex-col"><span className="text-[9px] text-zinc-500 uppercase font-black">Pairs</span><span className="text-2xl font-black text-green-400">{cards.filter(c => c.isMatched).length / 2} / 8</span></div>
        </div>
        <div className="flex items-center gap-6">
            {combo > 1 && <div className="animate-bounce"><span className="text-orange-500 font-black text-xl italic flex items-center gap-1"><Flame size={20} fill="currentColor" /> {combo} COMBO</span></div>}
            <div className="text-right hidden sm:block"><div className="text-[9px] text-zinc-500 font-black uppercase tracking-widest leading-tight">Memory Mode</div><div className="font-black text-zinc-300 text-sm leading-tight italic">기억력 타자</div></div>
        </div>
      </div>

      <div className="w-full flex flex-col lg:flex-row gap-4 flex-1 overflow-hidden min-h-0">
        <div className="flex-1 bg-zinc-100 dark:bg-zinc-950 rounded-[2.5rem] p-6 border-4 border-zinc-200 dark:border-zinc-900 relative overflow-hidden">
            {gameState === "ready" && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-30 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-zinc-900 p-10 rounded-[3rem] shadow-2xl flex flex-col items-center gap-8 max-w-sm w-full border border-zinc-200 dark:border-zinc-800">
                        <div className="w-20 h-20 bg-purple-50 dark:bg-purple-900/20 rounded-[2rem] flex items-center justify-center text-purple-600 shadow-xl"><Brain size={40} /></div>
                        <div className="text-center"><h3 className="text-3xl font-black text-zinc-900 dark:text-zinc-100 mb-2 leading-tight">기억력 타자</h3><p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">카드 뒷면의 단어를 치면 뒤집힙니다.<br/>기억력을 발휘해 짝을 맞추세요!</p></div>
                        <button onClick={initGame} className="w-full py-5 bg-purple-600 hover:bg-purple-700 text-white text-xl font-black rounded-2xl transition-all shadow-xl shadow-purple-200 dark:shadow-none">게임 시작</button>
                    </div>
                </div>
            )}
            <div className="grid grid-cols-4 gap-4 h-full">
                {cards.map((card, idx) => (
                    <div key={card.id} className={`group relative perspective-1000 transition-all duration-500 ${card.isMatched ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100'}`}>
                        <div className={`relative w-full h-full transition-transform duration-700 preserve-3d cursor-default ${card.isFlipped ? 'rotate-y-180' : ''}`}>
                            <div className="absolute inset-0 backface-hidden rotate-y-180 bg-white dark:bg-zinc-800 rounded-3xl border-4 border-purple-500 flex items-center justify-center text-5xl shadow-2xl">{card.hiddenContent}</div>
                            <div className="absolute inset-0 backface-hidden bg-[#f4ecd8] dark:bg-zinc-900 rounded-3xl border-4 border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center p-2 text-center shadow-lg group-hover:border-purple-300 transition-colors"><div className="absolute top-3 left-3 opacity-10"><Zap size={24}/></div><span className="font-serif font-black text-zinc-800 dark:text-zinc-300 text-xl md:text-2xl break-keep">{card.triggerWord}</span></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        <div className="w-full lg:w-72 bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 p-6 shadow-lg flex flex-col shrink-0">
            <div className="flex items-center gap-2 mb-6"><Trophy className="text-yellow-500" size={20} /><h3 className="text-lg font-black">기억력 랭킹</h3></div>
            <div className="flex-1 space-y-3 overflow-y-auto pr-1 custom-scrollbar">
                {rankingLoading ? (<div className="flex flex-col items-center justify-center py-10"><Loader2 className="animate-spin text-zinc-300" /></div>) : 
                rankings.length > 0 ? rankings.map((rank, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${i === 0 ? 'bg-yellow-400 text-white' : i === 1 ? 'bg-zinc-300 text-zinc-600' : i === 2 ? 'bg-orange-400 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'}`}>{i + 1}</div>
                        <div className="flex-1 min-w-0"><p className="text-sm font-black truncate text-zinc-900 dark:text-zinc-100 leading-tight">{rank.profiles?.nickname || '익명'}</p><p className="text-[9px] font-bold text-zinc-400">Combo {rank.max_combo}</p></div>
                        <div className="text-right shrink-0"><p className="text-xs font-black text-purple-600">{rank.score.toLocaleString()}</p></div>
                    </div>
                )) : <div className="text-center py-10 text-zinc-400 text-xs font-medium">기록 없음</div>}
            </div>
            {!user && <p className="mt-4 text-[9px] text-zinc-400 font-bold text-center leading-relaxed px-2 animate-pulse">로그인을 하시면 나만의 소중한 기록을 <br/>실시간 랭킹에 남길 수 있습니다.</p>}
            <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 text-center"><div className="bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-xl flex items-center justify-center gap-2"><Star size={14} className="text-blue-600" fill="currentColor" /><span className="font-black text-xs">{profile?.nickname || 'Guest'}</span></div></div>
        </div>
      </div>

      <form onSubmit={handleInput} className="w-full max-w-2xl mx-auto shrink-0 pb-2">
        <input ref={inputRef} type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} disabled={isLocked || gameState !== "playing"} className={`w-full h-20 px-8 text-4xl bg-white dark:bg-zinc-900 border-4 rounded-[2rem] shadow-xl outline-hidden text-center font-black transition-all ${isLocked ? 'border-zinc-100 opacity-50' : 'border-purple-500 focus:shadow-purple-200/40 focus:ring-4 ring-purple-100'}`} placeholder={isLocked ? "판정 대기 중..." : "카드 뒷면의 단어를 입력!"} autoFocus autoComplete="off" />
      </form>

      <style jsx global>{`
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
};
