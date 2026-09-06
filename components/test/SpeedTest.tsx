"use client";

import { usePracticeT } from '@/lib/i18n/practice-ui';
import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { TypingUtils } from "@/lib/typing-speed";
import { track } from "@/lib/analytics";
import { SHORT_TEXT_DB } from "@/lib/short-text-data";
import { scrollIntoViewOnFocus } from "@/hooks/useVirtualKeyboard";
import { Timer, Zap, Target, RotateCcw, Download, Share2, Trophy, ChevronRight, Gamepad2 } from "lucide-react";
import Link from "next/link";

const TEST_SECONDS = 60;

// 티어별 컬러/이모지 (결과 카드 디자인에 사용)
const TIER_META: Record<string, { colors: [string, string]; emoji: string }> = {
  SSS: { colors: ["#7c3aed", "#312e81"], emoji: "👑" },
  SS: { colors: ["#dc2626", "#7f1d1d"], emoji: "🔥" },
  S: { colors: ["#ea580c", "#7c2d12"], emoji: "⚡" },
  A: { colors: ["#2563eb", "#1e3a8a"], emoji: "🚀" },
  B: { colors: ["#059669", "#064e3b"], emoji: "🌱" },
  C: { colors: ["#0891b2", "#164e63"], emoji: "🐣" },
  D: { colors: ["#64748b", "#1e293b"], emoji: "🐢" },
};

function parseGrade(grade: string): { tier: string; name: string } {
  const m = grade.match(/^(\S+)급 \((.+)\)$/);
  return m ? { tier: m[1], name: m[2] } : { tier: "D", name: "연습필요" };
}

