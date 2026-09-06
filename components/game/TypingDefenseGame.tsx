"use client";
import { useGameAnalytics } from '@/hooks/useGameAnalytics';

import { useGameT, waveLabel, waveClearLabel } from "@/lib/i18n/game-ui";

import React, { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowRight,
  Castle,
  Heart,
  Keyboard,
  Loader2,
  RotateCcw,
  Shield,
  Sparkles,
  Swords,
  Trophy,
  Volume2,
  VolumeX,
  Wrench,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { SupabaseService } from "@/lib/supabase";
import { useMobileGamePlay } from "@/hooks/useMobileGamePlay";
import { MobileGameShell } from "./MobileGameShell";
import { AdSenseUnit } from "../layout/AdSenseUnit";
import { sound } from "@/lib/sound-manager";
import {
  EnemyVariant,
  TYPING_DEFENSE_BASE_GATE_HEALTH,
  TYPING_DEFENSE_SKILLS,
  TypingDefenseCommandResult,
  TypingDefenseEnemy,
  TypingDefenseEngine,
  TypingDefenseState,
  UpgradeId,
  UpgradeOption,
} from "@/lib/typing-defense-engine";

const ASSET = "/game/castle-defense";
const ARROW_MS = 150;
const HIT_STOP_MS = 60;

type GameState = "ready" | "playing" | "gameover";

interface GameRanking {
  score: number;
  level: number;
  max_combo: number;
  created_at?: string;
  profiles?: { nickname?: string | null; avatar_url?: string | null } | null;
}
interface ProfileSummary {
  nickname?: string | null;
}

// ── 이펙트 시스템 ──────────────────────────────────────────
type Effect =
  | { id: number; kind: "arrow"; fromX: number; fromY: number; toX: number; toY: number; angle: number }
  | { id: number; kind: "death"; x: number; y: number; variant: EnemyVariant }
  | { id: number; kind: "dust"; x: number; y: number; dx: number; dy: number }
  | { id: number; kind: "float"; x: number; y: number; label: string; color: string }
  | { id: number; kind: "lightning"; lane: number }
  | { id: number; kind: "gateBanner"; label: string; color: string };

// 유니온에 대해 분배적으로 id를 제거 (Omit이 유니온을 뭉개는 문제 회피)
type DistributiveOmit<T, K extends keyof never> = T extends unknown ? Omit<T, K> : never;
type EffectInput = DistributiveOmit<Effect, "id">;

const SKILL_META: Record<(typeof TYPING_DEFENSE_SKILLS)[number], { icon: React.ElementType; desc: string; color: string }> = {
  번개: { icon: Zap, desc: "붐비는 라인 정리", color: "text-yellow-500" },
  방패: { icon: Shield, desc: "피해 1회 방어", color: "text-blue-500" },
  수리: { icon: Wrench, desc: "성문 +2 회복", color: "text-green-500" },
};

const ENEMY_SHEET: Record<EnemyVariant, string> = {
  red: `${ASSET}/enemy_red_warrior_run.png`,
  purple: `${ASSET}/enemy_purple_warrior_run.png`,
  black: `${ASSET}/enemy_black_warrior_run.png`,
};

// (lane, distance) → 전장 내 퍼센트 좌표
function posOf(lane: number, distance: number) {
  const x = [16.666, 50, 83.333][lane] ?? 50;
  const y = 10 + (1 - distance) * 62; // distance 1 → 10%, 0 → 72% (상단 라벨 잘림 방지)
  return { x, y };
}
const GATE_ORIGIN = { x: 50, y: 82 };

function normalizeRankings(value: unknown): GameRanking[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is GameRanking => !!item && typeof item === "object" && typeof (item as GameRanking).score === "number");
}
function normalizeProfile(value: unknown): ProfileSummary | null {
  if (!value || typeof value !== "object") return null;
  return { nickname: (value as ProfileSummary).nickname ?? null };
}

const initialEngine = new TypingDefenseEngine();

