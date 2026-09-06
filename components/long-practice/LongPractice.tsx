"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { LONG_TEXT_DB, PILSA_SERIES, type LongTextData } from "@/lib/long-text-data";
import { TypingUtils, TypingReport } from "@/lib/typing-speed";
import { Clock, Target, Zap, RotateCcw, BookOpen, ScrollText, Keyboard, Award, Sparkles, User, Send, MessageSquare, Trash2, Users, Heart, ArrowRight, Type, Star, Flame, ChevronRight, Feather } from "lucide-react";
import { SupabaseService, supabase } from "@/lib/supabase";
import { track } from "@/lib/analytics";
import { KeyboardAdBanner } from "../layout/KeyboardAdBanner";
import Link from "next/link";
import Image from "next/image";
import { scrollIntoViewOnFocus } from "@/hooks/useVirtualKeyboard";
import { recordCompletion, saveProgress, clearProgress, getRecord, PilsaSourceMeta, PilsaProgress } from "@/lib/pilsa-library";
import { ShareButton } from "@/components/books/ShareButton";
import { AdSenseUnit } from "../layout/AdSenseUnit";

interface Props {
  externalContent?: any;
  initialTextId?: string;
  /** DB(책방)에서 온 화 — LONG_TEXT_DB에 없어도 동작 */
  dbText?: LongTextData;
  /** dbText일 때 다음 화 (undefined면 정적 DB에서 탐색) */
  dbNextText?: { id: string; title: string } | null;
}

type FontType = "font-noto" | "font-myeongjo" | "font-batang" | "font-dodum" | "font-pen" | "font-brush" | "font-gaegu" | "font-poor" | "font-dokdo" | "font-gamja" | "font-single" | "font-yeon" | "font-stylish" | "font-jua";

function createMobileSegments(content: string, isSerializedBook: boolean): string[] {
  const normalized = content.replace(/\r\n?/g, "\n").trim();
  if (!normalized) return [];
  if (!isSerializedBook) {
    return normalized.split("\n").filter((line) => line.trim().length > 0);
  }
  return normalized
    .split(/\n[\t ]*\n+/)
    .map((paragraph) => paragraph.replace(/\s*\n\s*/g, " ").trim())
    .filter(Boolean);
}

function keepKoreanCounterTogether(title: string): string {
  return title.replace(/([가-힣0-9]+) (권|화|장|편|개|명)(?=의?(?:\s|$))/g, "$1\u00a0$2");
}

function mobileProgressFromDesktopInput(
  input: string,
  segments: readonly string[],
  isSerializedBook: boolean,
): { lineIndex: number; lineInput: string } {
  if (!input || segments.length === 0) return { lineIndex: 0, lineInput: "" };
  const typedSegments = createMobileSegments(input, isSerializedBook);
  const endsAtBoundary = isSerializedBook ? /\n[\t ]*\n+$/.test(input) : /\n+$/.test(input);
  const lineIndex = Math.min(
    endsAtBoundary ? typedSegments.length : Math.max(0, typedSegments.length - 1),
    segments.length - 1,
  );
  return {
    lineIndex,
    lineInput: endsAtBoundary ? "" : (typedSegments.at(-1) || "").slice(0, segments[lineIndex].length),
  };
}

function desktopInputFromMobileProgress(
  segments: readonly string[],
  lineIndex: number,
  lineInput: string,
  isSerializedBook: boolean,
): string {
  const delimiter = isSerializedBook ? "\n\n" : "\n";
  const completed = segments.slice(0, lineIndex).join(delimiter);
  return completed ? `${completed}${delimiter}${lineInput}` : lineInput;
}

function mobileAccumulatorsFromDesktopInput(
  input: string,
  segments: readonly string[],
  completedSegments: number,
  isSerializedBook: boolean,
): { strokes: number; correct: number; typed: number } {
  const typedSegments = createMobileSegments(input, isSerializedBook);
  let strokes = 0;
  let correct = 0;
  let typed = 0;
  for (let segmentIndex = 0; segmentIndex < completedSegments; segmentIndex += 1) {
    const target = TypingUtils.normalize(segments[segmentIndex] || "");
    const entered = TypingUtils.normalize(typedSegments[segmentIndex] || "");
    strokes += TypingUtils.getStrokeCount(entered);
    typed += entered.length;
    for (let charIndex = 0; charIndex < entered.length; charIndex += 1) {
      if (entered[charIndex] === target[charIndex]) correct += 1;
    }
  }
  return { strokes, correct, typed };
}