export const SpeedTest: React.FC = () => {
  const { isEn, t, href } = usePracticeT();
  const [gameState, setGameState] = useState<"ready" | "running" | "done">("ready");
  const [sentences, setSentences] = useState<string[]>([]);
  const [sentenceIndex, setSentenceIndex] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [timeLeft, setTimeLeft] = useState(TEST_SECONDS);
  const [liveKpm, setLiveKpm] = useState(0);
  const [result, setResult] = useState<{ kpm: number; accuracy: number; grade: string } | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const startTimeRef = useRef<number | null>(null);
  const statsRef = useRef({ strokes: 0, correct: 0, typed: 0 });
  const inputValueRef = useRef("");
  const targetRef = useRef("");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const target = sentences[sentenceIndex] || "";
  const targetNorm = useMemo(() => TypingUtils.normalize(target), [target]);
  targetRef.current = target;
  inputValueRef.current = inputValue;

  const startTest = () => {
    const pool = SHORT_TEXT_DB.flatMap((c) => c.sentences).sort(() => Math.random() - 0.5);
    setSentences(pool);
    setSentenceIndex(0);
    setInputValue("");
    setTimeLeft(TEST_SECONDS);
    setLiveKpm(0);
    setResult(null);
    statsRef.current = { strokes: 0, correct: 0, typed: 0 };
    startTimeRef.current = null;
    setGameState("running");
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  // 문장 하나(또는 마지막 부분 입력)의 성적을 누적
  const accumulate = useCallback((typed: string, targetText: string) => {
    const typedNorm = TypingUtils.normalize(typed);
    const tNorm = TypingUtils.normalize(targetText);
    let correct = 0;
    for (let i = 0; i < typedNorm.length; i++) if (typedNorm[i] === tNorm[i]) correct++;
    statsRef.current.strokes += TypingUtils.getStrokeCount(typedNorm);
    statsRef.current.correct += correct;
    statsRef.current.typed += typedNorm.length;
  }, []);

  const finishTest = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    // 마지막으로 치던 부분 입력까지 포함
    if (inputValueRef.current) accumulate(inputValueRef.current, targetRef.current);
    const { strokes, correct, typed } = statsRef.current;
    const kpm = Math.round((strokes / TEST_SECONDS) * 60);
    const accuracy = TypingUtils.calculateAccuracy(correct, typed);
    const grade = TypingUtils.getGrade(kpm, accuracy);
    setResult({ kpm, accuracy, grade });
    setGameState("done");
    track('speed_test_complete', { kpm, accuracy, tier: grade });
  }, [accumulate]);

  // 타이머: 첫 입력부터 60초
  useEffect(() => {
    if (gameState !== "running") return;
    timerRef.current = setInterval(() => {
      if (!startTimeRef.current) return;
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const left = Math.max(0, TEST_SECONDS - elapsed);
      setTimeLeft(left);
      const liveStrokes = statsRef.current.strokes + TypingUtils.getStrokeCount(TypingUtils.normalize(inputValueRef.current));
      setLiveKpm(elapsed > 1 ? Math.round((liveStrokes / elapsed) * 60) : 0);
      if (left <= 0) finishTest();
    }, 200);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [gameState, finishTest]);

  const checkComplete = (val: string) => {
    const typedNorm = TypingUtils.normalize(val);
    if (typedNorm.length >= targetNorm.length &&
        typedNorm.charAt(typedNorm.length - 1) === targetNorm.charAt(targetNorm.length - 1)) {
      accumulate(val, target);
      setSentenceIndex((prev) => (prev + 1) % sentences.length);
      setInputValue("");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (gameState !== "running") return;
    const val = e.target.value;
    if (!startTimeRef.current && val.length > 0) {
      startTimeRef.current = Date.now();
      track('speed_test_start');
    }
    setInputValue(val);
    checkComplete(val);
  };

  // 일부 브라우저/IME는 마지막 글자 조합이 끝나야 값이 확정됨 — 조합 종료 시 한 번 더 판정
  const handleCompositionEnd = (e: React.CompositionEvent<HTMLInputElement>) => {
    if (gameState !== "running") return;
    checkComplete((e.target as HTMLInputElement).value);
  };

  // 문장 하이라이트 (ShortPractice와 동일한 패턴)
  const renderHighlightedText = () => {
    if (!target) return null;
    const typedNorm = TypingUtils.normalize(inputValue);
    return target.split("").map((char, i) => {
      const normChar = TypingUtils.normalize(char);
      let cls = "text-zinc-300";
      if (i === inputValue.length) cls = "text-primary font-bold bg-primary/10 rounded-sm";
      else if (i < inputValue.length) cls = typedNorm.charAt(i) === normChar ? "text-on-surface font-bold" : "text-red-500 line-through opacity-70";
      return <span key={i} className={cls}>{char}</span>;
    });
  };

  // ── 결과 카드 이미지 생성 (1080×1080 캔버스) ──────────────────────────────
  const drawResultCard = (): HTMLCanvasElement | null => {
    if (!result) return null;
    const { tier, name } = parseGrade(result.grade);
    const meta = TIER_META[tier] || TIER_META.D;
    const c = document.createElement("canvas");
    c.width = 1080; c.height = 1080;
    const ctx = c.getContext("2d");
    if (!ctx) return null;

    const grad = ctx.createLinearGradient(0, 0, 1080, 1080);
    grad.addColorStop(0, meta.colors[0]);
    grad.addColorStop(1, meta.colors[1]);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1080, 1080);

    // 장식 원
    ctx.fillStyle = "rgba(255,255,255,0.06)";
    ctx.beginPath(); ctx.arc(950, 130, 260, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(120, 980, 300, 0, Math.PI * 2); ctx.fill();

    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(255,255,255,0.75)";
    ctx.font = "700 36px sans-serif";
    ctx.fillText(t("한글타자왕 · 1분 타자 속도 테스트"), 540, 130);

    ctx.font = "120px sans-serif";
    ctx.fillText(meta.emoji, 540, 300);

    ctx.fillStyle = "#ffffff";
    ctx.font = "900 220px sans-serif";
    ctx.fillText(isEn ? tier : `${tier}급`, 540, 530);

    ctx.font = "800 56px sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.fillText(t(name), 540, 620);

    // 스탯 박스
    ctx.fillStyle = "rgba(255,255,255,0.12)";
    const bx = 140, by = 690, bw = 800, bh = 200, br = 40;
    ctx.beginPath();
    ctx.moveTo(bx + br, by);
    ctx.arcTo(bx + bw, by, bx + bw, by + bh, br);
    ctx.arcTo(bx + bw, by + bh, bx, by + bh, br);
    ctx.arcTo(bx, by + bh, bx, by, br);
    ctx.arcTo(bx, by, bx + bw, by, br);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.font = "900 96px sans-serif";
    ctx.fillText(isEn ? String(result.kpm) : `${result.kpm}타`, 340, 820);
    ctx.fillText(`${result.accuracy}%`, 740, 820);
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.font = "700 32px sans-serif";
    ctx.fillText(t("분당 타수"), 340, 865);
    ctx.fillText(t("정확도"), 740, 865);

    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.font = "700 34px sans-serif";
    ctx.fillText(t("나도 측정하러 가기 → www.hangul-tajawang.com"), 540, 990);
    return c;
  };

  const downloadCard = () => {
    const c = drawResultCard();
    if (!c) return;
    track('tier_card_download');
    c.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = isEn ? `typing-tier-${result?.kpm}-cpm.png` : `한글타자왕_타자티어_${result?.kpm}타.png`;
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  const shareCard = async () => {
    const c = drawResultCard();
    if (!c || !result) return;
    track('tier_card_share');
    c.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], "typing-tier.png", { type: "image/png" });
      const shareData = {
        title: t("한글타자왕 타자 티어"),
        text: isEn
          ? `My 1-minute Korean typing test: tier ${parseGrade(result.grade).tier}, ${result.kpm} CPM. Try it!`
          : `1분 타자 테스트 결과: ${result.grade}, ${result.kpm}타! 너도 측정해봐 👉`,
        url: `https://www.hangul-tajawang.com${href("/test")}`,
        files: [file],
      };
      try {
        if (navigator.canShare?.({ files: [file] })) await navigator.share(shareData);
        else if (navigator.share) await navigator.share({ title: shareData.title, text: shareData.text, url: shareData.url });
        else downloadCard();
      } catch { /* 사용자가 공유 취소 */ }
    });
  };

  // ── 렌더 ──────────────────────────────────────────────────────────────────
  if (gameState === "done" && result) {
    const { tier, name } = parseGrade(result.grade);
    const meta = TIER_META[tier] || TIER_META.D;
    return (
      <div className="w-full max-w-xl mx-auto py-6 md:py-12 px-4 animate-in zoom-in duration-500">
        <div className="rounded-2xl md:rounded-2xl p-8 md:p-14 text-center text-white shadow-2xl relative overflow-hidden"
             style={{ background: `linear-gradient(135deg, ${meta.colors[0]}, ${meta.colors[1]})` }}>
          <p className="text-white/70 font-bold text-[10px] md:text-xs uppercase tracking-[0.3em] mb-6">{t("1분 타자 속도 테스트 결과")}</p>
          <div className="text-6xl mb-4">{meta.emoji}</div>
          <h2 className="text-6xl md:text-8xl font-bold mb-2 tracking-tighter">{tier}{isEn ? '' : '급'}</h2>
          <p className="text-xl md:text-2xl font-bold text-white/90 mb-8">{t(name)}</p>
          <div className="grid grid-cols-2 gap-3 md:gap-4 mb-8">
            <div className="bg-white/10 rounded-2xl p-4 md:p-6"><p className="text-3xl md:text-4xl font-bold">{result.kpm}{isEn ? " CPM" : "타"}</p><p className="text-[10px] md:text-xs font-bold text-white/60 mt-1">{t("분당 타수")}</p></div>
            <div className="bg-white/10 rounded-2xl p-4 md:p-6"><p className="text-3xl md:text-4xl font-bold">{result.accuracy}%</p><p className="text-[10px] md:text-xs font-bold text-white/60 mt-1">{t("정확도")}</p></div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={shareCard} className="flex-1 py-4 bg-white text-zinc-900 font-bold rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all"><Share2 size={18} /> {t("결과 자랑하기")}</button>
            <button onClick={downloadCard} className="flex-1 py-4 bg-white/15 border border-white/30 font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-white/25 transition-all"><Download size={18} /> {t("이미지 저장")}</button>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <button onClick={startTest} className="w-full py-5 bg-zinc-900 text-white text-lg font-bold rounded-2xl hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2"><RotateCcw size={20} /> {t("다시 측정하기")}</button>

          {/* 측정 이후의 동선 — 코어 3개로 연결 */}
          <Link prefetch={false} href={isEn ? href('/practice/word') : '/journey'} className="group paper-card p-5 flex items-center justify-between hover:border-primary/50 transition-colors">
            <div>
              <p className="font-bold text-on-surface group-hover:text-primary transition-colors">{isEn ? 'Build accuracy one word at a time' : '측정은 끝. 이제 손으로 외워볼까?'}</p>
              <p className="text-sm text-zinc-500 mt-0.5">{isEn ? 'Practice Korean words by keyboard region' : '조선 왕조·세계 수도를 타자로 정복하는 지식타자'}</p>
            </div>
            <ChevronRight size={18} className="text-zinc-400 group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
          </Link>
          <Link prefetch={false} href={isEn ? href('/transcription') : '/challenge'} className="group paper-card p-5 flex items-center justify-between hover:border-primary/50 transition-colors">
            <div>
              <p className="font-bold text-on-surface group-hover:text-primary transition-colors">{isEn ? 'Put your skills to work with literature' : '이 속도로 필사 챌린지 랭킹에 도전'}</p>
              <p className="text-sm text-zinc-500 mt-0.5">{result.kpm}{isEn ? " CPM" : "타"}{isEn ? ' — try a poem or story' : '면 충분해요 — 좋은 문장으로 실전처럼'}</p>
            </div>
            <ChevronRight size={18} className="text-zinc-400 group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
          </Link>
          <div className="grid grid-cols-2 gap-3">
            <Link prefetch={false} href={href("/practice")} className="py-4 bg-surface-low rounded-2xl font-bold text-sm flex items-center justify-center gap-1.5 hover:text-primary transition-colors"><Trophy size={16} /> {t("타수 올리는 연습")} <ChevronRight size={14} /></Link>
            <Link prefetch={false} href={href("/game/typing-race")} className="py-4 bg-surface-low rounded-2xl font-bold text-sm flex items-center justify-center gap-1.5 hover:text-primary transition-colors"><Gamepad2 size={16} /> {t("타자 레이스 도전")} <ChevronRight size={14} /></Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto py-4 md:py-10 px-4">
      {/* 대시보드 — 노트북처럼 세로가 짧은 화면에서 입력 중에도 타이머/실시간 타수가 보이도록 상단 고정 */}
      <div className="sticky top-20 z-30 flex justify-center gap-3 md:gap-6 mb-4 md:mb-10">
        <div className="flex items-center gap-2 bg-surface-lowest px-4 py-2.5 md:px-6 md:py-3 rounded-2xl shadow-sm">
          <Timer size={18} className={timeLeft <= 10 && gameState === "running" ? "text-red-500 animate-pulse" : "text-primary"} />
          <span className={`text-xl md:text-2xl font-bold tabular-nums ${timeLeft <= 10 && gameState === "running" ? "text-red-500" : "text-on-surface"}`}>{Math.ceil(timeLeft)}s</span>
        </div>
        <div className="flex items-center gap-2 bg-surface-lowest px-4 py-2.5 md:px-6 md:py-3 rounded-2xl shadow-sm"><Zap size={18} className="text-yellow-500" /><span className="text-xl md:text-2xl font-bold text-on-surface tabular-nums">{liveKpm}{isEn ? " CPM" : "타"}</span></div>
      </div>

      {/* 문장 카드 */}
      <div className="relative w-full bg-surface-lowest shadow-[0_30px_60px_rgba(21,28,39,0.08)] p-6 sm:p-10 md:p-16 rounded-2xl md:rounded-2xl text-center mb-4 md:mb-8 min-h-[120px] md:min-h-[180px] flex items-center justify-center">
        {gameState === "ready" ? (
          <div className="flex flex-col items-center gap-6 py-4">
            <p className="text-zinc-500 font-medium leading-relaxed break-keep">{t("60초 동안 나오는 문장을 정확하고 빠르게 입력하세요.")}<br className="hidden sm:block" /> {t("타이머는")} <strong className="text-on-surface">{t("첫 글자를 치는 순간")}</strong> {t("시작됩니다.")}</p>
            <button onClick={startTest} className="px-10 py-5 primary-gradient text-white text-lg font-bold rounded-full shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">{t("테스트 시작하기")}</button>
          </div>
        ) : (
          <div className="text-xl sm:text-2xl md:text-4xl leading-relaxed font-plus-jakarta font-bold select-none break-keep">{renderHighlightedText()}</div>
        )}
      </div>

      {/* 입력창 */}
      <input
        key={`s-${sentenceIndex}`}
        aria-label={isEn ? 'Korean typing test input' : '타자 테스트 입력'} lang="ko" data-typing-input ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onCompositionEnd={handleCompositionEnd}
        onFocus={() => scrollIntoViewOnFocus(inputRef.current)}
        disabled={gameState !== "running"}
        autoFocus
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        className={`w-full h-16 md:h-24 px-5 md:px-10 text-xl md:text-3xl bg-surface-lowest rounded-2xl md:rounded-2xl shadow-lg outline-hidden text-center font-bold transition-all ${gameState === "running" ? "ring-4 ring-primary/10 focus:ring-primary/30" : "opacity-50"}`}
        placeholder={gameState === "running" ? t("여기에 입력하세요") : t("시작 버튼을 눌러주세요")}
      />
      <p className="mt-4 text-center text-[10px] md:text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center justify-center gap-2"><Target size={13} /> {t("문장을 끝까지 치면 자동으로 다음 문장이 나옵니다")}</p>
    </div>
  );
};