export const TypingDefenseGame: React.FC = () => {
  const { isEn, t } = useGameT();
  const engineRef = useRef(initialEngine);
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);
  const hitStopUntilRef = useRef(0);
  const nextEffectIdRef = useRef(0);
  const hasSavedScoreRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const battlefieldRef = useRef<HTMLDivElement>(null);

  // 이전 프레임 비교용
  const prevGateRef = useRef(TYPING_DEFENSE_BASE_GATE_HEALTH);
  const prevWaveRef = useRef(1);
  const prevPhaseRef = useRef<TypingDefenseState["wavePhase"]>("spawning");

  const [snapshot, setSnapshot] = useState<TypingDefenseState>(engineRef.current.state);
  const [gameState, setGameState] = useState<GameState>("ready");
  useGameAnalytics('castle-defense', gameState);
  const [inputValue, setInputValue] = useState("");
  const [targetId, setTargetId] = useState<number | null>(null);
  const [effects, setEffects] = useState<Effect[]>([]);
  const [waveBanner, setWaveBanner] = useState<string | null>(null);
  const [muted, setMutedState] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profile, setProfile] = useState<ProfileSummary | null>(null);
  const [rankings, setRankings] = useState<GameRanking[]>([]);
  const [rankingLoading, setRankingLoading] = useState(false);

  const { isMobile, isMobilePlaying, paused, overlay, resume } = useMobileGamePlay({ playing: gameState === "playing", inputRef });
  const pausedRef = useRef(false);
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  // ── 이펙트 추가/제거 ──
  const addEffect = useCallback((effect: EffectInput, ttl: number) => {
    const id = nextEffectIdRef.current++;
    setEffects((cur) => [...cur, { ...effect, id } as Effect]);
    window.setTimeout(() => setEffects((cur) => cur.filter((e) => e.id !== id)), ttl);
    return id;
  }, []);

  const triggerShake = useCallback((strong = false) => {
    const el = battlefieldRef.current;
    if (!el) return;
    const amp = strong ? 8 : 4;
    el.animate(
      [
        { transform: "translate(0,0)" },
        { transform: `translate(${-amp}px, ${amp / 2}px)` },
        { transform: `translate(${amp}px, ${-amp / 2}px)` },
        { transform: `translate(${-amp * 0.6}px, 0)` },
        { transform: "translate(0,0)" },
      ],
      { duration: strong ? 380 : 300, easing: "ease-in-out" },
    );
  }, []);

  const clearRaf = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    lastTsRef.current = null;
  }, []);

  const fetchRankings = useCallback(async () => {
    setRankingLoading(true);
    try {
      const data: unknown = await SupabaseService.getGameRankings("castle-defense");
      setRankings(normalizeRankings(data));
    } catch (error) {
      console.error(error);
    } finally {
      setRankingLoading(false);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    setMutedState(sound.muted);
    const loadUser = async () => {
      const user = await SupabaseService.getCurrentUser();
      setIsLoggedIn(Boolean(user));
      if (user) {
        const loadedProfile: unknown = await SupabaseService.getMyProfile();
        setProfile(normalizeProfile(loadedProfile));
      }
    };
    loadUser();
    fetchRankings();
    return clearRaf;
  }, [clearRaf, fetchRankings]);

  const finishGame = useCallback(async () => {
    clearRaf();
    setGameState("gameover");
    sound.thud();
    const state = engineRef.current.state;
    setSnapshot(state);
    if (isLoggedIn && !hasSavedScoreRef.current) {
      hasSavedScoreRef.current = true;
      try {
        await SupabaseService.saveGameScore("castle-defense", state.score, state.wave, state.bestCombo);
        await fetchRankings();
      } catch (error) {
        console.error(error);
      }
    }
  }, [clearRaf, fetchRankings, isLoggedIn]);

  // ── rAF 루프 ──
  const loop = useCallback(
    (now: number) => {
      const last = lastTsRef.current ?? now;
      let dt = now - last;
      lastTsRef.current = now;
      if (dt > 100) dt = 100; // 탭 전환 등으로 큰 dt 클램프

      if (!pausedRef.current) {
        const effDt = now < hitStopUntilRef.current ? 0 : dt;
        engineRef.current.tick(effDt);
        const state = engineRef.current.state;

        // 성문 피격 감지 → 흔들림/사운드
        if (state.gateHealth < prevGateRef.current) {
          triggerShake(state.gateHealth <= 3);
          sound.play("gate_hit", { volume: 0.9 });
          const p = posOf(1, 0);
          addEffect({ kind: "float", x: p.x, y: 74, label: "-1", color: "text-red-400" }, 820);
        }
        prevGateRef.current = state.gateHealth;

        // 웨이브 전환 감지
        if (state.wavePhase !== prevPhaseRef.current) {
          if (state.wavePhase === "intermission") {
            setWaveBanner(waveClearLabel(isEn, state.wave));
            sound.fanfare();
          }
          prevPhaseRef.current = state.wavePhase;
        }
        if (state.wave > prevWaveRef.current && state.wavePhase === "spawning") {
          setWaveBanner(waveLabel(isEn, state.wave));
          prevWaveRef.current = state.wave;
        }

        setSnapshot(state);
        if (state.isFinished) {
          finishGame();
          return;
        }
      }
      rafRef.current = requestAnimationFrame(loop);
    },
    [addEffect, finishGame, triggerShake],
  );

  const startGame = useCallback(() => {
    clearRaf();
    sound.init();
    engineRef.current = new TypingDefenseEngine();
    engineRef.current.start();
    hasSavedScoreRef.current = false;
    prevGateRef.current = TYPING_DEFENSE_BASE_GATE_HEALTH;
    prevWaveRef.current = 1;
    prevPhaseRef.current = "spawning";
    setInputValue("");
    setTargetId(null);
    setEffects([]);
    setWaveBanner(waveLabel(isEn, 1));
    setGameState("playing");
    setSnapshot(engineRef.current.state);
    lastTsRef.current = null;
    rafRef.current = requestAnimationFrame(loop);
    window.setTimeout(() => inputRef.current?.focus(), 80);
  }, [clearRaf, loop]);

  // ── 입력 처리 ──
  const clearInput = useCallback(() => {
    setInputValue("");
    if (inputRef.current) inputRef.current.value = "";
    setTargetId(null);
  }, []);

  const handleInput = useCallback(
    (raw: string) => {
      const engine = engineRef.current;
      if (!engine.state.isRunning) return;
      const input = raw.trim();
      if (!input) return;

      const match = engine.matchPrefix(input);
      const targetEnemy = match.targetId !== null ? engine.state.enemies.find((e) => e.id === match.targetId) ?? null : null;
      const outcome = engine.submitInput(input);
      const combo = engine.state.combo;

      if (outcome.kind === "fire" && targetEnemy) {
        const to = posOf(targetEnemy.lane, targetEnemy.distance);
        const dx = to.x - GATE_ORIGIN.x;
        const dy = to.y - GATE_ORIGIN.y;
        const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
        addEffect({ kind: "arrow", fromX: GATE_ORIGIN.x, fromY: GATE_ORIGIN.y, toX: to.x, toY: to.y, angle }, ARROW_MS + 60);
        sound.play("shoot", { pitch: 1 + Math.min(combo * 0.02, 0.4), volume: 0.7 });
        const variant = targetEnemy.variant;
        const killed = outcome.killed;
        if (killed) {
          hitStopUntilRef.current = performance.now() + HIT_STOP_MS;
          window.setTimeout(() => {
            addEffect({ kind: "death", x: to.x, y: to.y, variant }, 360);
            for (let i = 0; i < 5; i++) {
              addEffect({ kind: "dust", x: to.x, y: to.y, dx: (Math.random() - 0.5) * 40, dy: -10 - Math.random() * 20 }, 520);
            }
            addEffect({ kind: "float", x: to.x, y: to.y, label: `+${outcome.gainedScore}`, color: combo >= 5 ? "text-yellow-300" : "text-white" }, 820);
            if (combo >= 3) addEffect({ kind: "float", x: to.x, y: to.y - 6, label: `콤보 x${combo}`, color: "text-purple-300" }, 820);
            sound.play("kill", { pitch: 1 + Math.min(combo * 0.03, 0.5), volume: 0.85 });
          }, ARROW_MS);
        } else {
          // 명중했지만 아직 살아있음(보스·방패병) — 피격 연출만
          window.setTimeout(() => {
            for (let i = 0; i < 3; i++) {
              addEffect({ kind: "dust", x: to.x, y: to.y, dx: (Math.random() - 0.5) * 30, dy: -8 - Math.random() * 14 }, 460);
            }
            addEffect({ kind: "float", x: to.x, y: to.y, label: targetEnemy.kind === "boss" ? t("명중!") : t("막힘!"), color: targetEnemy.kind === "boss" ? "text-orange-300" : "text-blue-300" }, 700);
            sound.play("hit", { pitch: 1.05, volume: 0.8 });
          }, ARROW_MS);
        }
      } else if (outcome.kind === "skill") {
        if (outcome.result === TypingDefenseCommandResult.Unavailable) {
          triggerShake(false);
        } else if (outcome.skill === "번개" && outcome.lane !== null) {
          addEffect({ kind: "lightning", lane: outcome.lane }, 520);
          triggerShake(true);
          sound.play("kill", { pitch: 0.7, volume: 0.9 });
          if (outcome.gainedScore > 0) {
            const p = posOf(outcome.lane, 0.5);
            addEffect({ kind: "float", x: p.x, y: p.y, label: `+${outcome.gainedScore}`, color: "text-yellow-300" }, 820);
          }
        } else if (outcome.skill === "방패") {
          addEffect({ kind: "gateBanner", label: t("방패 +1"), color: "text-blue-200 border-blue-300" }, 700);
          sound.tick();
        } else if (outcome.skill === "수리") {
          addEffect({ kind: "gateBanner", label: "+2 수리", color: "text-green-200 border-green-300" }, 700);
          const p = posOf(1, 0);
          addEffect({ kind: "float", x: p.x, y: 74, label: "+2", color: "text-green-300" }, 820);
          sound.fanfare();
        }
      }

      clearInput();
      setSnapshot(engine.state);
      window.setTimeout(() => inputRef.current?.focus(), 20);
      if (engine.state.isFinished) finishGame();
    },
    [addEffect, clearInput, finishGame, triggerShake],
  );

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const v = event.target.value;
      if (v.length > inputValue.length) sound.tick();
      setInputValue(v);

      const engine = engineRef.current;
      const trimmed = v.trim();
      const match = engine.matchPrefix(trimmed);
      setTargetId(match.targetId);

      if (gameState !== "playing" || !trimmed) return;
      const isSkill = (TYPING_DEFENSE_SKILLS as readonly string[]).includes(trimmed);
      const ambiguous = engine.state.enemies.some((e) => e.word !== trimmed && e.word.startsWith(trimmed));
      // 스킬어이거나, 다른 적 단어의 접두어가 아닌 완전 일치 → 즉시 발사
      if (isSkill || (match.exact && !ambiguous)) {
        handleInput(trimmed);
      }
    },
    [gameState, handleInput, inputValue.length],
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleInput(inputValue);
  };

  const toggleMute = useCallback(() => {
    const next = sound.toggleMuted();
    setMutedState(next);
  }, []);

  const chooseUpgrade = useCallback((id: UpgradeId) => {
    const engine = engineRef.current;
    engine.applyUpgrade(id);
    const state = engine.state;
    prevWaveRef.current = state.wave;
    prevPhaseRef.current = state.wavePhase;
    setWaveBanner(waveLabel(isEn, state.wave, state.isBossWave));
    if (state.isBossWave) sound.thud();
    setSnapshot(state);
    window.setTimeout(() => inputRef.current?.focus(), 20);
  }, []);

  // ── 렌더 조각 ──
  const gateLow = snapshot.gateHealth <= 3 && gameState === "playing";

  // 현재 점수 기준 실시간 예상 순위 (랭킹 보드는 상위 10위)
  const liveRank = rankings.length > 0 ? rankings.filter((r) => r.score > snapshot.score).length + 1 : null;
  const inTop10 = liveRank !== null && liveRank <= 10;
  const gapToTop10 = rankings.length >= 10 ? Math.max(0, (rankings[9]?.score ?? 0) - snapshot.score + 1) : 0;

  // TOP 10 리더보드 + 현재 점수 기준 내 예상 위치 삽입
  type BoardRow = { me?: boolean; nickname: string; score: number; created_at?: string };
  const playBoardRows: BoardRow[] = (() => {
    const board: BoardRow[] = rankings.slice(0, 10).map((r) => ({ nickname: r.profiles?.nickname || t("익명"), score: r.score, created_at: r.created_at }));
    if (gameState === "playing" && liveRank !== null && liveRank <= 10) {
      board.splice(liveRank - 1, 0, { me: true, nickname: profile?.nickname || t("나"), score: snapshot.score });
    }
    return board.slice(0, 10);
  })();

  const battlefield = (
    <div
      ref={battlefieldRef}
      className={`relative overflow-hidden bg-gradient-to-b from-sky-900 via-slate-900 to-emerald-950 ${
        isMobilePlaying ? "flex-1 min-h-0 rounded-xl" : "flex-1 min-h-[220px] rounded-2xl border-4 border-slate-900 shadow-2xl"
      }`}
    >
      {/* 지면 그리드 */}
      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "linear-gradient(rgba(148,163,184,.10) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,.10) 1px, transparent 1px)", backgroundSize: "34px 34px" }} />

      {/* 레인 */}
      {[0, 1, 2].map((lane) => (
        <div key={lane} className="absolute top-[2%] bottom-[16%] rounded-2xl border border-white/5 bg-white/[0.03]" style={{ left: `${lane * 33.333 + 2}%`, width: "29.333%" }} />
      ))}

      {/* 성문(성 + 궁수) */}
      <div className="absolute left-1/2 -translate-x-1/2" style={{ bottom: "1%", width: isMobilePlaying ? 96 : 132 }}>
        <div
          className={`relative w-full ${gateLow ? "cd-danger rounded-2xl" : ""}`}
          style={{ aspectRatio: "320 / 256", backgroundImage: `url(${ASSET}/castle.png)`, backgroundSize: "contain", backgroundRepeat: "no-repeat", imageRendering: "pixelated" }}
        >
          <div
            className="cd-sprite cd-anim-6 absolute left-1/2 -translate-x-1/2"
            style={{ top: isMobilePlaying ? -24 : -34, transform: `translateX(-50%) scale(${isMobilePlaying ? 0.28 : 0.38})`, transformOrigin: "center bottom", backgroundImage: `url(${ASSET}/archer_idle.png)` }}
          />
        </div>
      </div>

      {/* 적 */}
      {snapshot.enemies.map((enemy) => (
        <EnemyView key={enemy.id} enemy={enemy} input={inputValue.trim()} isTarget={enemy.id === targetId} compact={isMobilePlaying} />
      ))}

      {/* 이펙트 */}
      {effects.map((effect) => (
        <EffectView key={effect.id} effect={effect} compact={isMobilePlaying} />
      ))}

      {/* 웨이브 배너 */}
      {waveBanner && gameState === "playing" && (
        <div key={waveBanner} className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="cd-banner px-8 py-4 rounded-2xl bg-black/60 backdrop-blur-sm border-2 border-yellow-400/60 text-yellow-200 font-bold text-3xl sm:text-4xl tracking-tight shadow-2xl" onAnimationEnd={() => setWaveBanner(null)}>
            {waveBanner}
          </div>
        </div>
      )}

      {/* 시작 오버레이 */}
      {gameState === "ready" && (
        <div className="absolute inset-0 z-30 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white p-5 sm:p-7 rounded-2xl shadow-2xl flex flex-col items-center gap-3 sm:gap-4 max-w-md w-full max-h-full overflow-auto border border-zinc-200 text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-xl shrink-0">
              <Castle className="w-7 h-7 sm:w-9 sm:h-9" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-zinc-900 mb-1.5 leading-tight">{t("한글 타자 성문방어")}</h3>
              <p className="text-zinc-500 text-xs sm:text-sm font-medium leading-relaxed">
                {isEn ? <>Type the <b className="text-blue-500">word</b> above an enemy to fire an arrow and hold the gate. In a pinch, type a skill word: <b>번개·방패·수리</b>.</> : <>적의 머리 위 <b className="text-blue-500">단어</b>를 타이핑해 화살을 쏘세요. 웨이브를 막고 성문을 지키면 됩니다. 위급하면 <b>번개·방패·수리</b> 스킬을 입력하세요.</>}
              </p>
            </div>
            <button onClick={startGame} className="w-full py-3 sm:py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg sm:text-xl font-bold rounded-2xl transition-all shadow-xl shadow-blue-200 active:scale-95 shrink-0">
              {t("방어 시작")}
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const skillBar = (
    <div className={`grid grid-cols-3 ${isMobilePlaying ? "gap-1.5 shrink-0" : "gap-3"}`}>
      {TYPING_DEFENSE_SKILLS.map((skill) => {
        const meta = SKILL_META[skill];
        const cd = snapshot.skillCooldowns[skill];
        const disabled = gameState !== "playing" || cd > 0;
        const Icon = meta.icon;
        return (
          <button
            key={skill}
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => handleInput(skill)}
            disabled={disabled}
            className={`relative overflow-hidden rounded-2xl border border-zinc-200 bg-white disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] transition-all ${isMobilePlaying ? "p-1.5 rounded-xl" : "p-3"}`}
          >
            {cd > 0 && <div className="absolute inset-0 bg-zinc-900/60 flex items-center justify-center text-white font-bold text-lg tabular-nums">{(cd / 1000).toFixed(1)}</div>}
            <div className={`flex items-center justify-center gap-1.5 font-bold ${meta.color} ${isMobilePlaying ? "text-xs" : "text-base"}`}>
              <Icon size={isMobilePlaying ? 14 : 18} /> {skill}
            </div>
            {!isMobilePlaying && <div className="mt-1 text-[10px] font-bold text-zinc-400">{t(meta.desc)}</div>}
          </button>
        );
      })}
    </div>
  );

  const commandInput = (
    <form onSubmit={handleSubmit} className={isMobilePlaying ? "w-full" : "w-full shrink-0"}>
      <input
        data-typing-input ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleChange}
        disabled={gameState !== "playing"}
        className={`w-full text-center font-bold outline-hidden transition-all ${
          isMobilePlaying
            ? "h-12 px-4 text-lg bg-zinc-800 text-white rounded-xl border-2 border-blue-500 placeholder:text-zinc-500"
            : "h-14 px-5 text-2xl sm:text-3xl bg-white border-4 rounded-2xl shadow-xl border-blue-500 focus:ring-4 ring-blue-100 disabled:opacity-60"
        }`}
        placeholder={gameState === "playing" ? t("적 단어를 입력하세요") : t("시작 후 입력 가능")}
        autoFocus
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
      />
    </form>
  );

  const showUpgrades = gameState === "playing" && snapshot.wavePhase === "intermission" && snapshot.upgradeChoices.length > 0;
  const upgradeModalNode =
    showUpgrades && mounted ? createPortal(<UpgradeModal choices={snapshot.upgradeChoices} wave={snapshot.wave} onPick={chooseUpgrade} />, document.body) : null;

  const muteButton = (
    <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={toggleMute} className="shrink-0 w-9 h-9 rounded-xl bg-zinc-800 text-zinc-300 flex items-center justify-center hover:bg-zinc-700 transition-colors" aria-label={t("음소거 토글")}>
      {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
    </button>
  );

  const hudBar = (
    <div className="flex-1 flex items-center gap-4 px-4 sm:px-6 py-3 bg-zinc-950 text-white rounded-2xl shadow-xl border border-zinc-800 min-w-0">
      <div className="flex gap-4 sm:gap-6 items-center shrink-0">
        <StatusItem label="Wave" value={`${snapshot.wave}`} icon={<Swords size={18} />} tone="text-emerald-400" />
        <StatusItem label="Gate" value={`${snapshot.gateHealth}/${snapshot.maxGateHealth}`} icon={<Heart size={18} />} tone={gateLow ? "text-red-500 cd-pop" : "text-red-400"} />
        <StatusItem label="Shield" value={`${snapshot.shieldCount}`} icon={<Shield size={18} />} tone="text-blue-400" />
        <StatusItem label="Combo" value={`${snapshot.combo}`} icon={<Sparkles size={18} />} tone="text-purple-400" />
        <StatusItem label="Score" value={snapshot.score.toLocaleString()} icon={<Trophy size={18} />} tone="text-yellow-400" />
      </div>

      {/* TOP 10 성적 가로 스트립 (상단 바 우측 여백에 · 내 예상 위치 강조) */}
      {playBoardRows.length > 0 && (
        <div className="hidden lg:flex items-center gap-1.5 flex-1 min-w-0 overflow-x-auto custom-scrollbar">
          <span className="shrink-0 flex items-center gap-1 text-yellow-400 font-bold text-[10px] uppercase tracking-widest pr-0.5">
            <Trophy size={13} />TOP10{liveRank !== null ? ` · ${inTop10 ? `${liveRank}위` : `+${gapToTop10.toLocaleString()}`}` : ""}
          </span>
          {playBoardRows.map((row, i) => (
            <span
              key={row.me ? "me" : `${row.created_at ?? i}-${i}`}
              className={`shrink-0 flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold tabular-nums ${row.me ? "bg-yellow-400/20 text-yellow-200 border border-yellow-400/40" : "bg-white/[0.05] text-zinc-300"}`}
            >
              <span className={`${i === 0 ? "text-yellow-400" : i === 1 ? "text-zinc-300" : i === 2 ? "text-orange-400" : "text-zinc-500"}`}>{i + 1}</span>
              {row.me && <span>🎯</span>}
              {row.score.toLocaleString()}
            </span>
          ))}
        </div>
      )}

      {muteButton}
    </div>
  );

  const rankingAside = (
    <aside className="w-full h-full bg-white rounded-2xl border border-zinc-200 p-5 shadow-lg flex flex-col min-h-0">
      <div className="flex items-center gap-2 mb-4 shrink-0">
        <Trophy className="text-yellow-500" size={18} />
        <h3 className="text-base font-bold">{t("성문방어 랭킹")}</h3>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto pr-1 custom-scrollbar min-h-0">
        {rankingLoading ? (
          <div className="flex justify-center py-10"><Loader2 className="animate-spin text-zinc-300" /></div>
        ) : rankings.length > 0 ? (
          rankings.map((rank, index) => (
            <div key={`${rank.created_at ?? index}-${index}`} className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${index === 0 ? "bg-yellow-400 text-white" : index === 1 ? "bg-zinc-300 text-zinc-600" : index === 2 ? "bg-orange-400 text-white" : "bg-zinc-100 text-zinc-400"}`}>{index + 1}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate text-zinc-900 leading-tight">{rank.profiles?.nickname || t("익명")}</p>
                <p className="text-[9px] font-bold text-zinc-400">{isEn ? <>Wave {rank.level} · Combo {rank.max_combo}</> : <>웨이브 {rank.level} · 콤보 {rank.max_combo}</>}</p>
              </div>
              <p className="text-xs font-bold text-blue-600 shrink-0">{rank.score.toLocaleString()}</p>
            </div>
          ))
        ) : (
          <div className="text-center py-10 text-zinc-400 text-xs font-medium">{t("기록 없음")}</div>
        )}
      </div>
      {!isLoggedIn && <p className="mt-3 text-[9px] text-zinc-400 font-bold text-center leading-relaxed px-2 shrink-0">{t("로그인하면 내 기록을 실시간 랭킹에 남길 수 있습니다.")}</p>}
      <div className="mt-3 pt-3 border-t border-zinc-100 text-center shrink-0">
        <div className="bg-zinc-50 p-2.5 rounded-xl flex items-center justify-center gap-2">
          <Keyboard size={14} className="text-blue-600" />
          <span className="font-bold text-xs">{profile?.nickname || "Guest"}</span>
        </div>
      </div>
    </aside>
  );

  const exitDesktopGame = () => {
    if (confirm(t("게임을 그만하고 결과를 볼까요?"))) finishGame();
    else inputRef.current?.focus();
  };

  // ── 데스크톱/노트북 전체화면 플레이 (헤더·배너·광고 밖으로 나가 항상 한 화면) ──
  if (gameState === "playing" && !isMobile && mounted) {
    return createPortal(
      <div className="fixed inset-0 z-[9985] bg-slate-950 flex flex-col p-3 gap-3">
        <div className="flex gap-3 items-stretch shrink-0">
          {hudBar}
          <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={exitDesktopGame} aria-label={t("게임 종료")} className="shrink-0 w-11 rounded-2xl bg-zinc-800 text-zinc-300 flex items-center justify-center hover:bg-zinc-700 transition-colors">
            <ArrowRight className="rotate-180" size={20} />
          </button>
        </div>
        <div className="flex-1 flex gap-3 min-h-0">
          {/* 좌측 광고 레일 (조작부와 떨어진 위치 · 좌우 동시 노출) */}
          <div className="hidden md:flex flex-col items-center shrink-0 w-[168px] overflow-hidden rounded-2xl bg-white/[0.03] p-1">
            <span className="text-[8px] font-bold uppercase tracking-[0.25em] text-zinc-500 py-1">Sponsor</span>
            <AdSenseUnit label="sidebar-left" width={160} height={600} />
          </div>
          <div className="flex-1 flex flex-col gap-3 min-h-0 min-w-0">
            {battlefield}
            {skillBar}
            {commandInput}
          </div>
          {/* 우측 광고 레일 (조작부와 떨어진 위치 · 좌우 동시 노출) */}
          <div className="hidden md:flex flex-col items-center shrink-0 w-[168px] overflow-hidden rounded-2xl bg-white/[0.03] p-1">
            <span className="text-[8px] font-bold uppercase tracking-[0.25em] text-zinc-500 py-1">Sponsor</span>
            <AdSenseUnit label="sidebar-right" width={160} height={600} />
          </div>
        </div>
        {upgradeModalNode}
      </div>,
      document.body,
    );
  }

  // ── 모바일 풀스크린 ──
  if (isMobilePlaying && overlay) {
    const exitGame = () => {
      if (confirm(t("게임을 그만하고 결과를 볼까요?"))) finishGame();
      else resume();
    };
    const mobileHud = (
      <>
        <span className="flex items-center gap-1 text-sm font-bold text-emerald-400 tabular-nums"><Swords size={13} />{snapshot.wave}</span>
        <span className="flex items-center gap-1 text-sm font-bold text-red-400 tabular-nums"><Heart size={13} />{snapshot.gateHealth}</span>
        <span className="flex items-center gap-1 text-sm font-bold text-blue-400 tabular-nums"><Shield size={13} />{snapshot.shieldCount}</span>
        <span className="flex items-center gap-1 text-sm font-bold text-purple-400 tabular-nums"><Sparkles size={13} />{snapshot.combo}</span>
        <span className="flex items-center gap-1 text-sm font-bold text-yellow-400 tabular-nums ml-auto"><Trophy size={13} />{snapshot.score.toLocaleString()}</span>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={toggleMute} className="shrink-0 text-zinc-400" aria-label={t("음소거")}>
          {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
        </button>
      </>
    );
    return (
      <>
        <MobileGameShell overlay={overlay} hud={mobileHud} input={commandInput} paused={paused} onResume={resume} onExit={exitGame}>
          <div className="w-full h-full flex flex-col p-2 gap-1.5">
            {/* 모바일 인게임 상단 슬림 배너 (조작부와 떨어진 상단 · 미충족 시 비움) */}
            <div className="shrink-0 flex justify-center empty:hidden">
              <AdSenseUnit label="content-banner-mobile" width={320} height={50} noFallback tight />
            </div>
            {battlefield}
            {skillBar}
          </div>
        </MobileGameShell>
        {upgradeModalNode}
      </>
    );
  }

  // ── 데스크톱/노트북 (한 화면에 맞춤) ──
  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row gap-4 py-6 items-stretch animate-in fade-in duration-500">
      {gameState === "gameover" && mounted && createPortal(<ResultModal snapshot={snapshot} isLoggedIn={isLoggedIn} onRetry={startGame} />, document.body)}

      {/* 인트로 히어로 (플레이는 전체화면으로 열림) */}
      <div className="lg:flex-1 w-full flex items-center justify-center rounded-2xl bg-gradient-to-b from-sky-900 via-slate-900 to-emerald-950 border-4 border-slate-900 shadow-2xl p-4 sm:p-8 min-h-[240px]">
        <div className="bg-white p-5 sm:p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-4 max-w-md w-full border border-zinc-200 text-center">
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-xl">
            <Castle className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-2 leading-tight">{t("한글 타자 성문방어")}</h3>
            <p className="text-zinc-500 text-sm font-medium leading-relaxed">
              {isEn ? <>Type the <b className="text-blue-500">word</b> above an enemy to fire an arrow and hold the gate. A <b>boss</b> arrives every 5 waves, and you pick an <b>upgrade</b> after each clear.</> : <>적의 머리 위 <b className="text-blue-500">단어</b>를 타이핑해 화살을 쏘세요. 웨이브를 막고 성문을 지키면 됩니다. 5웨이브마다 <b>보스</b>가 오고, 클리어할 때마다 <b>강화</b>를 고릅니다.</>}
            </p>
          </div>
          <div className="flex items-center gap-2 w-full">
            <button onClick={startGame} className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white text-xl font-bold rounded-2xl transition-all shadow-xl shadow-blue-200 active:scale-95">
              {gameState === "gameover" ? t("다시 도전") : t("방어 시작")}
            </button>
            {muteButton}
          </div>
          <p className="text-[11px] font-bold text-zinc-400">{t("전체화면으로 열립니다 · 언제든 나가기 버튼으로 종료")}</p>
          <p className="text-[10px] text-zinc-400/80">{t("아트: Tiny Swords by Pixel Frog · 무료 상업적 이용 가능")}</p>
        </div>
      </div>

      {/* 랭킹: 넓은 화면은 옆에, 좁으면 아래로 흐름 */}
      <div className="w-full lg:w-64 shrink-0">{rankingAside}</div>
    </div>
  );
};

// ── 하위 컴포넌트 ──────────────────────────────────────────
function StatusItem({ label, value, icon, tone }: { label: string; value: string; icon: React.ReactNode; tone: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-[9px] text-zinc-500 uppercase font-bold mb-0.5">{label}</span>
      <span className={`text-lg sm:text-2xl font-bold flex items-center gap-1.5 ${tone}`}>{icon} {value}</span>
    </div>
  );
}

function ResultTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-zinc-50 p-5 rounded-2xl border border-zinc-100">
      <p className="text-[10px] font-bold text-zinc-400 uppercase mb-1 tracking-widest">{label}</p>
      <p className="text-3xl font-bold text-zinc-900">{value}</p>
    </div>
  );
}

function ResultModal({ snapshot, isLoggedIn, onRetry }: { snapshot: TypingDefenseState; isLoggedIn: boolean; onRetry: () => void }) {
  const { isEn, t } = useGameT();
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-xl animate-in fade-in duration-500" />
      <div className="relative max-w-lg w-full max-h-[90vh] overflow-y-auto bg-white rounded-2xl p-8 shadow-2xl text-center border border-zinc-200 animate-in zoom-in duration-500">
        {/* 결과 화면 최상단 광고 (슬림 배너 · 미충족 시 비움 · 장비 추천 미노출) */}
        <div className="mb-5 flex justify-center empty:hidden">
          <AdSenseUnit label="content-banner-mobile" width={320} height={100} noFallback tight />
        </div>
        <div className="inline-flex p-6 bg-blue-50 rounded-full mb-6">
          <Castle className="w-16 h-16 text-blue-600" />
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-2 tracking-tighter">{isEn ? <>The gate fell on wave {snapshot.wave}</> : <>웨이브 {snapshot.wave}에서 성문이 무너졌어요</>}</h2>
        <p className="text-zinc-500 font-bold mb-8">{t("이번 방어 기록입니다.")}</p>
        <div className="grid grid-cols-2 gap-4 mb-8">
          <ResultTile label="Wave" value={snapshot.wave.toLocaleString()} />
          <ResultTile label="Score" value={snapshot.score.toLocaleString()} />
          <ResultTile label="Kills" value={snapshot.kills.toLocaleString()} />
          <ResultTile label="Best Combo" value={snapshot.bestCombo.toLocaleString()} />
        </div>
        {!isLoggedIn ? (
          <div className="mb-6 p-6 bg-blue-50 rounded-2xl border border-blue-100">
            <p className="text-sm font-bold text-blue-600 mb-4 flex items-center justify-center gap-2"><Sparkles size={16} fill="currentColor" /> {t("랭킹에 기록을 남겨보세요.")}</p>
            <button onClick={() => SupabaseService.signInWithKakao()} className="w-full py-4 bg-[#FEE500] text-black font-bold rounded-2xl hover:opacity-90 transition-all shadow-xl active:scale-95">{t("카카오로 로그인하고 저장")}</button>
          </div>
        ) : (
          <div className="mb-6 text-sm font-bold text-green-600">{t("랭킹에 기록이 반영되었습니다.")}</div>
        )}
        <div className="flex flex-col gap-4">
          <button onClick={onRetry} className="w-full py-5 bg-zinc-900 text-white text-xl font-bold rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl flex items-center justify-center gap-3"><RotateCcw size={24} /> {t("다시 도전하기")}</button>
          <Link prefetch={false} href={isEn ? "/en/game" : "/game"} className="flex items-center justify-center gap-2 text-zinc-400 font-bold text-sm hover:text-zinc-600 transition-colors">{t("목록으로 돌아가기")} <ArrowRight size={16} /></Link>
        </div>
      </div>
    </div>
  );
}

function EnemyView({ enemy, input, isTarget, compact }: { enemy: TypingDefenseEnemy; input: string; isTarget: boolean; compact: boolean }) {
  const { x, y } = posOf(enemy.lane, enemy.distance);
  const isBoss = enemy.kind === "boss";
  const isShielded = enemy.kind === "shield" && enemy.hp > 1;
  const isRunner = enemy.kind === "runner";
  const size = isBoss ? (compact ? 96 : 128) : isRunner ? (compact ? 40 : 54) : compact ? 46 : 62;
  const matched = input.length > 0 && enemy.word.startsWith(input) ? input.length : 0;
  const isClose = enemy.distance < 0.25;

  const labelTone = isBoss
    ? "bg-gradient-to-r from-purple-700 to-fuchsia-700 ring-2 ring-fuchsia-300 text-base"
    : isTarget
      ? "bg-blue-600 ring-2 ring-blue-300 scale-110"
      : enemy.kind === "splitter"
        ? "bg-orange-700"
        : enemy.kind === "runner"
          ? "bg-emerald-700"
          : isClose
            ? "bg-red-700"
            : "bg-black/70";

  return (
    <div className="pointer-events-none absolute flex flex-col items-center" style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -50%)", zIndex: isBoss ? 22 : isTarget ? 20 : 10 }}>
      {/* 단어 라벨 */}
      <div className={`mb-1 px-2 py-0.5 rounded-lg font-bold whitespace-nowrap shadow-lg ${compact ? "text-xs" : "text-sm"} ${labelTone}`}>
        {isBoss && <span className="mr-1">👑</span>}
        <span className="text-green-300">{enemy.word.slice(0, matched)}</span>
        <span className="text-white">{enemy.word.slice(matched)}</span>
      </div>

      {/* HP 바 (다타수 적: 보스·방패병) */}
      {enemy.maxHp > 1 && (
        <div className={`mb-1 h-1.5 overflow-hidden rounded-full bg-black/50 ${isBoss ? "w-24" : "w-12"}`}>
          <div className={`h-full rounded-full ${isBoss ? "bg-fuchsia-400" : "bg-blue-400"}`} style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }} />
        </div>
      )}

      {/* 스프라이트 */}
      <div style={{ position: "relative", width: size, height: size, overflow: "visible" }}>
        {isBoss && <div className="absolute inset-0 rounded-full animate-pulse" style={{ boxShadow: "0 0 30px 8px rgba(217,70,239,0.5)" }} />}
        <div style={{ position: "relative", width: size, height: size, overflow: "hidden" }}>
          <div className={`cd-sprite cd-anim-6 ${isClose ? "cd-hitflash" : ""}`} style={{ position: "absolute", left: 0, top: 0, transformOrigin: "top left", transform: `scale(${size / 192})`, backgroundImage: `url(${ENEMY_SHEET[enemy.variant]})` }} />
        </div>
        {isShielded && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full border-2 border-blue-300/70 bg-blue-400/15">
            <Shield size={compact ? 14 : 18} className="text-blue-200" />
          </div>
        )}
      </div>
    </div>
  );
}

const UPGRADE_ICON: Record<UpgradeId, React.ElementType> = {
  gate: Heart,
  combo: Sparkles,
  cooldown: Zap,
  pierce: ArrowRight,
  shield: Shield,
  autorepair: Wrench,
};

function UpgradeModal({ choices, wave, onPick }: { choices: UpgradeOption[]; wave: number; onPick: (id: UpgradeId) => void }) {
  const { isEn, t } = useGameT();
  return (
    <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-zinc-950/85 backdrop-blur-md animate-in fade-in duration-300" />
      <div className="relative w-full max-w-2xl bg-white rounded-2xl p-6 sm:p-8 shadow-2xl border border-zinc-200 animate-in zoom-in duration-300">
        <div className="text-center mb-6">
          <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-1">{isEn ? <>Wave {wave} cleared</> : <>웨이브 {wave} 클리어</>}</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900">{t("강화 하나를 선택하세요")}</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {choices.map((choice) => {
            const Icon = UPGRADE_ICON[choice.id];
            return (
              <button
                key={choice.id}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onPick(choice.id)}
                className="group flex flex-col items-center text-center gap-2 p-5 rounded-2xl border-2 border-zinc-200 hover:border-blue-500 hover:bg-blue-50 transition-all active:scale-95"
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Icon size={24} />
                </div>
                <div className="font-bold text-zinc-900">{t(choice.title)}</div>
                <div className="text-xs font-medium text-zinc-500 leading-snug">{t(choice.desc)}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function EffectView({ effect, compact }: { effect: Effect; compact: boolean }) {
  if (effect.kind === "arrow") return <ArrowView effect={effect} compact={compact} />;

  if (effect.kind === "lightning") {
    return (
      <div className="pointer-events-none absolute top-[2%] bottom-[16%] flex items-center justify-center" style={{ left: `${effect.lane * 33.333 + 2}%`, width: "29.333%" }}>
        <div className="w-full h-full rounded-2xl border-2 border-yellow-300/80 bg-gradient-to-b from-white/10 via-yellow-300/50 to-blue-300/10 animate-pulse flex items-center justify-center">
          <Zap className="text-yellow-100 drop-shadow-lg" size={compact ? 34 : 52} />
        </div>
      </div>
    );
  }

  if (effect.kind === "gateBanner") {
    return (
      <div className={`pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-[18%] px-4 py-2 rounded-2xl border-2 bg-black/50 font-bold cd-float ${effect.color}`}>{effect.label}</div>
    );
  }

  if (effect.kind === "float") {
    return (
      <div className={`pointer-events-none absolute font-bold cd-float drop-shadow ${effect.color} ${compact ? "text-sm" : "text-lg"}`} style={{ left: `${effect.x}%`, top: `${effect.y}%`, transform: "translate(-50%, -50%)" }}>{effect.label}</div>
    );
  }

  if (effect.kind === "dust") {
    return (
      <div
        className="pointer-events-none absolute cd-dust cd-pixel"
        style={{ left: `${effect.x}%`, top: `${effect.y}%`, width: compact ? 10 : 14, height: compact ? 10 : 14, backgroundImage: `url(${ASSET}/dust.png)`, backgroundSize: "contain", backgroundRepeat: "no-repeat", ["--dx" as string]: `${effect.dx}px`, ["--dy" as string]: `${effect.dy}px` }}
      />
    );
  }

  // death
  const size = compact ? 46 : 62;
  return (
    <div className="pointer-events-none absolute" style={{ left: `${effect.x}%`, top: `${effect.y}%`, width: size, height: size, transform: "translate(-50%, -50%)", zIndex: 15 }}>
      {/* 중간 래퍼가 192→size 축소, 안쪽 cd-die가 pop/페이드 애니메이션 담당 */}
      <div style={{ transformOrigin: "top left", transform: `scale(${size / 192})`, width: 192, height: 192 }}>
        <div className="cd-sprite cd-die" style={{ backgroundImage: `url(${ENEMY_SHEET[effect.variant]})` }} />
      </div>
    </div>
  );
}

function ArrowView({ effect, compact }: { effect: Extract<Effect, { kind: "arrow" }>; compact: boolean }) {
  const [flying, setFlying] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setFlying(true));
    return () => cancelAnimationFrame(raf);
  }, []);
  const size = compact ? 20 : 28;
  return (
    <div
      className="pointer-events-none absolute cd-pixel"
      style={{
        left: `${flying ? effect.toX : effect.fromX}%`,
        top: `${flying ? effect.toY : effect.fromY}%`,
        width: size,
        height: size,
        transform: `translate(-50%, -50%) rotate(${effect.angle + 90}deg)`,
        transition: `left ${ARROW_MS}ms linear, top ${ARROW_MS}ms linear`,
        backgroundImage: `url(${ASSET}/arrow.png)`,
        backgroundSize: "contain",
        backgroundRepeat: "no-repeat",
        zIndex: 25,
      }}
    />
  );
}
