'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Trophy,
  RotateCcw,
  Play,
  Loader2,
  User,
  Star,
  Zap,
  Flame,
  Keyboard,
  X,
  Send,
  CloudSnow,
  ChevronRight,
} from 'lucide-react';
import { SupabaseService, supabase } from '@/lib/supabase';
import Image from 'next/image';
import Link from 'next/link';

const EASY_WORDS = [
  '안녕',
  '감사',
  '사랑',
  '행복',
  '가족',
  '친구',
  '학교',
  '책',
  '연필',
  '공부',
  '숙제',
  '시험',
  '점심',
  '저녁',
  '아침',
  '물',
  '음식',
  '과일',
  '야채',
  '고기',
  '생선',
  '우유',
  '빵',
  '집',
  '차',
  '버스',
  '봄',
  '여름',
  '가을',
  '겨울',
  '엄마',
  '아빠',
  '형',
  '누나',
  '동생',
  '숫자',
  '하나',
  '둘',
  '셋',
  '넷',
  '다섯',
];
const MEDIUM_WORDS = [
  '선생님',
  '학생',
  '지하철',
  '비행기',
  '날씨',
  '컴퓨터',
  '스마트폰',
  '텔레비전',
  '냉장고',
  '에어컨',
  '운동',
  '영화',
  '음악',
  '여행',
  '요리',
  '도서관',
  '박물관',
  '미술관',
  '운동장',
  '수영장',
  '놀이공원',
  '할머니',
  '할아버지',
  '통일',
  '평화',
  '자유',
  '민주주의',
  '인권',
  '정의',
  '평등',
  '사회',
  '문화',
  '경제',
  '정치',
  '교육',
  '과학',
  '미래',
  '발전',
  '변화',
  '혁신',
  '창의',
  '아이디어',
];
const HARD_WORDS = [
  '인공지능',
  '가상현실',
  '블록체인',
  '사물인터넷',
  '빅데이터',
  '클라우드컴퓨팅',
  '머신러닝',
  '딥러닝',
  '양자컴퓨터',
  '사이버보안',
  '로봇공학',
  '나노기술',
  '생명공학',
  '신재생에너지',
  '우주탐사',
  '환경보호',
  '지속가능발전',
  '글로벌화',
  '다문화사회',
  '심리학',
  '사회학',
  '인류학',
  '생태학',
  '유전학',
  '천문학',
  '지구과학',
  '기후변화',
  '물리학',
  '화학',
];
const IDIOMS = [
  '일석이조',
  '사면초가',
  '동분서주',
  '천변만화',
  '고진감래',
  '금상첨화',
  '막상막하',
  '부화뇌동',
  '수구초심',
  '역지사지',
  '온고지신',
  '우공이산',
  '일거양득',
  '전화위복',
  '주객전도',
  '천우신조',
  '호시탐탐',
  '화룡점정',
  '괄목상대',
  '노심초사',
  '각골난망',
  '결초보은',
  '고장난명',
  '군계일학',
  '다다익선',
  '대기만성',
  '새옹지마',
];

