"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";

type WordType = "normal" | "bomb" | "ice" | "gold";

interface FallingWord {
  id: number;
  text: string;
  x: number;
  y: number;
  speed: number;
  type: WordType;
}

const WORDS = ["사과", "바나나", "포도", "딸기", "수박", "오렌지", "키위", "멜론", "참외", "복숭아", "자두", "체리", "망고", "레몬", "라임"];

export const WordGame: React.FC = () => {
  const [fallingWords, setFallingWords] = useState<FallingWord[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameState, setGameState] = useState<"ready" | "playing" | "gameover">("ready");
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>(null);
  const lastSpawnTime = useRef<number>(0);

  const spawnWord = useCallback(() => {
    if (!gameAreaRef.current) return;
    const width = gameAreaRef.current.clientWidth;
    
    // 특수 단어 확률 (15%)
    const rand = Math.random();
    let type: WordType = "normal";
    let text = WORDS[Math.floor(Math.random() * WORDS.length)];

    if (rand > 0.95) {
      type = "bomb";
      text = "💣 폭탄";
    } else if (rand > 0.90) {
      type = "ice";
      text = "❄️ 얼음";
    } else if (rand > 0.85) {
      type = "gold";
      text = "✨ 황금";
    }

    const newWord: FallingWord = {
      id: Date.now(),
      text,
      x: Math.random() * (width - 100),
      y: -50,
      speed: (1 + Math.random() * 1.5 + (score / 2000)) * speedMultiplier,
      type
    };
    setFallingWords((prev) => [...prev, newWord]);
  }, [score, speedMultiplier]);

  const updateGame = useCallback((time: number) => {
    if (gameState !== "playing") return;

    const spawnInterval = Math.max(500, 2000 - (score / 5));
    if (time - lastSpawnTime.current > spawnInterval) {
      spawnWord();
      lastSpawnTime.current = time;
    }

    setFallingWords((prev) => {
      const nextWords = prev.map((w) => ({ ...w, y: w.y + w.speed }));
      const height = gameAreaRef.current?.clientHeight || 600;
      const missed = nextWords.filter((w) => w.y > height);
      
      if (missed.length > 0) {
        // 일반 단어를 놓쳤을 때만 생명 차감
        const normalMissed = missed.filter(w => w.type === "normal");
        if (normalMissed.length > 0) {
          setLives((l) => Math.max(0, l - normalMissed.length));
        }
      }

      return nextWords.filter((w) => w.y <= height);
    });

    requestRef.current = requestAnimationFrame(updateGame);
  }, [gameState, score, spawnWord]);

  useEffect(() => {
    if (gameState === "playing") {
      requestRef.current = requestAnimationFrame(updateGame);
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameState, updateGame]);

  useEffect(() => {
    if (lives <= 0) {
      setGameState("gameover");
    }
  }, [lives]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    const matchedWord = fallingWords.find((w) => 
      w.text === value || (w.text.includes(" ") && w.text.split(" ")[1] === value)
    );

    if (matchedWord) {
      setFallingWords((prev) => prev.filter((w) => w.id !== matchedWord.id));
      setInputValue("");

      // 특수 효과 적용 (Flutter 프로젝트 로직 이식)
      switch (matchedWord.type) {
        case "bomb":
          setFallingWords([]); 
          setScore((s) => s + 500);
          break;
        case "ice":
          setSpeedMultiplier(0.4); 
          setTimeout(() => setSpeedMultiplier(1), 5000); 
          setScore((s) => s + 200);
          break;
        case "gold":
          setScore((s) => s + 1000);
          break;
        default:
          setScore((s) => s + 100);
      }
    }
  };

  const startGame = () => {
    setFallingWords([]);
    setScore(0);
    setLives(3);
    setSpeedMultiplier(1);
    setGameState("playing");
    lastSpawnTime.current = performance.now();
  };

  return (
    <div className="w-full max-w-4xl h-[70vh] flex flex-col items-center gap-4">
      <div className="w-full flex justify-between items-center px-8 py-4 bg-gray-800 text-white rounded-t-xl shadow-lg">
        <div className="flex gap-6 items-center">
          <div className="flex flex-col">
            <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">Score</span>
            <span className="text-2xl font-black text-yellow-400">{score}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">Lives</span>
            <span className="text-2xl">{Array(3).fill(0).map((_, i) => (
                <span key={i} className={i < lives ? "text-red-500" : "text-gray-600"}>❤️</span>
            ))}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
            {speedMultiplier < 1 && (
                <span className="px-3 py-1 bg-blue-500 text-white text-xs font-bold rounded-full animate-pulse">❄️ SLOW MOTION</span>
            )}
            <div className="text-right">
                <div className="text-xs text-gray-400">ARCADE MODE</div>
                <div className="font-bold text-sm">산성비 : 특수 아이템</div>
            </div>
        </div>
      </div>

      <div 
        ref={gameAreaRef}
        className="relative w-full flex-1 bg-slate-900 overflow-hidden rounded-b-xl border-4 border-gray-800 shadow-inner"
        style={{ backgroundImage: 'radial-gradient(circle, #1e293b 1px, transparent 1px)', backgroundSize: '40px 40px' }}
      >
        {gameState === "ready" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm z-20">
            <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-6 transform transition-all hover:scale-105">
                <div className="text-4xl">🎮</div>
                <h3 className="text-2xl font-black text-gray-800">단어 낙하 게임</h3>
                <p className="text-gray-500 text-center text-sm">특수 아이템(폭탄, 얼음, 황금)을 <br/>활용해 높은 점수를 획득하세요!</p>
                <button 
                onClick={startGame}
                className="px-12 py-4 bg-blue-600 hover:bg-blue-700 text-white text-xl font-black rounded-2xl transition-all shadow-lg active:scale-95"
                >
                게임 시작
                </button>
            </div>
          </div>
        )}

        {gameState === "gameover" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/80 backdrop-blur-md z-20 p-8">
            <div className="max-w-md w-full bg-white rounded-3xl p-10 shadow-2xl text-center">
                <h2 className="text-5xl font-black text-red-600 mb-2">GAME OVER</h2>
                <div className="h-1 w-20 bg-gray-100 mx-auto mb-8"></div>
                <div className="bg-gray-50 rounded-2xl p-6 mb-8">
                    <div className="text-gray-400 text-sm font-bold mb-1 uppercase">Final Score</div>
                    <div className="text-5xl font-black text-gray-800">{score}</div>
                </div>
                <button 
                onClick={startGame}
                className="w-full py-4 bg-zinc-900 text-white text-xl font-bold rounded-2xl hover:bg-zinc-800 transition-all shadow-lg active:scale-95"
                >
                다시 도전하기
                </button>
            </div>
          </div>
        )}

        {fallingWords.map((word) => (
          <div 
            key={word.id}
            className={`absolute px-4 py-2 rounded-xl shadow-xl font-black text-lg whitespace-nowrap transition-transform flex items-center gap-2 ${
                word.type === 'bomb' ? 'bg-red-500 text-white animate-bounce' :
                word.type === 'ice' ? 'bg-blue-400 text-white animate-pulse' :
                word.type === 'gold' ? 'bg-yellow-400 text-gray-900 border-2 border-yellow-200 scale-110' :
                'bg-white text-slate-900'
            }`}
            style={{ 
              left: `${word.x}px`, 
              top: `${word.y}px`,
              borderBottom: word.type === 'normal' ? '4px solid #cbd5e1' : 'none'
            }}
          >
            {word.text}
          </div>
        ))}
      </div>

      <div className="w-full max-w-md">
        <input 
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          disabled={gameState !== "playing"}
          className="w-full h-16 px-8 text-2xl text-center bg-white border-4 border-gray-800 rounded-2xl outline-hidden focus:border-blue-500 transition-all shadow-2xl placeholder:text-gray-300"
          placeholder={gameState === "playing" ? "단어를 입력하세요!" : "준비되셨나요?"}
          autoFocus
        />
      </div>
    </div>
  );
};
