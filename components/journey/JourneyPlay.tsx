"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Play, Eye, EyeOff, Lightbulb, MapPin, Timer } from "lucide-react";
import { TypingUtils } from "@/lib/typing-speed";
import { track } from "@/lib/analytics";
import { getCourseStations, type JourneyCourse } from "@/lib/journey-data";
import {
  getJourneyRecord,
  saveJourneySnapshot,
  recordJourneyCompletion,
  clearJourneySnapshot,
  type JourneySnapshot,
} from "@/lib/journey-progress";
import { useMobileGamePlay } from "@/hooks/useMobileGamePlay";
import { MobileGameShell } from "@/components/game/MobileGameShell";
import { JourneyViz } from "./JourneyViz";
import { JourneyComplete } from "./JourneyComplete";

const CHOSEONG = ["ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];

/** "세종" → "ㅅㅈ" (한글 외 문자는 그대로) */
function chosungOf(text: string): string {
  return Array.from(text)
    .map((ch) => {
      const code = ch.charCodeAt(0);
      if (code >= 0xac00 && code <= 0xd7a3) return CHOSEONG[Math.floor((code - 0xac00) / 588)];
      return ch;
    })
    .join("");
}

type Phase = "traveling" | "arrived";

/** 마지막 글자(IME 조합 중일 수 있음)를 뺀 입력이 접두어가 아니면 오타 */
function checkWrong(normTarget: string, normInput: string): boolean {
  if (normInput.length === 0 || normTarget.startsWith(normInput)) return false;
  return !normTarget.startsWith(normInput.slice(0, -1));
}

export const JourneyPlay: React.FC<{ course: JourneyCourse }> = ({ course }) => {
  const baseStations = getCourseStations(course);

  // shuffle 코스: 플레이마다 출제 순서를 섞는다 (id 배열로 유지, 이어가기 스냅샷에 보존)
  const [order, setOrder] = useState<string[] | null>(null);
  const stations = React.useMemo(() => {
    if (!course.shuffle || !order) return baseStations;
    const byId = new Map(baseStations.map((s) => [s.id, s]));
    const ordered = order.map((id) => byId.get(id)).filter((s): s is (typeof baseStations)[number] => Boolean(s));
    // 데이터 변경으로 스냅샷 순서가 어긋나면 원본 순서로 폴백
    return ordered.length === baseStations.length ? ordered : baseStations;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course.shuffle, order, course.id]);

  const [gameState, setGameState] = useState<"ready" | "playing" | "finished">("ready");
  const [stationIndex, setStationIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("traveling");
  const [inputValue, setInputValue] = useState("");
  const [mistakes, setMistakes] = useState(0);
  const [completedTargets, setCompletedTargets] = useState(0);
  const [accStrokes, setAccStrokes] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [showAllNames, setShowAllNames] = useState(false);
  const [hintShown, setHintShown] = useState(false);
  // 하드 모드: 초성 힌트 자체를 가림 (localStorage 영속). 문제별 "초성 보기"로 1단계 해제 가능
  const [hideChosung, setHideChosung] = useState(false);
  const [chosungShown, setChosungShown] = useState(false);
  const [finalStats, setFinalStats] = useState<{ kpm: number; accuracy: number; seconds: number } | null>(null);
  const [resumeSnapshot, setResumeSnapshot] = useState<JourneySnapshot | null>(null);
  const [completionCount, setCompletionCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  const startTime = useRef(0);
  const pauseStart = useRef(0);
  const wasWrong = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { isMobilePlaying, paused, overlay, resume } = useMobileGamePlay({
    playing: gameState === "playing",
    inputRef,
  });

  useEffect(() => {
    setMounted(true);
    const record = getJourneyRecord(course.id);
    if (record?.progress) setResumeSnapshot(record.progress);
    setCompletionCount(record?.completions.length || 0);
    try {
      setHideChosung(window.localStorage.getItem("tajawang_journey_hide_chosung") === "1");
    } catch { /* ignore */ }
  }, [course.id]);

  const toggleHideChosung = () => {
    setHideChosung((prev) => {
      const next = !prev;
      try { window.localStorage.setItem("tajawang_journey_hide_chosung", next ? "1" : "0"); } catch { /* ignore */ }
      return next;
    });
    setChosungShown(false);
    inputRef.current?.focus();
  };

  // 일시정지 동안 시간이 흐르지 않도록 재개 시 startTime 보정
  useEffect(() => {
    if (!paused) return;
    pauseStart.current = performance.now();
    return () => {
      startTime.current += performance.now() - pauseStart.current;
    };
  }, [paused]);

  // 경과 시간 틱
  useEffect(() => {
    if (gameState !== "playing" || paused) return;
    const timer = setInterval(() => {
      setElapsed((performance.now() - startTime.current) / 1000);
    }, 250);
    return () => clearInterval(timer);
  }, [gameState, paused]);

  const station = stations[Math.min(stationIndex, stations.length - 1)];
  // quiz 코스(세계 수도 등)는 질문(name)을 보여주고 정답(fact)을 입력한다 — 1단계 진행
  const isQuiz = course.flow === "quiz";
  const unit = course.unitLabel || "항목";

  // 순서 코스의 문제 라벨 — "조선 3대 왕은?" / "고구려 5대 왕은?" / "원자번호 6번, 이 원소는?"
  // 초성만으로는 무엇을 묻는지 알 수 없으므로 라인별 대수를 함께 보여준다.
  const sequenceQuestion = (() => {
    if (isQuiz) return null;
    if (course.ui === "periodic") return `원자번호 ${stationIndex + 1}번, 이 원소는?`;
    let offset = 0;
    for (const line of course.lines) {
      if (stationIndex < offset + line.stations.length) {
        const local = stationIndex - offset + 1;
        const prefix = line.name || (course.id === "joseon-kings" ? "조선" : "");
        return prefix ? `${prefix} ${local}대 왕은?` : `${local}번째 ${unit}은?`;
      }
      offset += line.stations.length;
    }
    return null;
  })();
  const target = isQuiz ? station.fact : phase === "traveling" ? station.name : station.fact;
  const normTarget = TypingUtils.normalize(target);
  // 별칭 정답(예: 미국↔미합중국) — quiz 흐름에서만 허용. 미지정 코스는 기존과 동일하게 단일 정답
  const normAnswers = isQuiz && station.aliases?.length
    ? [normTarget, ...station.aliases.map((a) => TypingUtils.normalize(a))]
    : [normTarget];

  const currentSnapshot = useCallback(
    (nextIndex: number, nextPhase: Phase, strokes: number, targets: number, mistakeCount: number): JourneySnapshot => ({
      stationIndex: nextIndex,
      phase: nextPhase,
      accStrokes: strokes,
      completedTargets: targets,
      mistakes: mistakeCount,
      elapsedSeconds: (performance.now() - startTime.current) / 1000,
      updatedAt: new Date().toISOString(),
      ...(course.shuffle && order ? { order } : {}),
    }),
    [course.shuffle, order]
  );

  const finish = useCallback(
    (strokes: number, targets: number, mistakeCount: number) => {
      const seconds = (performance.now() - startTime.current) / 1000;
      const kpm = seconds > 0 ? Math.round((strokes / seconds) * 60) : 0;
      const accuracy = TypingUtils.calculateAccuracy(targets, targets + mistakeCount);
      setFinalStats({ kpm, accuracy, seconds });
      setGameState("finished");
      setCompletionCount((n) => n + 1);
      setResumeSnapshot(null);
      recordJourneyCompletion(course.id, {
        date: new Date().toISOString(),
        kpm,
        accuracy,
        seconds: Math.round(seconds),
      });
      track("journey_complete", { course: course.id, kpm, accuracy });
    },
    [course.id]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    if (gameState !== "playing") return;

    if (normAnswers.includes(TypingUtils.normalize(value))) {
      const strokes = accStrokes + TypingUtils.getStrokeCount(normTarget);
      const targets = completedTargets + 1;
      setAccStrokes(strokes);
      setCompletedTargets(targets);
      setInputValue("");
      wasWrong.current = false;

      if (!isQuiz && phase === "traveling") {
        // 이름 완성 → 도착, 지식 문장 공개
        setPhase("arrived");
      } else {
        // (quiz: 정답 입력 / sequence: 지식 문장 완성) → 다음으로 이동
        if (stationIndex >= stations.length - 1) {
          finish(strokes, targets, mistakes);
          return;
        }
        const nextIndex = stationIndex + 1;
        setStationIndex(nextIndex);
        setPhase("traveling");
        setHintShown(false); setChosungShown(false);
        saveJourneySnapshot(course.id, currentSnapshot(nextIndex, "traveling", strokes, targets, mistakes));
      }
      return;
    }

    // 오타 판정 — 마지막 글자는 IME 조합 중일 수 있으므로("세종" 입력 중 "셎")
    // 마지막 글자를 뺀 입력이 목표의 접두어가 아닐 때만 틀린 것으로 본다.
    // 별칭이 있으면 모든 허용 정답에 대해 틀렸을 때만 오타로 센다.
    const isWrong = normAnswers.every((ans) => checkWrong(ans, TypingUtils.normalize(value)));
    if (isWrong && !wasWrong.current) setMistakes((m) => m + 1);
    wasWrong.current = isWrong;
  };

  const startGame = (resumeRun: boolean) => {
    if (resumeRun && resumeSnapshot) {
      setStationIndex(resumeSnapshot.stationIndex);
      setPhase(resumeSnapshot.phase);
      setAccStrokes(resumeSnapshot.accStrokes);
      setCompletedTargets(resumeSnapshot.completedTargets);
      setMistakes(resumeSnapshot.mistakes);
      startTime.current = performance.now() - resumeSnapshot.elapsedSeconds * 1000;
      setElapsed(resumeSnapshot.elapsedSeconds);
      // shuffle 코스: 저장된 출제 순서 복원 (없으면 새로 섞음 — 구버전 스냅샷 호환)
      if (course.shuffle) {
        setOrder(resumeSnapshot.order && resumeSnapshot.order.length === baseStations.length
          ? resumeSnapshot.order
          : [...baseStations.map((s) => s.id)].sort(() => Math.random() - 0.5));
      }
    } else {
      clearJourneySnapshot(course.id);
      setResumeSnapshot(null);
      setStationIndex(0);
      setPhase("traveling");
      setAccStrokes(0);
      setCompletedTargets(0);
      setMistakes(0);
      startTime.current = performance.now();
      setElapsed(0);
      // shuffle 코스: 새 판마다 새 순서
      if (course.shuffle) setOrder([...baseStations.map((s) => s.id)].sort(() => Math.random() - 0.5));
    }
    setInputValue("");
    setHintShown(false); setChosungShown(false);
    wasWrong.current = false;
    setFinalStats(null);
    setGameState("playing");
    track("journey_start", { course: course.id, resume: resumeRun });
    setTimeout(() => {
      inputRef.current?.focus();
      // 지도 코스: 노트북 등 낮은 화면에서 지도+입력창이 함께 보이도록 입력창을 시야로 스크롤
      if (course.ui === "map") inputRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
    }, 50);
  };

  const revealHint = () => {
    setHintShown(true);
    track("journey_hint", { course: course.id, station: station.id });
    // 혹시 포커스를 잃었더라도 즉시 되돌려 일시정지를 막는다
    inputRef.current?.focus();
  };

  /** 플레이 중단 — 스냅샷 저장 후 준비 화면으로 */
  const exitToReady = () => {
    const snapshot = currentSnapshot(stationIndex, phase, accStrokes, completedTargets, mistakes);
    saveJourneySnapshot(course.id, snapshot);
    if (snapshot.stationIndex >= 1) setResumeSnapshot(snapshot);
    setGameState("ready");
    setInputValue("");
  };

  const liveKpm = elapsed > 1 ? Math.round((accStrokes / elapsed) * 60) : 0;
  const accuracy = TypingUtils.calculateAccuracy(completedTargets, completedTargets + mistakes);
  const isWrongNow = checkWrong(normTarget, TypingUtils.normalize(inputValue));

  // ── 프롬프트 카드 (이동 중: 다음 역 맞히기 / 도착: 지식 문장 필사)
  const promptCard = (compact: boolean) => (
    <div
      className={`w-full rounded-2xl transition-colors text-center ${
        compact
          ? // 모바일 셸은 항상 어두운 배경 — 라이트 테마에서도 흰 글자가 보이게 카드도 어둡게 고정
            `p-3 ${isWrongNow ? "bg-rose-950/70" : "bg-zinc-900"}`
          : `p-6 ${
              isWrongNow
                ? "bg-rose-50 shadow-[0_20px_40px_rgba(190,18,60,0.08)]"
                : phase === "arrived"
                  ? "bg-secondary-container/60 shadow-[0_20px_40px_rgba(21,28,39,0.06)]"
                  : "bg-surface-lowest shadow-[0_20px_40px_rgba(21,28,39,0.06)]"
            }`
      }`}
    >
      {isQuiz ? (
        <>
          {course.ui === "flags" ? (
            /* 국기는 스테이지(JourneyFlagStage) 중앙에 크게 표시 — 프롬프트는 질문만 */
            <p className={`editorial-heading leading-snug ${compact ? "text-base text-white mb-1.5" : "text-xl mb-3"}`}>
              🚩 이 국기의 나라는?
            </p>
          ) : course.ui === "map" ? (
            <div className={`flex flex-col items-center ${compact ? "gap-0.5 mb-1.5" : "gap-1.5 mb-3"}`}>
              <p className={`editorial-heading leading-snug ${compact ? "text-base text-white" : "text-xl"}`}>
                🗺️ 지도에 표시된 나라는?
              </p>
              {station.group && (
                <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-widest ${compact ? "bg-cyan-900/60 text-cyan-200" : "bg-cyan-50 text-cyan-700"}`}>
                  {course.groups?.find((g) => g.id === station.group)?.label || station.group}
                </span>
              )}
            </div>
          ) : (
            <p className={`editorial-heading leading-snug ${compact ? "text-lg text-white mb-1.5" : "text-2xl mb-3"}`}>
              {station.name}
              {course.questionSuffix || "은(는)?"}
            </p>
          )}
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
            {(() => {
              const masked = hideChosung && !chosungShown && !hintShown && !showAllNames;
              const hintText = hintShown || showAllNames
                ? station.fact
                : masked
                  ? "●".repeat(Array.from(station.fact.replace(/\s/g, "")).length)
                  : chosungOf(station.fact);
              // 긴 정답(사우디아라비아·중앙아프리카공화국 등)에서 카드 폭을 넘지 않도록
              // 글자 수에 따라 크기·자간을 줄이고 줄바꿈을 허용한다.
              const len = Array.from(station.fact.replace(/\s/g, "")).length;
              const sizeClass = compact
                ? len > 8 ? "text-sm" : len > 5 ? "text-base" : "text-xl"
                : len > 8 ? "text-lg" : len > 5 ? "text-2xl" : "text-3xl";
              const trackClass = len > 5 ? "tracking-[0.08em]" : "tracking-[0.2em]";
              return (
                <span className={`font-bold break-keep text-center max-w-full ${sizeClass} ${trackClass} ${compact ? "text-violet-300" : "text-primary"} ${masked ? "opacity-40" : ""}`}>
                  {hintText}
                </span>
              );
            })()}
            {hideChosung && !chosungShown && !hintShown && !showAllNames && (
              <button
                type="button"
                onClick={() => { setChosungShown(true); inputRef.current?.focus(); }}
                onPointerDown={(e) => e.preventDefault()}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold active:scale-95 transition-transform whitespace-nowrap shrink-0"
              >
                <Eye size={13} /> 초성 보기
              </button>
            )}
            {!hintShown && !showAllNames && (
              <button
                type="button"
                onClick={revealHint}
                // 입력창 포커스를 뺏지 않는다 — blur 시 모바일 셸이 일시정지되는 것 방지
                onPointerDown={(e) => e.preventDefault()}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-tertiary/10 text-tertiary text-xs font-bold active:scale-95 transition-transform whitespace-nowrap shrink-0"
              >
                <Lightbulb size={13} /> 정답 보기
              </button>
            )}
          </div>
          {!compact && (
            <p className="mt-3 text-xs font-medium text-secondary/70 leading-relaxed">
              {hideChosung && !chosungShown
                ? "초성 숨김 모드 — 힌트 없이 정답을 입력해보세요."
                : "초성 힌트를 보고 정답을 입력하면 다음 문제로 넘어갑니다."}
            </p>
          )}
        </>
      ) : phase === "traveling" ? (
        <>
          {sequenceQuestion && (
            <p className={`font-bold ${compact ? "text-sm text-zinc-300 mb-1" : "text-base text-on-surface mb-2"}`}>
              {sequenceQuestion}
            </p>
          )}
          {/* 주기율표: 원소기호가 곧 문제 — 크게 보여준다 */}
          {course.ui === "periodic" && station.reading && (
            <p
              className={`font-bold ${compact ? "text-3xl mb-1" : "text-5xl mb-2"}`}
              style={{ color: course.lines[0]?.color || "#10b981" }}
            >
              {station.reading}
            </p>
          )}
          <div className="flex items-center justify-center gap-3">
            <span className={`editorial-heading tracking-[0.15em] ${compact ? "text-2xl text-white" : "text-4xl"}`}>
              {hintShown || showAllNames ? station.name : chosungOf(station.name)}
            </span>
            {!hintShown && !showAllNames && (
              <button
                type="button"
                onClick={revealHint}
                // 입력창 포커스를 뺏지 않는다 — blur 시 모바일 셸이 일시정지되는 것 방지
                onPointerDown={(e) => e.preventDefault()}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-tertiary/10 text-tertiary text-xs font-bold active:scale-95 transition-transform"
              >
                <Lightbulb size={13} /> 정답 보기
              </button>
            )}
          </div>
          {!compact && (
            <p className="mt-3 text-xs font-medium text-secondary/70 leading-relaxed">
              초성을 보고 다음 {unit} 이름을 떠올려 입력하세요.
            </p>
          )}
        </>
      ) : (
        <>
          <p className={`font-bold uppercase tracking-[0.2em] ${compact ? "text-[9px] mb-1 text-violet-300" : "text-[10px] mb-3 text-primary"}`}>
            <MapPin size={11} className="inline -mt-0.5 mr-1" />
            {station.name}
            {station.year ? ` · ${station.year}` : ""} 도착
          </p>
          <p className={`editorial-heading leading-snug ${compact ? "text-lg text-white" : "text-2xl text-on-secondary-container"}`}>
            {station.fact}
          </p>
          {!compact && (
            <p className="mt-3 text-xs font-medium text-secondary leading-relaxed">
              {station.detail ? station.detail : "이 문장을 그대로 새기면 다음으로 출발합니다."}
            </p>
          )}
        </>
      )}
    </div>
  );

  const journeyInput = (
    <input
      data-typing-input ref={inputRef}
      type="text"
      value={inputValue}
      onChange={handleInputChange} onKeyDown={(e) => { if (e.key === "Enter" && !e.nativeEvent.isComposing) { e.preventDefault(); setInputValue(""); } }} 
      disabled={gameState !== "playing"}
      className={`w-full text-center font-bold outline-hidden transition-all ${
        isMobilePlaying
          ? `h-12 px-4 text-lg bg-zinc-800 text-white rounded-xl border-2 placeholder:text-zinc-500 ${isWrongNow ? "border-rose-500" : "border-zinc-700 focus:border-violet-500"}`
          : `h-16 px-5 text-2xl text-on-surface bg-surface-lowest rounded-2xl shadow-[0_20px_40px_rgba(21,28,39,0.08)] placeholder:text-zinc-300 placeholder:text-base ring-2 ${
              gameState === "playing"
                ? isWrongNow
                  ? "ring-rose-400"
                  : "ring-transparent focus:ring-primary-container"
                : "ring-transparent opacity-50"
            }`
      }`}
      placeholder={
        gameState !== "playing"
          ? "출발 준비가 되면 시작하세요"
          : isQuiz
            ? "정답을 입력하세요"
            : phase === "traveling"
              ? `다음 ${unit} 이름을 입력하세요`
              : "위 문장을 그대로 입력하세요"
      }
      autoComplete="off"
      autoCorrect="off"
      autoCapitalize="off"
      spellCheck={false}
    />
  );

  const completeModal = gameState === "finished" && finalStats && (
    <JourneyComplete
      course={course}
      stationCount={stations.length}
      kpm={finalStats.kpm}
      accuracy={finalStats.accuracy}
      seconds={finalStats.seconds}
      completionCount={completionCount}
      onRestart={() => startGame(false)}
    />
  );

  // ── 모바일 풀스크린 몰입 모드
  if (isMobilePlaying && overlay) {
    const exitGame = () => {
      if (confirm("여정을 잠시 멈출까요? 진행 상황은 저장됩니다.")) exitToReady();
      else resume();
    };
    const mobileHud = (
      <>
        <span className="flex items-center gap-1">
          <span className="text-[9px] text-zinc-500 font-bold uppercase">진행</span>
          <span className="text-sm font-bold text-violet-400 tabular-nums">
            {Math.min(stationIndex + 1, stations.length)}/{stations.length}
          </span>
        </span>
        <span className="flex items-center gap-1">
          <span className="text-[9px] text-zinc-500 font-bold uppercase">타수</span>
          <span className="text-sm font-bold text-blue-400 tabular-nums">{liveKpm}</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="text-[9px] text-zinc-500 font-bold uppercase">정확도</span>
          <span className="text-sm font-bold text-emerald-400 tabular-nums">{accuracy}%</span>
        </span>
      </>
    );
    return (
      <>
        <MobileGameShell overlay={overlay} hud={mobileHud} input={journeyInput} paused={paused} onResume={resume} onExit={exitGame}>
          <div className="w-full h-full flex flex-col justify-center gap-3 p-3 bg-zinc-950">
            <JourneyViz
              course={course}
              stations={stations}
              currentIndex={stationIndex}
              phase={phase}
              showAllNames={showAllNames}
              variant="strip"
            />
            {promptCard(true)}
          </div>
        </MobileGameShell>
        {mounted && completeModal && createPortal(completeModal, document.body)}
      </>
    );
  }

  const statCell = (label: string, value: React.ReactNode, accent?: string) => (
    <div className="flex flex-col items-center justify-center py-3 rounded-2xl bg-surface-low">
      <span className="text-[9px] text-secondary/70 uppercase font-bold tracking-widest mb-0.5">{label}</span>
      <span className={`text-xl font-bold tabular-nums ${accent || "text-on-surface"}`}>{value}</span>
    </div>
  );

  return (
    <div className="w-full flex flex-col gap-4 py-2 animate-in fade-in duration-700">
      {mounted && completeModal && createPortal(completeModal, document.body)}

      {/* 노트북에서 스크롤 없이 한 화면: 좌측 노선도 / 우측 계기판·프롬프트·입력 */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_330px] gap-4 items-start">
        {/* 노선도 카드 */}
        <div className="relative w-full bg-surface-lowest rounded-2xl shadow-[0_20px_40px_rgba(21,28,39,0.06)] p-4 md:p-6 overflow-hidden">
          {/* 준비 상태에선 긴 시각화 대신 컴팩트한 시작 카드 — 스크롤 없이 바로 시작 */}
          {gameState === "ready" ? (
            <div className="flex items-center justify-center py-14 px-4">
              <div className="glass-card !rounded-2xl p-8 flex flex-col items-center gap-5 max-w-sm w-full">
                <div className="text-5xl">{course.emoji}</div>
                <div className="text-center">
                  <h3 className="editorial-heading text-2xl mb-1">{course.title}</h3>
                  <p className="text-secondary text-xs font-medium leading-relaxed">
                    {course.subtitle}.{" "}
                    {isQuiz
                      ? "질문을 보고 초성 힌트로 정답을 떠올려 입력하세요."
                      : `초성을 보고 다음 ${unit} 이름을 입력해 이동하고, 도착하면 공개되는 핵심 지식 한 줄까지 새겨야 출발합니다.`}
                  </p>
                </div>
                {resumeSnapshot ? (
                  <div className="w-full flex flex-col gap-2">
                    <button
                      onClick={() => startGame(true)}
                      className="w-full py-4 primary-gradient text-white text-lg font-bold rounded-2xl transition-all shadow-xl hover:opacity-90 active:scale-95 flex items-center justify-center gap-2"
                    >
                      <Play size={20} fill="currentColor" /> {resumeSnapshot.stationIndex + 1}번째부터 이어가기
                    </button>
                    <button
                      onClick={() => startGame(false)}
                      className="w-full py-3 bg-surface-high text-secondary text-sm font-bold rounded-2xl transition-all active:scale-95"
                    >
                      처음부터 다시 출발
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => startGame(false)}
                    className="w-full py-4 primary-gradient text-white text-lg font-bold rounded-2xl transition-all shadow-xl hover:opacity-90 active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Play size={20} fill="currentColor" /> 시작하기
                  </button>
                )}
                {completionCount > 0 && (
                  <p className="text-[11px] font-bold text-secondary/70">지금까지 {completionCount}번 완주했어요</p>
                )}
              </div>
            </div>
          ) : (
            <JourneyViz
              course={course}
              stations={stations}
              currentIndex={stationIndex}
              phase={phase}
              finished={gameState === "finished"}
              showAllNames={showAllNames || gameState !== "playing"}
              variant="full"
            />
          )}
        </div>

        {/* 사이드 패널: 계기판 + 프롬프트 + 입력 */}
        <div className="flex flex-col gap-3 lg:sticky lg:top-20">
          <div className="bg-surface-lowest rounded-2xl shadow-[0_20px_40px_rgba(21,28,39,0.06)] p-3">
            <div className="grid grid-cols-2 gap-2">
              {statCell(
                "진행",
                `${gameState === "playing" ? Math.min(stationIndex + 1, stations.length) : 0}/${stations.length}`,
                "text-primary"
              )}
              {statCell("현재 타수", liveKpm, "text-primary-container")}
              {statCell(
                "시간",
                <span className="flex items-center gap-1">
                  <Timer size={15} className="text-secondary" />
                  {Math.floor(elapsed / 60)}:{String(Math.floor(elapsed % 60)).padStart(2, "0")}
                </span>
              )}
              {statCell("정확도", `${accuracy}%`)}
            </div>
            <button
              type="button"
              onClick={() => setShowAllNames((v) => !v)}
              className={`mt-2 w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl text-xs font-bold transition-colors ${
                showAllNames ? "bg-surface-high text-secondary" : "primary-gradient text-white"
              }`}
            >
              {showAllNames ? <Eye size={14} /> : <EyeOff size={14} />}
              {showAllNames ? "이름 전체 보기 중 — 암기 모드로" : "암기 모드 (이름 숨김)"}
            </button>
            {/* 하드 모드: 초성 힌트까지 가림 (퀴즈 코스 전용, 설정 유지) */}
            {isQuiz && (
              <button
                type="button"
                onClick={toggleHideChosung}
                onPointerDown={(e) => e.preventDefault()}
                className={`mt-2 w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl text-xs font-bold transition-colors ${
                  hideChosung ? "bg-zinc-900 text-amber-300" : "bg-surface-high text-secondary"
                }`}
              >
                {hideChosung ? <EyeOff size={14} /> : <Eye size={14} />}
                {hideChosung ? "초성 숨김 모드 켜짐 — 힌트 없이 도전 중" : "초성 숨김 모드 (하드)"}
              </button>
            )}
          </div>

          {gameState === "playing" && promptCard(false)}
          {journeyInput}
        </div>
      </div>
    </div>
  );
};