type ItemType = 'normal' | 'bomb' | 'ice' | 'gold';
type ObstacleType = 'normal' | 'hidden' | 'blinking' | 'moving';

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
  const [fallingWords, setFallingWords] = useState<FallingWord[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(5);
  const [level, setLevel] = useState(1);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [isSlowed, setIsSlowed] = useState(false);
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'gameover'>(
    'ready'
  );
  const [mounted, setMounted] = useState(false);

  const [rankings, setRankings] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [rankingLoading, setRankingLoading] = useState(false);

  const gameAreaRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number | null>(null);
  const lastSpawnTime = useRef<number>(0);
  const speedMultiplierRef = useRef<number>(1);

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
      const data = await SupabaseService.getGameRankings('acid-rain');
      setRankings(data);
    } catch (e) {
      console.error(e);
    } finally {
      setRankingLoading(false);
    }
  };

  useEffect(() => {
    if (gameState === 'gameover' || gameState === 'ready') fetchRankings();
  }, [gameState]);

  const getWordForLevel = useCallback((currentLevel: number) => {
    if (currentLevel <= 2)
      return EASY_WORDS[Math.floor(Math.random() * EASY_WORDS.length)];
    if (currentLevel <= 4)
      return MEDIUM_WORDS[Math.floor(Math.random() * MEDIUM_WORDS.length)];
    if (currentLevel <= 6)
      return HARD_WORDS[Math.floor(Math.random() * HARD_WORDS.length)];
    return Math.random() > 0.5
      ? HARD_WORDS[Math.floor(Math.random() * HARD_WORDS.length)]
      : IDIOMS[Math.floor(Math.random() * IDIOMS.length)];
  }, []);

  const getObstacleTypeForLevel = useCallback(
    (currentLevel: number): ObstacleType => {
      if (currentLevel <= 2) return 'normal';
      if (currentLevel <= 4) return Math.random() < 0.2 ? 'hidden' : 'normal';
      if (currentLevel <= 6) return Math.random() < 0.3 ? 'blinking' : 'normal';
      const rand = Math.random();
      if (rand < 0.25) return 'hidden';
      if (rand < 0.5) return 'blinking';
      if (rand < 0.7) return 'moving';
      return 'normal';
    },
    []
  );

  const spawnWord = useCallback(
    (time: number) => {
      if (!gameAreaRef.current) return;
      const width = gameAreaRef.current.clientWidth;
      const itemRand = Math.random();
      let itemType: ItemType = 'normal';
      let text = getWordForLevel(level);

      if (itemRand > 0.97) {
        itemType = 'bomb';
        text = '💣 폭탄';
      } else if (itemRand > 0.94) {
        itemType = 'ice';
        text = '❄️ 얼음';
      } else if (itemRand > 0.91) {
        itemType = 'gold';
        text = '✨ 황금';
      }

      const obstacleType =
        itemType === 'normal' ? getObstacleTypeForLevel(level) : 'normal';

      const newWord: FallingWord = {
        id: Date.now() + Math.random(),
        text,
        x: Math.random() * (width - 140) + 20,
        y: -50,
        speed: 0.8 + Math.random() * 0.5 + level * 0.15,
        itemType,
        obstacleType,
        movingDir: Math.random() > 0.5 ? 1 : -1,
        createdAt: time,
        isVisible: true,
      };
      setFallingWords((prev) => [...prev, newWord]);
    },
    [level, getWordForLevel, getObstacleTypeForLevel]
  );

  const updateGame = useCallback(
    (time: number) => {
      if (gameState !== 'playing') return;

      const spawnDelay = Math.max(800, 3000 - level * 250);
      if (time - lastSpawnTime.current > spawnDelay) {
        spawnWord(time);
        lastSpawnTime.current = time;
      }

      setFallingWords((prev) => {
        const height = gameAreaRef.current?.clientHeight || 600;
        const width = gameAreaRef.current?.clientWidth || 800;
        let missedCount = 0;

        const nextWords = prev
          .map((w) => {
            let newX = w.x;
            let newDir = w.movingDir;
            let newVis = true;

            if (w.obstacleType === 'moving') {
              newX += newDir * 1.5 * speedMultiplierRef.current;
              const wordWidth = w.text.length * 20 + 40;
              if (newX <= 10 || newX >= width - wordWidth) newDir *= -1;
            }

            const age = time - w.createdAt;
            if (age > 2500) {
              if (w.obstacleType === 'hidden') newVis = false;
              if (w.obstacleType === 'blinking')
                newVis = Math.floor(age / 400) % 2 === 0;
            }

            return {
              ...w,
              y: w.y + w.speed * speedMultiplierRef.current,
              x: newX,
              movingDir: newDir,
              isVisible: newVis,
            };
          })
          .filter((w) => {
            if (w.y > height) {
              if (w.itemType === 'normal') missedCount++;
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
    },
    [gameState, level, spawnWord]
  );

  useEffect(() => {
    if (gameState === 'playing')
      requestRef.current = requestAnimationFrame(updateGame);
    else if (requestRef.current) cancelAnimationFrame(requestRef.current);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameState, updateGame]);

  useEffect(() => {
    if (lives <= 0 && gameState === 'playing') handleGameOver();
  }, [lives, gameState]);

  const handleGameOver = async () => {
    setGameState('gameover');
    if (user)
      await SupabaseService.saveGameScore('acid-rain', score, level, maxCombo);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    const matchedWord = fallingWords.find(
      (w) =>
        w.text === value ||
        (w.text.includes(' ') && w.text.split(' ')[1] === value)
    );

    if (matchedWord) {
      setFallingWords((prev) => prev.filter((w) => w.id !== matchedWord.id));
      setInputValue('');
      const newCombo = combo + 1;
      setCombo(newCombo);
      if (newCombo > maxCombo) setMaxCombo(newCombo);
      const comboBonus = Math.floor(newCombo / 5) * 30;

      let gainedScore = 0;
      switch (matchedWord.itemType) {
        case 'bomb':
          setFallingWords([]);
          gainedScore = 500;
          break;
        case 'ice':
          speedMultiplierRef.current = 0.3;
          setIsSlowed(true);
          setTimeout(() => {
            speedMultiplierRef.current = 1;
            setIsSlowed(false);
          }, 5000);
          gainedScore = 200;
          break;
        case 'gold':
          gainedScore = 1000 + comboBonus;
          break;
        default:
          gainedScore = 100 + comboBonus;
      }
      const newTotalScore = score + gainedScore;
      setScore(newTotalScore);
      if (newTotalScore >= level * 500) setLevel((prev) => prev + 1);
    }
  };

  const startGame = () => {
    setFallingWords([]);
    setScore(0);
    setLives(5);
    setLevel(1);
    setCombo(0);
    setMaxCombo(0);
    speedMultiplierRef.current = 1;
    setGameState('playing');
    lastSpawnTime.current = performance.now();
  };

  // 게임 종료 팝업 (Portal)
  const gameOverModal = gameState === 'gameover' && (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-xl animate-in fade-in duration-500" />
      <div className="relative max-w-lg w-full bg-white dark:bg-zinc-900 rounded-[3.5rem] p-12 shadow-2xl text-center border border-zinc-200 dark:border-zinc-800 animate-in zoom-in duration-500">
        <div className="inline-flex p-6 bg-red-50 dark:bg-red-900/20 rounded-full mb-8">
          <Trophy className="w-20 h-20 text-yellow-500" />
        </div>
        <h2 className="text-5xl font-black text-zinc-900 dark:text-zinc-100 mb-2 tracking-tighter">
          GAME OVER
        </h2>
        <p className="text-zinc-500 dark:text-zinc-400 font-bold mb-10">
          최고의 집중력을 보여주셨네요!
        </p>
        <div className="grid grid-cols-2 gap-4 mb-10">
          <div className="bg-zinc-50 dark:bg-zinc-800 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800">
            <p className="text-[10px] font-black text-zinc-400 uppercase mb-1 tracking-widest">
              Final Score
            </p>
            <p className="text-3xl font-black text-zinc-900 dark:text-zinc-100">
              {score.toLocaleString()}
            </p>
          </div>
          <div className="bg-zinc-50 dark:bg-zinc-800 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800">
            <p className="text-[10px] font-black text-zinc-400 uppercase mb-1 tracking-widest">
              Max Combo
            </p>
            <p className="text-3xl font-black text-zinc-900 dark:text-zinc-100">
              {maxCombo}
            </p>
          </div>
        </div>
        {!user ? (
          <div className="mb-10 p-8 bg-blue-50 dark:bg-blue-900/20 rounded-[2.5rem] border border-blue-100 dark:border-blue-900/30">
            <p className="text-sm font-bold text-blue-600 mb-6 flex items-center justify-center gap-2">
              <Zap size={16} fill="currentColor" /> 랭킹에 이름을 남기고
              싶으신가요?
            </p>
            <button
              onClick={() => SupabaseService.signInWithKakao()}
              className="w-full py-5 bg-[#FEE500] text-black font-black rounded-2xl flex items-center justify-center gap-3 hover:opacity-90 transition-all shadow-xl active:scale-95"
            >
              <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
                <path d="M12 3c-5.5 0-10 3.5-10 7.8 0 2.8 1.8 5.3 4.5 6.6l-1.1 4.1c-.1.5.4.8.8.6l4.8-3.2c.3 0 .7.1 1 .1 5.5 0 10-3.5 10-7.8S17.5 3 12 3" />
              </svg>
              3초 만에 로그인하고 기록 저장
            </button>
          </div>
        ) : (
          <div className="mb-10 p-6 bg-green-50 dark:bg-green-900/20 rounded-[2rem] border border-green-100 dark:border-green-900/30 flex items-center justify-center gap-3 animate-pulse">
            <Star size={20} className="text-green-600" fill="currentColor" />
            <p className="text-sm font-black text-green-600">
              방금 세운 기록이 랭킹에 성공적으로 반영되었습니다!
            </p>
          </div>
        )}
        <div className="flex flex-col gap-4">
          <button
            onClick={startGame}
            className="w-full py-5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xl font-black rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl flex items-center justify-center gap-3"
          >
            <RotateCcw size={24} /> 다시 도전하기
          </button>
          <Link
            href="/game"
            className="flex items-center justify-center gap-2 text-zinc-400 font-black text-sm hover:text-zinc-600 transition-colors"
          >
            목록으로 돌아가기 <ChevronRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col items-center gap-4 py-2 animate-in fade-in duration-700 h-[calc(100vh-100px)] max-h-[800px] min-h-[600px]">
      {gameState === 'gameover' &&
        mounted &&
        createPortal(gameOverModal, document.body)}

      {/* Game Dashboard (Height Reduced) */}
      <div className="w-full flex justify-between items-center px-8 py-4 bg-zinc-900 text-white rounded-[2rem] shadow-xl border border-zinc-800 shrink-0">
        <div className="flex gap-8 items-center">
          <div className="flex flex-col">
            <span className="text-[9px] text-zinc-500 uppercase font-black mb-0.5">
              Score
            </span>
            <span className="text-2xl font-black text-yellow-400">
              {score.toLocaleString()}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] text-zinc-500 uppercase font-black mb-0.5">
              Level
            </span>
            <span className="text-2xl font-black text-blue-400">{level}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] text-zinc-500 uppercase font-black mb-0.5">
              Health
            </span>
            <div className="flex gap-0.5">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <span
                    key={i}
                    className={`text-lg transition-all ${
                      i < lives
                        ? 'grayscale-0 scale-110'
                        : 'grayscale opacity-20 scale-90'
                    }`}
                  >
                    ❤️
                  </span>
                ))}
            </div>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-4">
          {isSlowed && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg animate-pulse border border-blue-500/30">
              <CloudSnow size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">
                Slow
              </span>
            </div>
          )}
          {combo > 1 && (
            <div className="animate-bounce">
              <span className="text-orange-500 font-black text-lg italic flex items-center gap-1">
                <Flame size={16} fill="currentColor" /> {combo}
              </span>
            </div>
          )}
          <div className="h-8 w-px bg-zinc-800"></div>
          <div className="text-right">
            <div className="text-[9px] text-zinc-500 font-black uppercase tracking-widest leading-tight">
              Arcade Mode
            </div>
            <div className="font-black text-zinc-300 text-sm leading-tight">
              한글 산성비
            </div>
          </div>
        </div>
      </div>

      <div className="w-full flex flex-col lg:flex-row gap-4 flex-1 overflow-hidden min-h-0">
        {/* Game Area (Flex-1 to fill remaining space) */}
        <div
          ref={gameAreaRef}
          className={`relative flex-1 bg-zinc-950 overflow-hidden rounded-[2.5rem] border-4 ${
            isSlowed
              ? 'border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]'
              : 'border-zinc-900'
          } transition-all duration-500`}
          style={{
            backgroundImage:
              'radial-gradient(circle, #18181b 1px, transparent 1px)',
            backgroundSize: '30px 30px',
          }}
        >
          {gameState === 'ready' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-20 p-4">
              <div className="bg-white dark:bg-zinc-900 p-8 rounded-[3rem] shadow-2xl flex flex-col items-center gap-6 max-w-sm w-full border border-zinc-200 dark:border-zinc-800">
                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-[1.5rem] flex items-center justify-center text-blue-600">
                  <Play size={32} fill="currentColor" className="ml-1" />
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 mb-1">
                    산성비 게임
                  </h3>
                  <p className="text-zinc-500 dark:text-zinc-400 text-xs font-medium">
                    노트북 화면에 최적화된 모드입니다.
                  </p>
                </div>
                <button
                  onClick={startGame}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-black rounded-xl transition-all shadow-xl"
                >
                  게임 시작
                </button>
              </div>
            </div>
          )}
          {fallingWords.map((word) => (
            <div
              key={word.id}
              className={`absolute px-4 py-2 rounded-xl shadow-xl font-black text-lg whitespace-nowrap flex items-center gap-2 ${
                !word.isVisible
                  ? 'bg-zinc-900 text-zinc-600 border-b-4 border-zinc-800 scale-95 opacity-50'
                  : 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border-b-4 border-zinc-200 dark:border-zinc-700'
              }`}
              style={{ left: `${word.x}px`, top: `${word.y}px` }}
            >
              {word.isVisible ? word.text : '???'}
            </div>
          ))}
        </div>

        {/* Rankings (Compressed for Notebook) */}
        <div className="w-full lg:w-72 bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 p-6 shadow-lg flex flex-col shrink-0">
          <div className="flex items-center gap-2 mb-6">
            <Trophy className="text-yellow-500" size={20} />
            <h3 className="text-lg font-black">실시간 랭킹</h3>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto pr-1 custom-scrollbar">
            {rankingLoading ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <Loader2 className="animate-spin text-zinc-300" size={20} />
              </div>
            ) : rankings.length > 0 ? (
              rankings.map((rank, i) => (
                <div key={i} className="flex items-center gap-3 group">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                      i === 0
                        ? 'bg-yellow-400 text-white'
                        : i === 1
                        ? 'bg-zinc-300 text-zinc-600'
                        : i === 2
                        ? 'bg-orange-400 text-white'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {i + 1}
                  </div>
                  <div className="flex-1 flex items-center gap-2 min-w-0">
                    {rank.profiles?.avatar_url ? (
                      <Image
                        src={rank.profiles.avatar_url}
                        alt="p"
                        width={24}
                        height={32}
                        className="w-6 h-6 rounded-lg object-cover aspect-square"
                      />
                    ) : (
                      <div className="w-6 h-6 bg-zinc-50 dark:bg-zinc-800 rounded-lg flex items-center justify-center text-zinc-400">
                        <User size={12} />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-black truncate text-zinc-900 dark:text-zinc-100">
                        {rank.profiles?.nickname || '익명'}
                      </p>
                      <p className="text-[9px] font-bold text-zinc-400">
                        Lv.{rank.level}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-black text-blue-600">
                      {rank.score.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-zinc-400 text-xs font-medium">
                기록 없음
              </div>
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 text-center">
            <div className="bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-xl flex items-center justify-center gap-2">
              <Star size={14} className="text-blue-600" fill="currentColor" />
              <span className="font-black text-xs">
                {profile?.nickname || 'Guest'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Input Area (Centered & Compact) */}
      <div className="w-full max-w-lg shrink-0 pb-2">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          disabled={gameState !== 'playing'}
          className={`w-full h-16 px-8 text-3xl bg-white dark:bg-zinc-900 border-4 rounded-[2rem] shadow-xl outline-hidden text-center font-black transition-all ${
            gameState === 'playing'
              ? 'border-zinc-900 dark:border-zinc-100 focus:border-blue-500'
              : 'border-zinc-100 dark:border-zinc-800 opacity-50'
          }`}
          placeholder={
            gameState === 'playing'
              ? '단어를 입력하세요!'
              : '준비가 되면 시작하세요'
          }
          autoFocus
          autoComplete="off"
        />
      </div>
    </div>
  );
};
