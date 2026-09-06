"use client";
import { useGameAnalytics } from '@/hooks/useGameAnalytics';

import { useGameT } from "@/lib/i18n/game-ui";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Trophy, RotateCcw, Play, Loader2, User, Star, Flame, ChevronRight, TrendingUp, Gauge as GaugeIcon, Volume2, VolumeX } from "lucide-react";
import { SupabaseService } from "@/lib/supabase";
import { getStairWord } from "@/lib/stairs-words";
import { TypingUtils } from "@/lib/typing-speed";
import { useMobileGamePlay } from "@/hooks/useMobileGamePlay";
import { MobileGameShell } from "./MobileGameShell";
import { sound } from "@/lib/sound-manager";
import Image from "next/image";
import Link from "next/link";
import { AdSenseUnit } from "../layout/AdSenseUnit";

// 계단 한 칸의 데이터. type은 나중에 갈림길("branch")·보너스("bonus")를
// 추가할 수 있도록 열어둔다(지금은 normal/milestone만 사용).
type StairType = "normal" | "milestone" | "branch" | "bonus";

interface Stair {
  floor: number;                 // 층수(0층 = 시작 발판)
  direction: "left" | "right";   // 이 칸으로 꺾여 올라온 방향
  col: number;                   // 중심 기준 좌우 칸 오프셋(파생값, 반응형 픽셀 변환)
  word: string;                  // 이 칸에 올라서려면 쳐야 할 단어(0층은 빈 문자열)
  type: StairType;
}

// 지그재그 좌우 폭 제한(중심 기준 ±2칸)
const MAX_COL = 2;

// 병아리 캐릭터 스프라이트 (256x256 투명 PNG, 정면 포즈라 좌우 플립해도 자연스러움)
const CHICK_SPRITES = {
  idle: "/game/stairs/chick-idle.png",
  jump: "/game/stairs/chick-jump.png",
  fall: "/game/stairs/chick-fall.png",
} as const;

// 착지 먼지·플로팅 텍스트·반짝이 등 1회성 이펙트 (표시 후 타이머로 배열에서 제거)
type FxKind = "dust" | "float" | "recover" | "sparkle";
interface Fx {
  id: number;
  kind: FxKind;
  floor: number;   // 이펙트가 붙는 계단 층
  col: number;     // 해당 계단의 칸 오프셋
  label?: string;  // float/recover 텍스트
  strong?: boolean; // float 콤보 강조 여부
}

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

// 레벨 표기·기록용 (15층마다 +1. 출제 난이도는 lib/stairs-words.ts가 층수로 직접 결정)
const levelForFloor = (floor: number) => Math.floor(floor / 15) + 1;

// 직전 계단을 기준으로 다음 계단을 생성한다.
// 방향은 45% 확률로 꺾여 좌우로 번갈아 지그재그를 만들고, 화면 밖으로
// 벗어나지 않도록 ±MAX_COL 경계에서 강제로 방향을 되꺾는다.
const makeNextStair = (prev: Stair): Stair => {
  const floor = prev.floor + 1;
  let direction = prev.direction;
  if (Math.random() < 0.45) direction = direction === "right" ? "left" : "right";

  let col = prev.col + (direction === "right" ? 1 : -1);
  if (col > MAX_COL) { direction = "left"; col = prev.col - 1; }
  else if (col < -MAX_COL) { direction = "right"; col = prev.col + 1; }

  const type: StairType = floor % 50 === 0 ? "milestone" : "normal";
  // 층수 구간별 출제(1~10층 자모 워밍업 → 테마 혼합). 직전 단어와 연속 중복 방지.
  return { floor, direction, col, word: getStairWord(floor, prev.word), type };
};

// 직전 계단부터 count칸을 이어 붙여 배열로 반환
const growStairs = (last: Stair, count: number): Stair[] => {
  const out: Stair[] = [];
  let cur = last;
  for (let i = 0; i < count; i++) { cur = makeNextStair(cur); out.push(cur); }
  return out;
};