export const LongPractice: React.FC<Props> = ({ externalContent, initialTextId, dbText, dbNextText }) => {
  const [selectedTextId, setSelectedTextId] = useState(initialTextId || LONG_TEXT_DB[0].id);
  const [inputValue, setInputValue] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [report, setReport] = useState<TypingReport | null>(null);
  const [fontSize, setFontSize] = useState(24);
  const [fontFamily, setFontFamily] = useState<FontType>("font-myeongjo");
  const [paperType, setPaperType] = useState<"white" | "hanji" | "kraft">("white");
  
  const [user, setUser] = useState<any>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState<number>(externalContent?.like_count || 0);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [related, setRelated] = useState<{ authorOther: any[], popular: any[] }>({ authorOther: [], popular: [] });

  // 모바일 줄 단위 모드 상태
  // SSR/hydration 시에는 데스크톱 마크업을 렌더하고(mounted=false), 마운트 후 모바일이면 줄 모드로 전환한다.
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [lineIndex, setLineIndex] = useState(0);
  const [lineInput, setLineInput] = useState("");
  const lineInputRef = useRef<HTMLInputElement>(null);
  // 줄 성적 누적값 (리렌더와 무관하게 유지)
  const accStrokesRef = useRef(0);
  const accCorrectRef = useRef(0);
  const accTypedRef = useRef(0);

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentText = useMemo(() =>
    externalContent || dbText || LONG_TEXT_DB.find(t => t.id === selectedTextId) || LONG_TEXT_DB[0],
  [externalContent, dbText, selectedTextId]);
  const displayTitle = useMemo(() => keepKoreanCounterTogether(currentText.title), [currentText.title]);

  const lines = useMemo(
    () => createMobileSegments(currentText.content, Boolean(currentText.seriesId)),
    [currentText.content, currentText.seriesId]
  );

  // ── 내 서재 (필사 기록) ───────────────────────────────────────────────
  const sourceMeta = useMemo<PilsaSourceMeta>(() =>
    externalContent
      ? {
          sourceType: "challenge",
          sourceId: String(externalContent.id),
          title: externalContent.title || "무제",
          author: externalContent.profiles?.nickname || "익명",
          category: "챌린지",
          content: externalContent.content,
        }
      : {
          sourceType: "work",
          sourceId: currentText.id,
          title: currentText.title,
          author: currentText.author,
          category: currentText.category,
        },
  [externalContent, currentText]);

  // 이어하기: 저장된 진행 스냅샷이 있으면 배너로 제안
  const [resume, setResume] = useState<PilsaProgress | null>(null);

  // 진행 시간은 100ms마다 갱신되므로 자동저장 디바운스가 깨지지 않게 ref로 미러링
  const elapsedRef = useRef(0);
  useEffect(() => { elapsedRef.current = elapsedSeconds; }, [elapsedSeconds]);

  // 마운트 후 뷰포트 폭으로 모바일 여부 판정 + 브레이크포인트 변화 감지
  useEffect(() => {
    setMounted(true);
    const mql = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const saved = getRecord(sourceMeta.sourceType, sourceMeta.sourceId)?.progress;
    setReport(null);
    if (saved) {
      const hasMobileSnapshot = Boolean(saved.lineInput) || (saved.lineIndex || 0) > 0;
      const mobileProgress = hasMobileSnapshot
        ? {
            lineIndex: Math.min(saved.lineIndex || 0, Math.max(0, lines.length - 1)),
            lineInput: saved.lineInput || "",
          }
        : mobileProgressFromDesktopInput(saved.inputValue || "", lines, Boolean(currentText.seriesId));
      const desktopInput = saved.inputValue || desktopInputFromMobileProgress(
        lines,
        mobileProgress.lineIndex,
        mobileProgress.lineInput,
        Boolean(currentText.seriesId),
      );
      setInputValue(desktopInput);
      setLineIndex(mobileProgress.lineIndex);
      setLineInput(mobileProgress.lineInput);
      accStrokesRef.current = saved.accStrokes || 0;
      accCorrectRef.current = saved.accCorrect || 0;
      accTypedRef.current = saved.accTyped || 0;
      setElapsedSeconds(saved.elapsedSeconds || 0);
      setStartTime(Date.now() - (saved.elapsedSeconds || 0) * 1000);
      setResume(saved);
      return;
    }
    setInputValue("");
    setLineIndex(0);
    setLineInput("");
    setStartTime(null);
    setElapsedSeconds(0);
    setResume(null);
    accStrokesRef.current = 0;
    accCorrectRef.current = 0;
    accTypedRef.current = 0;
  }, [currentText.seriesId, lines, sourceMeta.sourceId, sourceMeta.sourceType]);

  const fetchSocialData = useCallback(async () => {
    if (!externalContent) return;
    const currentUser = await SupabaseService.getCurrentUser();
    setUser(currentUser);
    if (currentUser) {
        const { data: like } = await supabase.from('likes').select().match({ user_id: currentUser.id, content_id: externalContent.id }).maybeSingle();
        setIsLiked(!!like);
    }
    const [cData, relData] = await Promise.all([
        supabase.from('typing_comments').select('*, profiles(nickname, avatar_url)').eq('content_id', externalContent.id).order('created_at', { ascending: false }),
        SupabaseService.getRelatedContents(externalContent.author_id, externalContent.id)
    ]);
    setComments(cData.data || []);
    setRelated(relData);
  }, [externalContent]);

  useEffect(() => {
    fetchSocialData();
  }, [fetchSocialData]);

  useEffect(() => {
    let timer: any;
    if (startTime && !report) {
      timer = setInterval(() => setElapsedSeconds((Date.now() - startTime) / 1000), 100);
    }
    return () => clearInterval(timer);
  }, [startTime, report]);

  // 타이핑 진행에 따라 원문 패널을 현재 위치로 자동 스크롤
  // (모바일에서 화면이 좁아도 항상 현재 문장이 보이도록)
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const currentEl = container.querySelector<HTMLElement>('[data-current="true"]');
    if (!currentEl) return;
    const target = currentEl.offsetTop - container.clientHeight / 2;
    if (Math.abs(container.scrollTop - target) > 40) {
      container.scrollTo({ top: Math.max(0, target), behavior: "smooth" });
    }
  }, [inputValue.length]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // 완주 처리는 한 번만. 이 가드가 없으면 입력 길이가 본문 길이에 도달한 뒤
    // 키를 누를 때마다 아래 완주 블록이 다시 돌아, 완주 기록(typing_results)이
    // 0.01초 간격으로 수천 건씩 쌓인다. 줄 단위 모드(handleLineInputChange)에는
    // 원래부터 같은 가드가 있다.
    if (report) return;
    const val = e.target.value;
    if (!startTime && val.length > 0) {
      setStartTime(Date.now());
      track('pilsa_start', { content_id: currentText.id, source: externalContent ? 'challenge' : 'library' });
    }
    setInputValue(val);
    if (val.length >= currentText.content.length) {
      const finalReport = TypingUtils.generateReport(currentText.content, val, 0, elapsedSeconds);
      setReport(finalReport);
      track('pilsa_complete', { content_id: currentText.id, source: externalContent ? 'challenge' : 'library', kpm: finalReport.kpm, accuracy: finalReport.accuracy });
      // 내 서재에 책으로 기록
      recordCompletion(sourceMeta, { date: new Date().toISOString(), kpm: finalReport.kpm, accuracy: finalReport.accuracy, seconds: Math.round(elapsedSeconds) });
      if (externalContent) {
        SupabaseService.saveResult(externalContent.id, finalReport.kpm, finalReport.accuracy, Math.round(elapsedSeconds));
      }
    }
  };

  const handleToggleLike = async () => {
    if (!user) return alert("로그인 후 이용 가능합니다.");
    try {
      await SupabaseService.toggleLike(externalContent.id, isLiked, externalContent.author_id);
      setIsLiked(!isLiked);
      setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    } catch (e) { alert("처리 실패"); }
  };

  const handleAddComment = async () => {
    if (!user || !newComment.trim()) return;
    setCommentLoading(true);
    try {
      await SupabaseService.addComment(externalContent.id, newComment.trim(), externalContent.author_id);
      setNewComment("");
      const { data } = await supabase.from('typing_comments').select('*, profiles(nickname, avatar_url)').eq('content_id', externalContent.id).order('created_at', { ascending: false });
      setComments(data || []);
    } finally { setCommentLoading(false); }
  };

  const handleDeleteComment = async (id: string) => {
    if (!confirm("댓글을 삭제하시겠습니까?")) return;
    await SupabaseService.deleteComment(id);
    setComments(prev => prev.filter(c => c.id !== id));
  };

  const resetState = () => {
    setInputValue(""); setStartTime(null); setElapsedSeconds(0); setReport(null);
    setLineIndex(0); setLineInput("");
    accStrokesRef.current = 0; accCorrectRef.current = 0; accTypedRef.current = 0;
  };

  // ── 이어하기: 진행 스냅샷 자동 저장 (입력이 멈춘 뒤 800ms 디바운스) ──
  useEffect(() => {
    if (report) return;
    const desktopTotalChars = Math.max(1, currentText.content.length);
    const mobileTotalChars = Math.max(1, lines.reduce((sum: number, line: string) => sum + line.length, 0));
    const completedChars = lines.slice(0, lineIndex).reduce((a: number, l: string) => a + l.length, 0);
    const percent = isMobile
      ? ((completedChars + lineInput.length) / mobileTotalChars) * 100
      : (inputValue.length / desktopTotalChars) * 100;
    if (percent < 2) return;
    const t = setTimeout(() => {
      const desktopProgress = mobileProgressFromDesktopInput(inputValue, lines, Boolean(currentText.seriesId));
      const desktopAccumulators = mobileAccumulatorsFromDesktopInput(
        inputValue,
        lines,
        desktopProgress.lineIndex,
        Boolean(currentText.seriesId),
      );
      saveProgress(sourceMeta, {
        inputValue: isMobile
          ? desktopInputFromMobileProgress(lines, lineIndex, lineInput, Boolean(currentText.seriesId))
          : inputValue,
        lineInput: isMobile ? lineInput : desktopProgress.lineInput,
        lineIndex: isMobile ? lineIndex : desktopProgress.lineIndex,
        accStrokes: isMobile ? accStrokesRef.current : desktopAccumulators.strokes,
        accCorrect: isMobile ? accCorrectRef.current : desktopAccumulators.correct,
        accTyped: isMobile ? accTypedRef.current : desktopAccumulators.typed,
        elapsedSeconds: Math.round(elapsedRef.current),
        percent: Math.round(percent),
        updatedAt: new Date().toISOString(),
      });
    }, 800);
    return () => clearTimeout(t);
  }, [inputValue, isMobile, lineIndex, lineInput, report, sourceMeta, currentText.content.length, currentText.seriesId, lines]);

  const dismissResume = () => {
    clearProgress(sourceMeta.sourceType, sourceMeta.sourceId);
    resetState();
    setResume(null);
  };

  const resumeBanner = resume && !report ? (
    <div className="w-full max-w-3xl mx-auto mb-3 flex items-center justify-between gap-3 px-4 md:px-5 py-3 bg-primary/10 border border-primary/30 rounded-2xl animate-in fade-in duration-500">
      <p className="text-xs md:text-sm font-bold text-on-surface break-keep">저장된 {Math.round(resume.percent)}% 지점부터 이어 쓰는 중이에요</p>
      <div className="flex gap-1.5 shrink-0 items-center">
        <button onClick={dismissResume} className="px-4 py-2 bg-surface-lowest text-xs font-bold text-zinc-500 rounded-full hover:text-primary transition-colors">처음부터</button>
      </div>
    </div>
  ) : null;

  const liveKPM = useMemo(() => {
    if (!startTime || elapsedSeconds < 0.5) return 0;
    return Math.round((TypingUtils.getStrokeCount(inputValue) / elapsedSeconds) * 60);
  }, [inputValue, elapsedSeconds, startTime]);

  const liveAccuracy = useMemo(() => {
    if (inputValue.length === 0) return 100;
    const typedNorm = TypingUtils.normalize(inputValue);
    const targetNorm = TypingUtils.normalize(currentText.content.substring(0, inputValue.length));
    let correct = 0;
    for(let i=0; i<typedNorm.length; i++) if(typedNorm[i] === targetNorm[i]) correct++;
    return Math.round((correct / Math.max(1, typedNorm.length)) * 100);
  }, [inputValue, currentText.content]);

  const renderHighlightedText = () => {
    const chars = currentText.content.split("");
    const typedNorm = TypingUtils.normalize(inputValue);
    return chars.map((char: string, i: number) => {
      const normChar = TypingUtils.normalize(char);
      let color = "text-zinc-400"; let bg = ""; let deco = "";
      const isCurrent = i === inputValue.length;
      if (isCurrent) {
          color = "text-primary font-bold";
          bg = "bg-primary/10 ring-4 ring-primary/5 rounded-sm";
      }
      else if (i < inputValue.length) {
        const tChar = typedNorm.charAt(i);
        if (tChar === normChar) color = "text-on-surface font-bold";
        else { color = "text-red-500 line-through opacity-80"; }
      }
      return <span key={i} data-current={isCurrent || undefined} className={`${color} ${bg} ${deco} transition-all`}>{char === "\n" ? <br /> : char}</span>;
    });
  };

  const progressValue = Math.min(100, (inputValue.length / currentText.content.length) * 100);

  // ── 모바일 줄 단위 모드 ───────────────────────────────────────────
  // 줄 완료 처리: 누적값 갱신 후 다음 줄로 이동, 마지막 줄이면 전체 리포트 생성
  const completeLine = (typedNorm: string, lineNorm: string) => {
    accStrokesRef.current += TypingUtils.getStrokeCount(typedNorm);
    let correct = 0;
    for (let i = 0; i < typedNorm.length; i++) if (typedNorm[i] === lineNorm[i]) correct++;
    accCorrectRef.current += correct;
    accTypedRef.current += typedNorm.length;

    if (lineIndex >= lines.length - 1) {
      // 마지막 줄 → 전체 완료: 누적값으로 기존 report 형식 그대로 생성
      const secs = startTime ? (Date.now() - startTime) / 1000 : elapsedSeconds;
      const kpm = secs > 0 ? Math.round((accStrokesRef.current / secs) * 60) : 0;
      const accuracy = TypingUtils.calculateAccuracy(accCorrectRef.current, accTypedRef.current);
      setReport({
        kpm,
        accuracy,
        totalStrokes: accStrokesRef.current,
        correctStrokes: accCorrectRef.current,
        elapsedSeconds: Math.round(secs),
        grade: TypingUtils.getGrade(kpm, accuracy),
        errors: [],
      });
      track('pilsa_complete', { content_id: currentText.id, source: externalContent ? 'challenge' : 'library', kpm, accuracy });
      // 내 서재에 책으로 기록
      recordCompletion(sourceMeta, { date: new Date().toISOString(), kpm, accuracy, seconds: Math.round(secs) });
      if (externalContent) {
        SupabaseService.saveResult(externalContent.id, kpm, accuracy, Math.round(secs));
      }
    } else {
      setLineIndex((i) => i + 1);
      setLineInput("");
    }
  };

  const handleLineInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (report) return;
    const val = e.target.value;
    if (!startTime && val.length > 0) {
      setStartTime(Date.now());
      track('pilsa_start', { content_id: currentText.id, source: externalContent ? 'challenge' : 'library' });
    }
    setLineInput(val);
    // 줄 완료 판정: normalize 길이 도달 && 마지막 글자 일치 (ShortPractice와 동일 규칙)
    const lineNorm = TypingUtils.normalize(lines[lineIndex] || "");
    const typedNorm = TypingUtils.normalize(val);
    if (
      lineNorm.length > 0 &&
      typedNorm.length >= lineNorm.length &&
      typedNorm.charAt(typedNorm.length - 1) === lineNorm.charAt(lineNorm.length - 1)
    ) {
      completeLine(typedNorm, lineNorm);
    }
  };

  // 현재 줄 글자별 하이라이트 (renderHighlightedText와 동일 규칙)
  const renderMobileHighlight = (line: string) => {
    const chars = line.split("");
    const typedNorm = TypingUtils.normalize(lineInput);
    return chars.map((char, i) => {
      const normChar = TypingUtils.normalize(char);
      let color = "text-zinc-400";
      let bg = "";
      const isCurrent = i === lineInput.length;
      if (isCurrent) {
        color = "text-primary font-bold";
        bg = "bg-primary/10 ring-4 ring-primary/5 rounded-sm";
      } else if (i < lineInput.length) {
        const tChar = typedNorm.charAt(i);
        if (tChar === normChar) color = "text-on-surface font-bold";
        else color = "text-red-500 line-through opacity-80";
      }
      return (
        <span key={i} className={`${color} ${bg} transition-all`}>
          {char}
        </span>
      );
    });
  };

  // 전체 글자 기준 진행률 계산용
  const mobileTotalChars = useMemo(
    () => lines.reduce((a: number, l: string) => a + l.length, 0),
    [lines]
  );
  const mobileCompletedChars = useMemo(
    () => lines.slice(0, lineIndex).reduce((a: number, l: string) => a + l.length, 0),
    [lines, lineIndex]
  );

  // 결과 모달 (데스크톱/모바일 공용 — 동일 JSX)
  const renderReportModal = () =>
    report && (
      <div className="fixed inset-0 bg-on-surface/80 backdrop-blur-xl z-[100] flex items-center justify-center p-6 overflow-y-auto">
        <div className="relative max-w-2xl w-full my-auto animate-in zoom-in duration-500">
          <div className={`relative overflow-hidden rounded-2xl md:rounded-2xl shadow-2xl ${paperAssets[paperType].bg} p-8 md:p-16 text-center`}>
              <div className={`absolute inset-0 pointer-events-none z-0 ${paperAssets[paperType].overlay}`} style={{ backgroundImage: `url(${paperAssets[paperType].img})`, backgroundSize: paperType === 'hanji' ? 'auto' : 'cover' }} />
              <div className="relative z-10 text-on-surface">
                  <div className="flex justify-center mb-8"><div className="primary-gradient text-white p-6 rounded-full shadow-2xl"><Award size={60} /></div></div>
                  <h2 className={`display-lg !text-3xl md:!text-5xl mb-4 ${fontFamily}`}>{currentText.title}</h2>
                  <p className="text-zinc-500 text-xs font-bold mb-8 md:mb-16 tracking-[0.3em] uppercase">By {currentText.author} / {currentText.source || '한글타자왕'}</p>
                  <div className="grid grid-cols-3 gap-3 md:gap-8 mb-8 md:mb-16">
                      <ResultItem label="Keystrokes" value={report.kpm} unit="타" />
                      <ResultItem label="Accuracy" value={report.accuracy} unit="%" />
                      <ResultItem label="Time" value={report.elapsedSeconds} unit="s" />
                  </div>
                  <div className="mb-4 flex justify-center empty:hidden">
                    <AdSenseUnit label="content-banner-mobile" width={320} height={100} tight />
                  </div>
              </div>
          </div>
          {/* 연재물: 다음 화 이어가기 / 완간 축하 */}
          {!externalContent && currentText.seriesId && (() => {
            // DB(책방) 화는 서버가 내려준 다음 화, 정적 콘텐츠는 정적 DB 탐색
            const nextEp = dbNextText !== undefined
              ? dbNextText
              : LONG_TEXT_DB.find(
                  (t) => t.seriesId === currentText.seriesId && t.episode === (currentText.episode || 0) + 1
                );
            return nextEp ? (
              <Link prefetch={false} href={`/transcription/${nextEp.id}`} className="mt-8 block w-full py-5 bg-white text-on-surface text-center text-lg font-bold rounded-2xl shadow-2xl hover:scale-[1.02] transition-transform">
                다음 화 새기기 → {nextEp.title}
              </Link>
            ) : (
              <Link prefetch={false} href={`/transcription/series/${currentText.seriesId}`} className="mt-8 block w-full py-5 bg-white text-on-surface text-center text-lg font-bold rounded-2xl shadow-2xl hover:scale-[1.02] transition-transform">
                <Award size={18} /> 완간을 새기셨습니다! 시리즈 페이지 보기 →
              </Link>
            );
          })()}
          {/* 완주 직후 공유 — 시리즈면 책을, 아니면 이 글을 공유 */}
          {!externalContent && (() => {
            const series = currentText.seriesId ? PILSA_SERIES.find((s) => s.id === currentText.seriesId) : null;
            const shareUrl = currentText.seriesId
              ? `https://www.hangul-tajawang.com/transcription/series/${currentText.seriesId}`
              : `https://www.hangul-tajawang.com/transcription/${currentText.id}`;
            return (
              <ShareButton
                url={shareUrl}
                title={series ? `${series.title} — 한글타자왕 오리지널 연재` : `${currentText.title} — 한글타자왕 필사`}
                text={series ? series.logline : `'${currentText.title}'을 키보드로 한 자 한 자 새겨보세요.`}
                label={currentText.seriesId ? "이 책 공유하기" : "이 글 공유하기"}
                className="mt-6 w-full py-4 bg-white/10 text-white font-bold rounded-2xl hover:bg-white/20 transition-all flex items-center justify-center gap-2"
              />
            );
          })()}
          <Link prefetch={false} href="/library" className="mt-8 block text-center text-white font-bold text-sm md:text-base hover:underline underline-offset-4">
            <BookOpen size={18} className="inline-block mr-1.5" /> 방금 새긴 책이 서재에 꽂혔습니다 · 내 서재 보기 →
          </Link>
          {/* 코어 출구 — 원고지 필사를 챌린지 생산 도구로 */}
          <Link prefetch={false} href="/challenge" className="mt-4 block w-full py-5 bg-white/10 text-white text-center font-bold rounded-2xl hover:bg-white/20 transition-all">
            내가 고른 글로 필사 챌린지 만들기 → 다른 사람들과 함께 쓰기
          </Link>
          <Link prefetch={false} href="/journey" className="mt-3 block text-center text-white/80 font-bold text-sm hover:text-white hover:underline underline-offset-4">
            문장 다음은 지식 — 조선 왕조·세계 수도를 타자로 외우는 지식타자 →
          </Link>
          <div className="mt-6 flex gap-6">
              <button onClick={resetState} className="flex-1 py-6 bg-white/10 text-white font-bold rounded-2xl hover:bg-white/20 transition-all">연습 종료</button>
              <button onClick={() => window.location.reload()} className="flex-[2] py-6 primary-gradient text-white font-bold rounded-2xl shadow-2xl shadow-primary/30 hover:scale-[1.02] transition-all">다시 연습하기</button>
          </div>
        </div>
      </div>
    );

  const renderMobileLineMode = () => {
    const currentLine = lines[lineIndex] || "";
    const prevLine = lineIndex > 0 ? lines[lineIndex - 1] : null;
    const nextLine = lineIndex < lines.length - 1 ? lines[lineIndex + 1] : null;
    const curNorm = TypingUtils.normalize(currentLine);
    const typedNorm = TypingUtils.normalize(lineInput);

    // 실시간 타수/정확도 (누적값 + 현재 줄 진행분)
    const liveStrokes = accStrokesRef.current + TypingUtils.getStrokeCount(typedNorm);
    const mobileKPM = startTime && elapsedSeconds >= 0.5 ? Math.round((liveStrokes / elapsedSeconds) * 60) : 0;
    let liveCorrect = 0;
    for (let i = 0; i < typedNorm.length; i++) if (typedNorm[i] === curNorm[i]) liveCorrect++;
    const mobileAccuracy = TypingUtils.calculateAccuracy(
      accCorrectRef.current + liveCorrect,
      accTypedRef.current + typedNorm.length
    );

    const mobileProgress = mobileTotalChars > 0
      ? Math.min(100, ((mobileCompletedChars + lineInput.length) / mobileTotalChars) * 100)
      : 0;

    return (
      <div className="flex flex-col gap-4">
        {/* 컴팩트 헤더 */}
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-base font-bold text-on-surface truncate flex-1">{displayTitle}</h1>
          <span className="shrink-0 px-3 py-1 primary-gradient text-white text-[11px] font-bold rounded-full uppercase tracking-widest shadow-lg shadow-primary/20">
            문단 {lineIndex + 1}/{lines.length}
          </span>
        </div>
        <div className="flex gap-2">
          <MetricItem icon={<Zap size={18} />} label="현재 타수" value={mobileKPM} unit="타" color="text-primary" />
          <MetricItem icon={<Target size={18} />} label="정확도" value={mobileAccuracy} unit="%" color="text-green-600" />
        </div>

        {/* 문장 카드 */}
        <div className="bg-surface-lowest rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col gap-2">
          {prevLine && <p className="text-xs leading-relaxed text-zinc-400 line-clamp-2 break-keep">{prevLine}</p>}
          <p lang="ko" className="text-lg sm:text-xl font-bold leading-[1.85] whitespace-pre-wrap break-keep [overflow-wrap:anywhere] tracking-tight text-on-surface">
            {renderMobileHighlight(currentLine)}
          </p>
          {nextLine && <p className="text-xs leading-relaxed text-zinc-400 line-clamp-2 break-keep">{nextLine}</p>}
        </div>

        {/* 입력창: 줄마다 리마운트해 IME 잔여 조합 제거 */}
        <input
          key={lineIndex}
          data-typing-input ref={lineInputRef}
          type="text"
          value={lineInput}
          onChange={handleLineInputChange}
          onFocus={() => scrollIntoViewOnFocus(lineInputRef.current)}
          autoFocus
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          aria-label={`${lineIndex + 1}번째 문단 필사 입력`}
          className="w-full h-14 px-4 text-lg text-center bg-surface-lowest rounded-2xl shadow-sm outline-hidden font-bold text-on-surface focus:shadow-xl focus:shadow-primary/5 transition-all"
          placeholder="이 문단을 그대로 입력하세요"
        />

        {/* 진행바 (전체 글자 기준) */}
        <div className="relative h-12 w-full flex items-end">
          <div className="absolute w-full h-2 bg-surface-high rounded-full mb-2 shadow-inner" />
          <div className="absolute h-2 bg-primary rounded-full transition-all duration-300 mb-2 shadow-[0_0_20px_rgba(0,74,198,0.4)]" style={{ width: `${mobileProgress}%` }} />
          <div className="absolute transition-all duration-700 ease-in-out flex flex-col items-center" style={{ left: `${mobileProgress}%`, transform: "translateX(-50%)", bottom: "4px" }}>
            <Feather size={22} className="text-primary drop-shadow-lg" />
            <div className="text-[10px] font-bold text-primary">{Math.round(mobileProgress)}%</div>
          </div>
        </div>
      </div>
    );
  };

  const paperAssets = {
    white: { bg: "bg-surface-lowest", img: "/images/paper/basic.jpg", overlay: "opacity-100" },
    hanji: { bg: "bg-[#fdfcf8]", img: "https://www.transparenttextures.com/patterns/natural-paper.png", overlay: "opacity-100" },
    kraft: { bg: "bg-surface-lowest", img: "/images/paper/craft.jpg", overlay: "opacity-100" }
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-4 md:py-12 px-3 md:px-6 flex flex-col gap-4 md:gap-10 relative animate-in fade-in duration-1000">
      {mounted && isMobile ? (
        <>
          {renderReportModal()}
          {resumeBanner}
          {renderMobileLineMode()}
        </>
      ) : (
        <>
      <div className="flex justify-center gap-2 md:gap-8 mb-0 md:mb-4 flex-wrap">
        <MetricItem icon={<Zap size={18}/>} label="현재 타수" value={liveKPM} unit="타" color="text-primary" />
        <MetricItem icon={<Target size={18}/>} label="정확도" value={liveAccuracy} unit="%" color="text-green-600" />
        <MetricItem icon={<Clock size={18}/>} label="진행 시간" value={Math.floor(elapsedSeconds)} unit="초" color="text-secondary" />
      </div>

      {resumeBanner}

      {renderReportModal()}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
            <span className="text-primary font-bold text-[10px] uppercase tracking-[0.5em] mb-2 block">{externalContent ? "Challenge Transcription" : "Editorial Practice"}</span>
            <h1 className="display-lg !text-2xl md:!text-5xl text-on-surface flex items-center gap-4 break-keep text-balance">
                {displayTitle} {!externalContent && <span className="text-2xl text-zinc-500 hidden lg:inline-block ml-2 opacity-60 whitespace-nowrap"> 한글 타자 연습</span>}
            </h1>
            <p className="text-sm text-zinc-400 font-bold flex items-center gap-2 mt-2 md:mt-4"><BookOpen size={14} className="text-primary" /> {currentText.author} · {currentText.source}</p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 bg-surface-lowest p-3 rounded-2xl md:rounded-2xl shadow-sm w-full md:w-auto">
          <div className="flex items-center gap-2 md:gap-4 px-2 md:px-4 md:border-r border-surface-high">
            <Type size={18} className="text-primary" />
            <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value as FontType)} className="bg-transparent text-sm font-bold outline-hidden cursor-pointer appearance-none hover:text-primary transition-colors">
                <option value="font-noto">본고딕</option><option value="font-myeongjo">나눔명조</option><option value="font-batang">고운바탕</option><option value="font-dodum">고운돋움</option><option value="font-pen">나눔펜</option><option value="font-brush">나눔브러쉬</option><option value="font-gaegu">개구체</option><option value="font-poor">푸어스토리</option><option value="font-dokdo">독도체</option><option value="font-gamja">감자꽃</option><option value="font-single">싱글데이</option><option value="font-yeon">연성체</option><option value="font-stylish">스타일리시</option><option value="font-jua">배민 주아</option>
            </select>
            <input type="range" min="16" max="40" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="w-24 accent-primary" />
          </div>
          <div className="flex items-center gap-2 px-2">
            <PaperBtn active={paperType==='white'} label="White" onClick={()=>setPaperType('white')} />
            <PaperBtn active={paperType==='hanji'} label="Hanji" onClick={()=>setPaperType('hanji')} />
            <PaperBtn active={paperType==='kraft'} label="Kraft" onClick={()=>setPaperType('kraft')} />
          </div>
        </div>
      </div>

      <div className={`w-full h-[78dvh] md:h-[75vh] min-h-[420px] shadow-[0_40px_80px_rgba(21,28,39,0.1)] rounded-2xl md:rounded-2xl overflow-hidden flex flex-col md:flex-row transition-all duration-700 relative`}>
        <div className={`absolute inset-0 pointer-events-none z-0 ${paperAssets[paperType].overlay}`} style={{ backgroundImage: `url(${paperAssets[paperType].img})`, backgroundSize: paperType === 'hanji' ? 'auto' : 'cover' }} />

        {/* 원문: 모바일에선 상단 42% 고정 + 현재 위치 자동 스크롤, 데스크톱에선 좌측 절반 */}
        <div ref={scrollRef} className={`h-[42%] md:h-auto shrink-0 md:shrink md:flex-1 p-5 sm:p-8 md:p-20 overflow-y-auto relative border-b md:border-b-0 md:border-r border-on-surface/5 z-10 ${fontFamily}`} style={{ fontSize: `${fontSize}px`, lineHeight: 1.8 }}>
            <div lang="ko" className="max-w-[42rem] text-left tracking-tight whitespace-pre-wrap break-keep [overflow-wrap:anywhere] select-none text-on-surface">{renderHighlightedText()}</div>
        </div>

        <div className={`flex-1 min-h-0 p-5 sm:p-8 md:p-20 relative flex flex-col bg-on-surface/5 backdrop-blur-sm z-10 ${fontFamily}`}>
          <div className="flex justify-end items-center mb-3 md:mb-10">
            <div className="flex gap-4 md:gap-8 text-sm font-bold text-zinc-400">
                <span className="flex items-center gap-2"><Keyboard size={16}/> {TypingUtils.getStrokeCount(inputValue)}</span>
                <span className="flex items-center gap-2"><Clock size={16}/> {Math.floor(elapsedSeconds/60)}:{String(Math.floor(elapsedSeconds)%60).padStart(2,'0')}</span>
            </div>
          </div>
          <textarea data-typing-input ref={textareaRef} lang="ko" aria-label="필사 입력" value={inputValue} onChange={handleInputChange} autoCorrect="off" autoCapitalize="off" spellCheck={false} className="flex-1 min-h-0 w-full max-w-[42rem] bg-transparent resize-none outline-hidden leading-relaxed whitespace-pre-wrap break-keep [overflow-wrap:anywhere] z-10 py-0 text-on-surface placeholder:text-zinc-400/30" style={{ fontSize: `${fontSize}px`, lineHeight: 1.8 }} placeholder="이곳에 필사를 시작하세요..." />

          <div className="mt-4 md:mt-12 relative h-12 md:h-16 w-full flex items-end">
              <div className="absolute w-full h-2 bg-surface-high rounded-full mb-2 shadow-inner" />
              <div className="absolute h-2 bg-primary rounded-full transition-all duration-300 mb-2 shadow-[0_0_20px_rgba(0,74,198,0.4)]" style={{ width: `${progressValue}%` }} />
              <div className="absolute transition-all duration-700 ease-in-out flex flex-col items-center" style={{ left: `${progressValue}%`, transform: 'translateX(-50%)', bottom: '8px' }}>
                  <Feather size={28} className="text-primary drop-shadow-lg" />
                  <div className="text-[10px] font-bold text-primary mt-2">{Math.round(progressValue)}%</div>
              </div>
          </div>
        </div>
      </div>
        </>
      )}

      {/* 키보드 추천 배너 - 긴글 연습 패드 직후에 삽입 */}
      <div className="mt-4 pt-4 md:mt-16 md:pt-16 border-t border-outline-variant/60 w-full">
        <KeyboardAdBanner />
      </div>

      {externalContent && (
        <div className="mt-16 md:mt-32 space-y-16 md:space-y-32 z-10">
            <section className="bg-surface-lowest p-6 md:p-16 rounded-2xl md:rounded-2xl shadow-[0_20px_60px_rgba(21,28,39,0.06)] flex flex-col md:flex-row items-center gap-8 md:gap-16">
                {externalContent.profiles?.avatar_url ? (
                    <Image src={externalContent.profiles.avatar_url} alt="작가" width={180} height={180} className="w-40 h-40 md:w-56 md:h-56 rounded-2xl object-cover shadow-2xl" />
                ) : (
                    <div className="w-40 h-40 md:w-56 md:h-56 bg-surface-low rounded-2xl flex items-center justify-center text-primary/30 shadow-2xl"><User size={80} /></div>
                )}
                <div className="flex-1 text-center md:text-left">
                    <span className="text-primary font-bold text-[10px] uppercase tracking-[0.5em] mb-4 block underline decoration-4 decoration-primary/20 underline-offset-8">Original Author</span>
                    <h3 className="display-lg !text-3xl md:!text-5xl mb-4 md:mb-8">{externalContent.profiles?.nickname || '익명 작가'}</h3>
                    <div className="flex flex-wrap justify-center md:justify-start gap-8 md:gap-16">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Likes</span>
                            <span className={`text-4xl font-bold flex items-center gap-4 transition-all ${isLiked ? 'text-red-500 scale-110' : 'text-on-surface'}`}>
                                <Heart size={32} className={isLiked ? "fill-red-500 text-red-500" : ""} onClick={handleToggleLike} /> {likeCount}
                            </span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Participants</span>
                            <span className="text-4xl font-bold text-primary flex items-center gap-4">
                                <Users size={32} /> {externalContent.complete_count || 0}
                            </span>
                        </div>
                    </div>
                </div>
                <Link prefetch={false} href={`/challenge?authorId=${externalContent.author_id}`} className="px-12 py-6 bg-on-surface text-white font-bold rounded-2xl hover:scale-105 transition-all shadow-2xl shadow-on-surface/20 flex items-center gap-3">작가의 글 더보기 <ChevronRight size={20}/></Link>
            </section>

            <section className="bg-surface-lowest p-6 md:p-16 rounded-2xl md:rounded-2xl shadow-xl">
                <div className="flex items-center gap-4 mb-8 md:mb-16">
                    <MessageSquare className="text-primary" size={32} />
                    <h3 className="headline-md">Comments <span className="text-primary opacity-30">/ {comments.length}</span></h3>
                </div>

                <div className="relative mb-20">
                    <input 
                        type="text" 
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                        placeholder={user ? "작가님께 따뜻한 응원의 한마디를 남겨주세요" : "로그인 후 댓글을 남길 수 있습니다"}
                        disabled={!user || commentLoading}
                        className="w-full p-5 md:p-8 bg-surface-low border-none rounded-2xl md:rounded-2xl outline-hidden focus:shadow-xl transition-all text-base md:text-xl font-medium pr-20 md:pr-28"
                    />
                    <button 
                        onClick={handleAddComment}
                        disabled={!user || !newComment.trim() || commentLoading}
                        className="absolute right-4 top-4 bottom-4 px-8 primary-gradient text-white rounded-2xl font-bold hover:scale-105 disabled:opacity-50 transition-all flex items-center justify-center shadow-xl shadow-primary/20"
                    >
                        {commentLoading ? <RotateCcw className="animate-spin" size={24} /> : <Send size={24} />}
                    </button>
                </div>

                <div className="space-y-12 max-h-[60vh] overflow-y-auto pr-8 custom-scrollbar">
                    {comments.length > 0 ? comments.map((c) => (
                        <div key={c.id} className="flex gap-8 group/comment animate-in slide-in-from-bottom duration-500">
                            {c.profiles?.avatar_url ? (
                                <Image src={c.profiles.avatar_url} alt="avatar" width={64} height={64} className="w-16 h-16 rounded-2xl object-cover shadow-md" />
                            ) : (
                                <div className="w-16 h-16 bg-surface-high rounded-2xl flex items-center justify-center font-bold text-primary/30 text-2xl">{c.profiles?.nickname?.[0] || '?'}</div>
                            )}
                            <div className="flex-1">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="font-bold text-xl text-on-surface">{c.profiles?.nickname || '익명'}</span>
                                    <div className="flex items-center gap-6">
                                        <span className="text-xs font-bold text-zinc-300 uppercase tracking-widest">{new Date(c.created_at).toLocaleDateString()}</span>
                                        {user?.id === c.user_id && (
                                            <button onClick={() => handleDeleteComment(c.id)} className="text-red-400 opacity-0 group-hover/comment:opacity-100 transition-all hover:scale-125"><Trash2 size={18}/></button>
                                        )}
                                    </div>
                                </div>
                                <p className="text-zinc-500 text-lg leading-relaxed">{c.comment}</p>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-24 text-zinc-300 font-bold text-2xl uppercase tracking-[0.2em] opacity-30">아직 댓글이 없습니다</div>
                    )}
                </div>
            </section>
        </div>
      )}

      {!externalContent && (
        <div className="mt-16 md:mt-32 w-full p-8 md:p-16 bg-on-surface rounded-2xl md:rounded-2xl text-white flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12 relative overflow-hidden shadow-[0_40px_80px_rgba(21,28,39,0.2)]">
            <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none scale-150">
                <ScrollText size={300} />
            </div>
            <div className="relative z-10 text-center md:text-left flex-1">
                <div className="inline-flex px-5 py-1.5 bg-primary rounded-full text-[10px] font-bold uppercase tracking-widest mb-8 shadow-lg shadow-primary/20">커뮤니티와 함께</div>
                <h2 className="display-lg !text-3xl md:!text-5xl mb-6 break-keep text-balance">유저들이 만든 글은 <span className="whitespace-nowrap">어때요?</span></h2>
                <p className="text-zinc-400 font-medium text-xl leading-relaxed max-w-xl break-keep text-balance">매일 새로운 감성 명문이 올라오는 필사 챌린지에서 다른 유저들과 소통하며 연습해 보세요.</p>
            </div>
            <Link prefetch={false} 
                href="/challenge" 
                className="px-12 py-7 bg-white text-on-surface font-bold rounded-2xl hover:scale-[1.05] transition-all flex items-center gap-4 whitespace-nowrap shadow-2xl group relative z-10"
            >
                필사 챌린지 참여하기 <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform text-primary" />
            </Link>
        </div>
      )}
    </div>
  );
};

function MetricItem({ icon, label, value, unit, color }: { icon: any, label: string, value: number, unit?: string, color: string }) {
    return (
        <div className="flex items-center gap-2 md:gap-3 bg-surface-lowest px-3 py-2 md:px-6 md:py-3 rounded-xl md:rounded-2xl shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
            <div className={color}>{icon}</div>
            <div className="flex flex-col">
                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5">{label}</span>
                <span className={`text-base md:text-xl font-bold ${color}`}>{value}<span className="text-xs ml-0.5 opacity-50">{unit}</span></span>
            </div>
        </div>
    );
}

function ResultItem({ label, value, unit }: { label: string, value: number, unit: string }) {
    return (
        <div className="bg-on-surface/5 backdrop-blur-sm p-4 md:p-8 rounded-2xl md:rounded-2xl text-on-surface">
            <p className="text-zinc-400 text-[10px] font-bold uppercase mb-2 tracking-widest">{label}</p>
            <p className="text-2xl md:text-4xl font-bold text-primary">{value}<span className="text-xs ml-1 font-bold opacity-50">{unit}</span></p>
        </div>
    );
}

function PaperBtn({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
    return (
        <button onClick={onClick} className={`px-4 py-2 rounded-xl text-[10px] font-bold transition-all ${active ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-zinc-400 hover:bg-surface-high'}`}>
            {label}
        </button>
    );
}