export const StairsGame: React.FC = () => {
  const { isEn, t } = useGameT();
  const [gameState, setGameState] = useState<"ready" | "playing" | "gameover">("ready");
  useGameAnalytics('stairs', gameState);
  const [stairs, setStairs] = useState<Stair[]>([]);
  const [floor, setFloor] = useState(0);
  const [gauge, setGauge] = useState(100);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [wordsTyped, setWordsTyped] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [hopping, setHopping] = useState(false);
  const [falling, setFalling] = useState(false);
  const [shaking, setShaking] = useState(false);          // 오타 시 캐릭터 흔들림
  const [fxList, setFxList] = useState<Fx[]>([]);         // 1회성 이펙트(먼지/플로팅/반짝이)
  const [banner, setBanner] = useState<string | null>(null); // 마일스톤 돌파 배너
  const [finalKpm, setFinalKpm] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [muted, setMuted] = useState(false);

  const [rankings, setRankings] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [rankingLoading, setRankingLoading] = useState(false);

  const requestRef = useRef<number | null>(null);
  const startTime = useRef<number>(0);      // 첫 정타 시각(KPM 계산 기준)
  const lastFrame = useRef<number>(0);
  const totalStrokes = useRef<number>(0);   // 누적 타수(KPM용)
  const startedRef = useRef(false);         // 첫 정타 이후에만 게이지 감소
  const gameOverRef = useRef(false);        // 추락/게임오버 중복 방지
  const floorRef = useRef(0);               // rAF 루프에서 최신 층수 참조
  const wasWrong = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const hopTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fallTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shakeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bannerTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fxSeq = useRef(0);
  const pauseStart = useRef<number>(0);

  // 이펙트 등록: ttl(ms) 후 배열에서 제거해 DOM이 쌓이지 않게 한다
  const addFx = (fx: Omit<Fx, "id">, ttl: number) => {
    const id = ++fxSeq.current;
    setFxList((prev) => [...prev, { ...fx, id }]);
    setTimeout(() => setFxList((prev) => prev.filter((f) => f.id !== id)), ttl);
  };

  // 모바일 풀스크린 몰입 모드 (visualViewport 동기화 / 스크롤 잠금 / 포커스 이탈 일시정지)
  const { isMobilePlaying, paused, overlay, resume } =
    useMobileGamePlay({ playing: gameState === "playing", inputRef });

  // 반응형 계단 치수(모바일에선 폭·높이 축소)
  const FH = isMobilePlaying ? 46 : 62;       // 층 높이(px)
  const STEP = isMobilePlaying ? 48 : 62;     // 좌우 한 칸 이동 거리(px)
  const STAIRW = isMobilePlaying ? 78 : 96;   // 계단 발판 폭(px)
  const CHICK = isMobilePlaying ? 52 : 64;    // 캐릭터 스프라이트 크기(px, 계단 폭 비율 유지)

  // 일시정지 동안 KPM 경과시간이 부풀지 않게 startTime을 보정하고,
  // 재개 첫 프레임의 dt 폭주(게이지 급락)를 막기 위해 lastFrame을 리셋한다.
  useEffect(() => {
    if (!paused) return;
    pauseStart.current = performance.now();
    return () => {
      if (startTime.current) startTime.current += performance.now() - pauseStart.current;
      lastFrame.current = 0;
    };
  }, [paused]);

  // 스프라이트 프리로드 — 첫 점프 순간 스왑 시 깜빡임 방지
  // (next/image 대신 일반 img 사용: Vercel 이미지 변형 과금 방지 방침)
  useEffect(() => {
    Object.values(CHICK_SPRITES).forEach((src) => {
      const img = new window.Image();
      img.src = src;
    });
  }, []);

  useEffect(() => {
    setMounted(true);
    setMuted(sound.muted);
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
      const data = await SupabaseService.getGameRankings("stairs");
      setRankings(data);
    } catch (e) { console.error(e); }
    finally { setRankingLoading(false); }
  };

  useEffect(() => {
    if (gameState === "gameover" || gameState === "ready") fetchRankings();
  }, [gameState]);

  // 게이지 감소 루프. 첫 정타 전(ready 직후)에는 감소하지 않고,
  // 감소 속도는 초당 5에서 시작해 층수에 따라 완만히 점증한다.
  // 회복량(정타 시)이 단어 타수에 비례하므로, 감소는 계속 상승시켜
  // 고수도 결국 벽에 부딪히게 해 층수 랭킹이 무한대로 벌어지지 않도록 한다.
  const updateGame = useCallback((time: number) => {
    if (paused) return;
    if (lastFrame.current === 0) lastFrame.current = time;
    const dt = (time - lastFrame.current) / 1000;
    lastFrame.current = time;

    if (startedRef.current && !gameOverRef.current) {
      const drain = Math.min(120, 5 + floorRef.current * 0.09);
      setGauge((g) => Math.max(0, g - drain * dt));
    }

    requestRef.current = requestAnimationFrame(updateGame);
  }, [paused]);

  useEffect(() => {
    if (gameState === "playing" && !paused) requestRef.current = requestAnimationFrame(updateGame);
    else if (requestRef.current) cancelAnimationFrame(requestRef.current);
    return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
  }, [gameState, updateGame, paused]);

  // 게이지가 바닥나면 추락 → 게임오버
  useEffect(() => {
    if (gameState === "playing" && startedRef.current && gauge <= 0 && !gameOverRef.current) {
      triggerGameOver();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gauge, gameState]);

  const triggerGameOver = () => {
    if (gameOverRef.current) return;
    gameOverRef.current = true;
    sound.thud(); // 추락음
    setFalling(true); // 캐릭터 추락 애니메이션
    fallTimer.current = setTimeout(() => finalizeGameOver(), 700);
  };

  const finalizeGameOver = async () => {
    const seconds = startTime.current ? (performance.now() - startTime.current) / 1000 : 0;
    const kpm = seconds > 0 ? Math.round((totalStrokes.current / seconds) * 60) : 0;
    setFinalKpm(kpm);
    setGameState("gameover");
    if (user) {
      try {
        await SupabaseService.saveGameScore("stairs", floorRef.current, levelForFloor(floorRef.current), maxCombo);
        await fetchRankings(); // 방금 저장한 기록까지 반영해 다시 로드
      } catch (e) {
        console.error("게임 점수 저장 실패:", e);
      }
    }
  };

  const target = stairs[floor + 1];             // 다음에 올라설 계단
  const targetWord = target?.word ?? "";
  const isWrongNow = inputValue.length > 0 && targetWord.length > 0 && !targetWord.startsWith(inputValue);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length > inputValue.length) sound.tick(); // 키 입력 틱
    setInputValue(value);
    if (gameState !== "playing" || !target) return;

    if (value === target.word) {
      // 정타 → 한 칸 점프
      if (!startedRef.current) { startedRef.current = true; startTime.current = performance.now(); lastFrame.current = 0; }
      const newFloor = floor + 1;
      setFloor(newFloor);
      floorRef.current = newFloor;
      const strokes = TypingUtils.getStrokeCount(target.word);
      totalStrokes.current += strokes;
      setWordsTyped((n) => n + 1);

      const newCombo = combo + 1;
      setCombo(newCombo);
      if (newCombo > maxCombo) setMaxCombo(newCombo);

      // 게이지 회복: 친 단어의 타수에 비례(긴 단어일수록 더 많이 회복)해서
      // 91층 이후 긴 단어가 순손실이 되던 '절벽'을 없앤다. 콤보 5·10·20 보너스.
      const recover = Math.max(6, strokes * 3.9);
      const comboBonus = newCombo === 5 || newCombo === 10 || newCombo === 20 ? 8 : 0;
      setGauge((g) => Math.min(100, g + recover + comboBonus));

      setInputValue("");
      wasWrong.current = false;

      // 점프 애니메이션 + 점프 스프라이트 (착지 = 카메라 transition과 같은 250ms 후 idle 복귀)
      setHopping(true);
      if (hopTimer.current) clearTimeout(hopTimer.current);
      hopTimer.current = setTimeout(() => setHopping(false), 250);

      // 등반 효과음 (콤보가 오를수록 피치 상승)
      sound.blip({ freq: 500 + Math.min(newCombo, 24) * 16, type: "triangle", dur: 0.09, vol: 0.09, slideTo: 780 + Math.min(newCombo, 24) * 22 });

      // 착지 이펙트: 먼지 퍼프 + "+1층" 플로팅 + 실제 게이지 회복량 플로팅
      addFx({ kind: "dust", floor: newFloor, col: target.col }, 900);
      addFx({ kind: "float", floor: newFloor, col: target.col, label: newCombo >= 5 ? `+1층 x${newCombo}콤보` : "+1층", strong: newCombo >= 5 }, 1000);
      addFx({ kind: "recover", floor: newFloor, col: target.col, label: `+${Math.round(recover + comboBonus)}` }, 1000);

      // 50층 단위 마일스톤: 깃발 반짝이 + 돌파 배너
      if (target.type === "milestone") {
        addFx({ kind: "sparkle", floor: newFloor, col: target.col }, 1100);
        sound.milestone();
        setBanner(`${newFloor}층 돌파!`);
        if (bannerTimer.current) clearTimeout(bannerTimer.current);
        bannerTimer.current = setTimeout(() => setBanner(null), 800);
      }

      // 위쪽 계단이 부족하면 미리 이어 붙인다(무한 생성)
      setStairs((prev) => prev.length < newFloor + 16
        ? [...prev, ...growStairs(prev[prev.length - 1], newFloor + 18 - prev.length)]
        : prev);
      return;
    }

    // 오타 감지: 현재 입력이 목표 단어의 접두어가 아니면 틀린 상태
    const isWrong = value.length > 0 && !target.word.startsWith(value);
    if (isWrong && !wasWrong.current) {
      setCombo(0);
      setMistakes((m) => m + 1);
      sound.land(); // 오타 피드백(하강 톤)
      // 캐릭터 좌우 흔들림 피드백 (입력창 rose 테두리와 함께)
      setShaking(true);
      if (shakeTimer.current) clearTimeout(shakeTimer.current);
      shakeTimer.current = setTimeout(() => setShaking(false), 300);
    }
    wasWrong.current = isWrong;
  };

  const startGame = () => {
    sound.initSynth(); // 첫 제스처에서 오디오 컨텍스트 준비(합성음만)
    const base: Stair = { floor: 0, direction: "right", col: 0, word: "", type: "normal" };
    const arr: Stair[] = [base, ...growStairs(base, 25)];
    setStairs(arr);
    setFloor(0); floorRef.current = 0;
    setGauge(100); setCombo(0); setMaxCombo(0); setMistakes(0); setWordsTyped(0);
    setInputValue(""); setHopping(false); setFalling(false);
    setShaking(false); setFxList([]); setBanner(null);
    totalStrokes.current = 0; startedRef.current = false; gameOverRef.current = false;
    wasWrong.current = false; startTime.current = 0; lastFrame.current = 0;
    if (hopTimer.current) clearTimeout(hopTimer.current);
    if (fallTimer.current) clearTimeout(fallTimer.current);
    if (shakeTimer.current) clearTimeout(shakeTimer.current);
    if (bannerTimer.current) clearTimeout(bannerTimer.current);
    setGameState("playing");
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const accuracy = TypingUtils.calculateAccuracy(wordsTyped, wordsTyped + mistakes);
  const level = levelForFloor(floor);

  // 게이지 잔량에 따른 색상(emerald → amber → rose)
  const gaugeColor = gauge > 55 ? "bg-emerald-500" : gauge > 25 ? "bg-amber-500" : "bg-rose-500";
  const gaugeText = gauge > 55 ? "text-emerald-400" : gauge > 25 ? "text-amber-400" : "text-rose-400";

  // 배경 하늘 레이어 불투명도(층수 구간별로 부드럽게 전환)
  const oSunset = clamp01((floor - 22) / 16);
  const oNight = clamp01((floor - 68) / 20);
  const oSpace = clamp01((floor - 140) / 24);

  // ── 계단 스테이지(모바일/데스크톱 공용) ──
  const from = Math.max(0, floor - 5);
  const to = floor + 13;
  const visible = stairs.slice(from, to + 1);
  const cameraY = floor * FH;

  const playerCol = stairs[floor]?.col ?? 0;
  // 진행 방향에 따라 좌우 플립 — 왼쪽으로 올라갈 땐 왼쪽을 보게 해 생동감을 준다
  const flip = (stairs[floor]?.direction ?? "right") === "left" ? " scaleX(-1)" : "";
  const playerTransform = falling
    ? "translateY(60vh) rotate(720deg)"
    : `translateY(${hopping ? "-112%" : "-100%"}) scale(${hopping ? 1.15 : 1})${flip}`;
  // 상태별 스프라이트: 추락 > 점프 > 대기
  const chickSprite = falling ? CHICK_SPRITES.fall : hopping ? CHICK_SPRITES.jump : CHICK_SPRITES.idle;

  const inDanger = gameState === "playing" && gauge < 30; // 위험 경고(펄스·비네트) 기준

  const stage = (
    <div className={`relative overflow-hidden ${isMobilePlaying ? "w-full h-full" : `flex-1 min-h-[240px] rounded-2xl md:rounded-2xl border-4 border-zinc-900 ${gameState === "ready" ? "min-h-[430px]" : ""}`}`}>
      {/* 이펙트 키프레임 (DOM/CSS 전용, 캔버스 미사용) */}
      <style>{`
        @keyframes stairs-dust { 0% { opacity: 0; transform: translate(-50%, 0) scale(.5); } 25% { opacity: .9; } 100% { opacity: 0; transform: translate(calc(-50% + var(--dx, 0px)), -8px) scale(1.5); } }
        @keyframes stairs-float { 0% { opacity: 0; transform: translate(-50%, 0); } 15% { opacity: 1; } 100% { opacity: 0; transform: translate(-50%, -42px); } }
        @keyframes stairs-sparkle { 0% { opacity: 0; transform: translate(-50%, -50%) scale(.4); } 30% { opacity: 1; } 100% { opacity: 0; transform: translate(calc(-50% + var(--sx, 0px)), calc(-50% + var(--sy, 0px))) scale(1.2); } }
        @keyframes stairs-bounce { 0% { transform: translateY(0) scaleY(1); } 40% { transform: translateY(3px) scaleY(.75); } 100% { transform: translateY(0) scaleY(1); } }
        @keyframes stairs-shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-6px); } 50% { transform: translateX(5px); } 75% { transform: translateX(-3px); } }
        @keyframes stairs-banner { 0% { opacity: 0; transform: scale(.6); } 20% { opacity: 1; transform: scale(1.05); } 32% { transform: scale(1); } 80% { opacity: 1; } 100% { opacity: 0; transform: scale(1); } }
      `}</style>
      {/* 배경 하늘 레이어 (지상 → 노을 → 밤하늘 → 우주) */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg,#38bdf8 0%,#bae6fd 55%,#dcfce7 100%)" }} />
      <div className="absolute inset-0 transition-opacity duration-1000" style={{ opacity: oSunset, background: "linear-gradient(180deg,#f97316 0%,#fb7185 55%,#fbcfe8 100%)" }} />
      <div className="absolute inset-0 transition-opacity duration-1000" style={{ opacity: oNight, background: "linear-gradient(180deg,#1e1b4b 0%,#312e81 55%,#4338ca 100%)" }} />
      <div className="absolute inset-0 transition-opacity duration-1000" style={{ opacity: oSpace, background: "linear-gradient(180deg,#020617 0%,#0f172a 60%,#1e1b4b 100%)" }} />
      {/* 우주 별밭 */}
      <div className="absolute inset-0 transition-opacity duration-1000" style={{ opacity: oSpace, backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)", backgroundSize: "44px 44px" }} />

      {gameState === "ready" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm z-20 p-4">
          <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-6 max-w-sm w-full border border-zinc-200">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600"><Play size={32} fill="currentColor" className="ml-1" /></div>
            <div className="text-center"><h3 className="text-2xl font-bold text-zinc-900 mb-1">{t("글자 계단")}</h3><p className="text-zinc-500 text-xs font-medium">{t("다음 계단의 단어를 정확히 입력해 한 칸씩 올라가세요! 처음 10층은 자음·모음 워밍업, 게이지가 바닥나기 전에 최대한 높이 오르세요.")}</p></div>
            <button onClick={startGame} className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white text-lg font-bold rounded-xl transition-all shadow-xl">{t("게임 시작")}</button>
          </div>
        </div>
      )}

      {/* 카메라(캐릭터를 따라 위로 스크롤) */}
      <div className="absolute left-1/2 top-[62%]" style={{ transform: `translateY(${cameraY}px)`, transition: "transform 0.25s ease-out" }}>
        {visible.map((s) => {
          const isTarget = s.floor === floor + 1;
          const preview = s.floor - floor; // 2~3층 위 미리보기
          const isPast = s.floor < floor;
          const isMilestone = s.type === "milestone";
          return (
            <div key={s.floor} className="absolute flex flex-col items-center" style={{ left: s.col * STEP, top: -s.floor * FH, transform: "translateX(-50%)" }}>
              {/* 단어 배지 (다음 목표는 강조, 위쪽 층은 흐리게 미리보기) */}
              {s.floor >= 1 && s.floor >= floor && (
                <div
                  className={`absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap px-2.5 py-1 rounded-lg text-xs md:text-sm font-bold transition-all ${
                    isTarget
                      ? "bg-emerald-500 text-white ring-2 ring-emerald-200 shadow-lg shadow-emerald-500/50 scale-110"
                      : "bg-white/85 text-zinc-800 border border-zinc-300"
                  }`}
                  style={preview >= 2 ? { opacity: preview === 2 ? 0.6 : preview === 3 ? 0.4 : 0.25 } : undefined}
                >
                  {s.word}
                </div>
              )}
              {/* 마일스톤 깃발 */}
              {isMilestone && (
                <div className="absolute bottom-full mb-9 left-1/2 -translate-x-1/2 flex flex-col items-center text-[10px] font-bold text-amber-100">
                  <span className="text-lg leading-none">🚩</span>
                  <span className="px-1.5 py-0.5 rounded bg-amber-500/90 text-white">{s.floor}{isEn ? " floors" : "층"}</span>
                </div>
              )}
              {/* 계단 발판 (착지한 칸은 살짝 눌렸다 올라오는 bounce) */}
              <div
                className={`rounded-md border-b-4 ${
                  isMilestone
                    ? "bg-amber-400 border-amber-600"
                    : isTarget
                    ? "bg-emerald-100 border-emerald-400"
                    : isPast
                    ? "bg-zinc-300/80 border-zinc-500/80"
                    : "bg-white/90 border-zinc-400"
                }`}
                style={{ width: STAIRW, height: isMobilePlaying ? 13 : 16, transformOrigin: "bottom center", animation: hopping && s.floor === floor ? "stairs-bounce 0.25s ease-out" : undefined }}
              />
            </div>
          );
        })}

        {/* 캐릭터 (일반 img 사용 — Vercel 이미지 변형 과금 방지 방침) */}
        <div className="absolute" style={{ left: playerCol * STEP, top: -floor * FH, transform: "translateX(-50%)", transition: "left 0.25s ease-out, top 0.25s ease-out" }}>
          {/* 오타 shake는 별도 래퍼에서 — img의 점프/추락 transform과 충돌 방지 */}
          <div style={{ animation: shaking ? "stairs-shake 0.3s ease-in-out" : undefined }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={chickSprite}
              alt={t("병아리 캐릭터")}
              draggable={false}
              className="drop-shadow-lg select-none pointer-events-none"
              style={{ width: CHICK, height: CHICK, maxWidth: "none", transform: playerTransform, transition: falling ? "transform 0.65s cubic-bezier(.5,0,1,1)" : "transform 0.15s ease-out", transformOrigin: "bottom center" }}
            />
          </div>
        </div>

        {/* 1회성 이펙트 레이어 (계단 좌표 기준 0x0 앵커, ttl 후 상태 배열에서 제거) */}
        {fxList.map((fx) => (
          <div key={fx.id} className="absolute pointer-events-none z-10" style={{ left: fx.col * STEP, top: -fx.floor * FH }}>
            {/* 착지 먼지 퍼프: 발밑에서 좌우로 퍼지며 소멸 (착지 시점에 맞춰 0.22s 지연) */}
            {fx.kind === "dust" && ["-20px", "20px", "0px"].map((dx, i) => (
              <span key={i} className="absolute rounded-full bg-white/80" style={{ width: 8, height: 8, left: 0, top: -5, "--dx": dx, animation: "stairs-dust 0.45s ease-out 0.22s both" } as React.CSSProperties} />
            ))}
            {/* "+1층" 플로팅 (콤보 5 이상이면 콤보 수 포함 + 색상 강조) */}
            {fx.kind === "float" && (
              <span className={`absolute whitespace-nowrap font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] ${fx.strong ? "text-amber-300 text-base md:text-lg" : "text-white text-sm md:text-base"}`} style={{ left: 0, top: -(CHICK + 16), animation: "stairs-float 0.9s ease-out both" }}>
                {fx.label}
              </span>
            )}
            {/* 게이지 회복량 플로팅 (실제 회복 수치, 초록색) */}
            {fx.kind === "recover" && (
              <span className="absolute whitespace-nowrap font-bold text-emerald-300 text-xs md:text-sm drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]" style={{ left: 36, top: -(CHICK + 2), animation: "stairs-float 0.9s ease-out 0.08s both" }}>
                {fx.label}
              </span>
            )}
            {/* 마일스톤 반짝이: 깃발 주변으로 ✦가 흩어짐 */}
            {fx.kind === "sparkle" && ([["-26px", "-46px"], ["24px", "-52px"], ["-12px", "-72px"], ["18px", "-28px"]] as const).map(([sx, sy], i) => (
              <span key={i} className="absolute text-amber-200 text-sm md:text-base" style={{ left: 0, top: -46, "--sx": sx, "--sy": sy, animation: `stairs-sparkle 0.7s ease-out ${0.22 + i * 0.06}s both` } as React.CSSProperties}>✦</span>
            ))}
          </div>
        ))}
      </div>

      {/* 스테이지 상단 게이지 오버레이 — 플레이 시야 안에서 잔량·회복이 바로 보이게 */}
      {gameState !== "ready" && (
        <div className="absolute top-0 inset-x-0 z-10 px-3 pt-3">
          <div className={`relative w-full h-3 rounded-full bg-black/40 backdrop-blur-sm overflow-hidden ${inDanger ? "animate-pulse" : ""}`}>
            <div className={`h-full rounded-full transition-all duration-150 ${gaugeColor}`} style={{ width: `${Math.max(0, gauge)}%` }} />
          </div>
        </div>
      )}

      {/* 위험 경고 비네트 (게이지 30% 미만 시 가장자리 붉은 그림자) */}
      <div className={`absolute inset-0 z-[5] pointer-events-none transition-opacity duration-500 ${inDanger ? "opacity-100 animate-pulse" : "opacity-0"}`} style={{ boxShadow: "inset 0 0 70px 24px rgba(244,63,94,0.4)" }} />

      {/* 마일스톤 돌파 배너 (0.8초) */}
      {banner && (
        <div className="absolute inset-x-0 top-1/3 z-20 flex justify-center pointer-events-none">
          <div className="px-6 py-3 rounded-2xl bg-amber-500/95 text-white text-xl md:text-2xl font-bold shadow-2xl" style={{ animation: "stairs-banner 0.8s ease-out both" }}>
            🚩 {banner}
          </div>
        </div>
      )}

      {/* 현재 층 표시(게이지 바 아래 좌측) */}
      {gameState !== "ready" && (
        <div className="absolute top-8 left-3 z-10 px-3 py-1.5 rounded-xl bg-black/40 backdrop-blur-sm text-white font-bold text-sm md:text-base flex items-center gap-1.5">
          <TrendingUp size={16} /> {floor}층
        </div>
      )}
    </div>
  );

  const gaugeBar = (compact = false) => (
    <div className={`relative w-full ${compact ? "h-2.5" : "h-4"} rounded-full bg-zinc-800 overflow-hidden ${inDanger ? "animate-pulse" : ""}`}>
      <div className={`h-full rounded-full transition-all duration-150 ${gaugeColor}`} style={{ width: `${Math.max(0, gauge)}%` }} />
    </div>
  );

  const gameInput = (
    <input data-typing-input ref={inputRef} type="text" value={inputValue} onChange={handleInputChange} onKeyDown={(e) => { if (e.key === "Enter" && !e.nativeEvent.isComposing) { e.preventDefault(); setInputValue(""); } }} disabled={gameState !== "playing"} className={`w-full text-center font-bold outline-hidden transition-all ${isMobilePlaying ? `h-12 px-4 text-lg bg-zinc-800 text-white rounded-xl border-2 placeholder:text-zinc-500 ${isWrongNow ? "border-rose-500" : "border-zinc-700 focus:border-emerald-500"}` : `h-14 md:h-20 px-5 md:px-8 text-xl md:text-4xl bg-white border-4 rounded-2xl md:rounded-2xl shadow-xl ${gameState === "playing" ? (isWrongNow ? "border-rose-500" : "border-zinc-900 focus:border-emerald-500") : "border-zinc-100 opacity-50"}`}`} placeholder={gameState === "playing" ? t("다음 계단의 단어를 입력!") : t("준비가 되면 시작하세요")} autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} />
  );

  // 게임오버 팝업 (Portal)
  const gameOverModal = gameState === "gameover" && (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-xl animate-in fade-in duration-500" />
      <div className="relative max-w-lg w-full max-h-[90vh] overflow-y-auto no-scrollbar bg-white rounded-2xl p-8 shadow-2xl text-center border border-zinc-200 animate-in zoom-in duration-500">
        <div className="inline-flex p-6 bg-emerald-50 rounded-full mb-8"><Trophy className="w-20 h-20 text-yellow-500" /></div>
        <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs mb-1">{t("도달 층수")}</p>
        <h2 className="text-6xl font-bold text-zinc-900 mb-2 tracking-tighter">{floor}{isEn ? " floors" : "층"}</h2>
        <p className="text-zinc-500 font-bold mb-10">
          {floor >= 100 ? t("구름 위까지! 대단한 등반이었어요.") : floor >= 50 ? t("절반의 고지를 넘었어요. 한 번 더!") : t("발끝이 근질근질하죠? 다시 올라볼까요?")}
        </p>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-100"><p className="text-[10px] font-bold text-zinc-400 uppercase mb-1 tracking-widest">Max Combo</p><p className="text-3xl font-bold text-zinc-900">{maxCombo}</p></div>
          <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-100"><p className="text-[10px] font-bold text-zinc-400 uppercase mb-1 tracking-widest">{t("분당 타수")}</p><p className="text-3xl font-bold text-emerald-600">{finalKpm}</p></div>
        </div>
        <p className="text-sm font-bold text-zinc-400 mb-8">{TypingUtils.getGrade(finalKpm, accuracy)}</p>
        {!user ? (
          <div className="mb-10 p-8 bg-blue-50 rounded-2xl border border-blue-100"><p className="text-sm font-bold text-blue-600 mb-6 flex items-center justify-center gap-2"><Star size={16} fill="currentColor" /> {t("랭킹에 이름을 남기고 싶으신가요?")}</p><button onClick={() => SupabaseService.signInWithKakao()} className="w-full py-5 bg-[#FEE500] text-black font-bold rounded-2xl flex items-center justify-center gap-3 hover:opacity-90 transition-all shadow-xl active:scale-95"><svg viewBox="0 0 24 24" className="w-6 h-6 fill-current"><path d="M12 3c-5.5 0-10 3.5-10 7.8 0 2.8 1.8 5.3 4.5 6.6l-1.1 4.1c-.1.5.4.8.8.6l4.8-3.2c.3 0 .7.1 1 .1 5.5 0 10-3.5 10-7.8S17.5 3 12 3" /></svg>{t("3초 만에 로그인하고 기록 저장")}</button></div>
        ) : (
          <div className="mb-10 p-6 bg-green-50 rounded-2xl border border-green-100 flex items-center justify-center gap-3 animate-pulse"><Star size={20} className="text-green-600" fill="currentColor" /><p className="text-sm font-bold text-green-600">{t("방금 세운 기록이 랭킹에 성공적으로 반영되었습니다!")}</p></div>
        )}
        <div className="mb-6 flex justify-center empty:hidden">
          <AdSenseUnit label="content-banner-mobile" width={320} height={100} tight />
        </div>
        <div className="flex flex-col gap-4">
          <button onClick={startGame} className="w-full py-5 bg-zinc-900 text-white text-xl font-bold rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl flex items-center justify-center gap-3"><RotateCcw size={24} /> {t("다시 도전하기")}</button>
          <Link prefetch={false} href={isEn ? "/en/game" : "/game"} className="flex items-center justify-center gap-2 text-zinc-400 font-bold text-sm hover:text-zinc-600 transition-colors">{t("목록으로 돌아가기")} <ChevronRight size={16} /></Link>
        </div>
      </div>
    </div>
  );

  // ── 모바일 풀스크린 몰입 모드 ──
  if (isMobilePlaying && overlay) {
    const exitGame = () => {
      if (confirm(t("등반을 그만하고 결과를 볼까요?"))) triggerGameOver();
      else resume();
    };
    const mobileHud = (
      <>
        <span className="flex items-center gap-1"><span className="text-[9px] text-zinc-500 font-bold uppercase">{t("층")}</span><span className="text-sm font-bold text-emerald-400 tabular-nums">{floor}</span></span>
        <span className="flex-1 min-w-[60px] max-w-[140px] flex items-center gap-1"><GaugeIcon size={12} className={gaugeText} />{gaugeBar(true)}</span>
        {combo > 1 && <span className="text-orange-500 font-bold text-xs italic flex items-center gap-0.5 ml-auto"><Flame size={11} fill="currentColor" />{combo}</span>}
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => setMuted(sound.toggleMuted())} aria-label={t("음소거")} className={`shrink-0 text-zinc-400 ${combo > 1 ? "" : "ml-auto"}`}>
          {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
        </button>
      </>
    );
    return (
      <MobileGameShell overlay={overlay} hud={mobileHud} input={gameInput} paused={paused} onResume={resume} onExit={exitGame}>
        {stage}
      </MobileGameShell>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-2 md:gap-4 py-2 animate-in fade-in duration-700 h-[calc(100dvh-140px)] md:h-[calc(100vh-100px)] max-h-[800px] min-h-[420px] md:min-h-[650px]">
      {gameState === "gameover" && mounted && createPortal(gameOverModal, document.body)}

      {/* Game Dashboard (데스크톱 ≥lg) — 게이지 바를 크게 배치 */}
      <div className="hidden lg:flex w-full items-center gap-6 px-4 md:px-8 py-3 md:py-4 bg-zinc-900 text-white rounded-2xl md:rounded-2xl shadow-xl border border-zinc-800 shrink-0">
        <div className="flex flex-col shrink-0"><span className="text-[9px] text-zinc-500 uppercase font-bold mb-0.5">Floor</span><span className="text-2xl font-bold text-emerald-400 flex items-center gap-1"><TrendingUp size={20} />{floor}{isEn ? " floors" : "층"}</span></div>
        <div className="flex flex-col shrink-0"><span className="text-[9px] text-zinc-500 uppercase font-bold mb-0.5">Level</span><span className="text-2xl font-bold text-blue-400">{level}</span></div>
        <div className="flex-1 flex flex-col gap-1 min-w-0">
          <span className={`text-[9px] uppercase font-bold flex items-center gap-1 ${gaugeText}`}><GaugeIcon size={12} /> {t("남은 게이지")} {Math.round(gauge)}%</span>
          {gaugeBar()}
        </div>
        <div className="flex items-center gap-4 shrink-0">
          {combo > 1 && <div className="animate-bounce"><span className="text-orange-500 font-bold text-lg italic flex items-center gap-1"><Flame size={16} fill="currentColor" /> {combo}</span></div>}
          <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => setMuted(sound.toggleMuted())} aria-label={t("음소거 토글")} className="w-9 h-9 rounded-xl bg-zinc-800 text-zinc-300 flex items-center justify-center hover:bg-zinc-700 transition-colors shrink-0">
            {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <div className="h-8 w-px bg-zinc-800 hidden sm:block"></div>
          <div className="text-right hidden sm:block"><div className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest leading-tight">Climbing Mode</div><div className="font-bold text-zinc-300 text-sm leading-tight">{t("글자 계단")}</div></div>
        </div>
      </div>

      <div className="w-full flex flex-col lg:flex-row gap-4 flex-1 overflow-hidden min-h-0">
        {/* Main Column: Stage + Input */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          {stage}
          <div className="w-full shrink-0">{gameInput}</div>
        </div>

        {/* Rankings Sidebar (모바일에서는 숨김) */}
        <div className="hidden lg:flex w-full lg:w-72 bg-white rounded-2xl border border-zinc-200 p-6 shadow-lg flex-col shrink-0">
          <div className="flex items-center gap-2 mb-6"><Trophy className="text-yellow-500" size={20} /><h3 className="text-lg font-bold">{t("최고 층수 랭킹")}</h3></div>
          <div className="flex-1 space-y-3 overflow-y-auto pr-1 custom-scrollbar">
            {rankingLoading ? (<div className="flex flex-col items-center justify-center py-10 gap-2"><Loader2 className="animate-spin text-zinc-300" size={20} /></div>) :
              rankings.length > 0 ? rankings.map((rank, i) => (
                <div key={i} className="flex items-center gap-3 group">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${i === 0 ? "bg-yellow-400 text-white" : i === 1 ? "bg-zinc-300 text-zinc-600" : i === 2 ? "bg-orange-400 text-white" : "bg-zinc-100 text-zinc-400"}`}>{i + 1}</div>
                  <div className="flex-1 flex items-center gap-2 min-w-0">
                    {rank.profiles?.avatar_url ? <Image src={rank.profiles.avatar_url} alt="p" width={24} height={32} className="w-6 h-6 rounded-lg object-cover aspect-square" /> : <div className="w-6 h-6 bg-zinc-50 rounded-lg flex items-center justify-center text-zinc-400"><User size={12} /></div>}
                    <div className="min-w-0"><p className="text-sm font-bold truncate text-zinc-900 leading-tight">{rank.profiles?.nickname || t("익명")}</p><p className="text-[9px] font-bold text-zinc-400">Lv.{rank.level}</p></div>
                  </div>
                  <div className="text-right shrink-0"><p className="text-sm font-bold text-emerald-600">{rank.score.toLocaleString()}{isEn ? " floors" : "층"}</p></div>
                </div>
              )) : <div className="text-center py-10 text-zinc-400 text-xs font-medium">{t("기록 없음")}</div>}
          </div>
          {!user && (
            <p className="mt-4 text-[9px] text-zinc-400 font-bold text-center leading-relaxed px-2 animate-pulse">
              {t("로그인을 하시면 나만의 소중한 기록을")} <br />{t("실시간 랭킹에 남길 수 있습니다.")}
            </p>
          )}
          <div className="mt-4 pt-4 border-t border-zinc-100 text-center"><div className="bg-zinc-50 p-3 rounded-xl flex items-center justify-center gap-2"><Star size={14} className="text-emerald-600" fill="currentColor" /><span className="font-bold text-xs">{profile?.nickname || "Guest"}</span></div></div>
        </div>
      </div>
    </div>
  );
};
