"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { usePracticeT } from '@/lib/i18n/practice-ui';
import { STEP_LABELS } from '@/lib/i18n/practice-content';
import Link from 'next/link';
import { TypingUtils, TypingReport } from "@/lib/typing-speed";
import { RotateCcw, Target, CheckCircle2, Flame, Trophy, ArrowRight, Keyboard as KbdIcon, Sparkles } from "lucide-react";
import { BASIC_PRACTICE_STEPS, PracticeStep } from "@/lib/word-data";
import { track } from "@/lib/analytics";
import { useHydrated } from '@/hooks/useHydrated';

type Phase = "select" | "keys" | "transition" | "words" | "result";

const KBD_ROWS = [
  { keys: ["ㅂ", "ㅈ", "ㄷ", "ㄱ", "ㅅ", "ㅛ", "ㅕ", "ㅑ", "ㅐ", "ㅔ"], eng: ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"] },
  { keys: ["ㅁ", "ㄴ", "ㅇ", "ㄹ", "ㅎ", "ㅗ", "ㅓ", "ㅏ", "ㅣ"], eng: ["a", "s", "d", "f", "g", "h", "j", "k", "l"] },
  { keys: ["ㅋ", "ㅌ", "ㅊ", "ㅍ", "ㅠ", "ㅜ", "ㅡ"], eng: ["z", "x", "c", "v", "b", "n", "m"] }
];

const DOUBLE_CONSONANTS: Record<string, string> = {
  "Q": "ㅃ", "W": "ㅉ", "E": "ㄸ", "R": "ㄲ", "T": "ㅆ", "O": "ㅒ", "P": "ㅖ"
};

// ── 자소 분해 유틸 ──────────────────────────────────────────────────────────
// 모바일 IME는 keydown 이벤트를 신뢰할 수 없으므로(keyCode 229),
// input의 "값"을 자소 단위로 분해해 어떤 키를 눌렀는지 역산한다.
// 예: 입력값 "마" → [ㅁ, ㅏ], "닭" → [ㄷ, ㅏ, ㄹ, ㄱ]
const CHOSEONG = ["ㄱ","ㄲ","ㄴ","ㄷ","ㄸ","ㄹ","ㅁ","ㅂ","ㅃ","ㅅ","ㅆ","ㅇ","ㅈ","ㅉ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];
const JOONGSEONG = ["ㅏ","ㅐ","ㅑ","ㅒ","ㅓ","ㅔ","ㅕ","ㅖ","ㅗ","ㅘ","ㅙ","ㅚ","ㅛ","ㅜ","ㅝ","ㅞ","ㅟ","ㅠ","ㅡ","ㅢ","ㅣ"];
const JONGSEONG = ["","ㄱ","ㄲ","ㄳ","ㄴ","ㄵ","ㄶ","ㄷ","ㄹ","ㄺ","ㄻ","ㄼ","ㄽ","ㄾ","ㄿ","ㅀ","ㅁ","ㅂ","ㅄ","ㅅ","ㅆ","ㅇ","ㅈ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];
// 두 개의 키로 만들어지는 복합 자소는 구성 키로 분해 (ㅘ = ㅗ + ㅏ)
const COMPOUND_SPLIT: Record<string, string[]> = {
  "ㅘ": ["ㅗ","ㅏ"], "ㅙ": ["ㅗ","ㅐ"], "ㅚ": ["ㅗ","ㅣ"], "ㅝ": ["ㅜ","ㅓ"], "ㅞ": ["ㅜ","ㅔ"], "ㅟ": ["ㅜ","ㅣ"], "ㅢ": ["ㅡ","ㅣ"],
  "ㄳ": ["ㄱ","ㅅ"], "ㄵ": ["ㄴ","ㅈ"], "ㄶ": ["ㄴ","ㅎ"], "ㄺ": ["ㄹ","ㄱ"], "ㄻ": ["ㄹ","ㅁ"], "ㄼ": ["ㄹ","ㅂ"],
  "ㄽ": ["ㄹ","ㅅ"], "ㄾ": ["ㄹ","ㅌ"], "ㄿ": ["ㄹ","ㅍ"], "ㅀ": ["ㄹ","ㅎ"], "ㅄ": ["ㅂ","ㅅ"],
};
const ALL_KEYS = KBD_ROWS.flatMap(r => r.keys);
const ALL_ENG = KBD_ROWS.flatMap(r => r.eng);

function pushJamo(out: string[], jamo: string) {
  if (!jamo) return;
  if (COMPOUND_SPLIT[jamo]) out.push(...COMPOUND_SPLIT[jamo]);
  else out.push(jamo);
}

function decomposeToJamos(text: string): string[] {
  const out: string[] = [];
  for (const ch of text) {
    const code = ch.charCodeAt(0);
    if (code >= 0xac00 && code <= 0xd7a3) {
      // 완성형 음절 → 초/중/종성 분해
      const idx = code - 0xac00;
      pushJamo(out, CHOSEONG[Math.floor(idx / 588)]);
      pushJamo(out, JOONGSEONG[Math.floor((idx % 588) / 28)]);
      pushJamo(out, JONGSEONG[idx % 28]);
    } else if (code >= 0x3131 && code <= 0x3163) {
      pushJamo(out, ch); // 낱자 그대로
    } else if (/[a-z]/.test(ch)) {
      const i = ALL_ENG.indexOf(ch);
      if (i > -1) out.push(ALL_KEYS[i]); // 영문 모드로 친 경우 두벌식 자소로 변환
    } else if (/[A-Z]/.test(ch)) {
      if (DOUBLE_CONSONANTS[ch]) out.push(DOUBLE_CONSONANTS[ch]);
      else { const i = ALL_ENG.indexOf(ch.toLowerCase()); if (i > -1) out.push(ALL_KEYS[i]); }
    }
    // 공백/기타 문자는 무시
  }
  return out;
}

interface PositionPracticeProps { initialPhase?: 'keys' | 'words'; initialTargetId?: string }

function practiceOrder(step: PracticeStep) {
  const keys: string[] = [];
  while (keys.length < 30) keys.push(...[...step.keys].sort(() => Math.random() - 0.5));
  return { keys: keys.slice(0, 30), words: [...step.words].sort(() => Math.random() - 0.5) };
}

export function PositionPractice(props: PositionPracticeProps) {
  const { t } = usePracticeT();
  const hydrated = useHydrated();
  return hydrated ? <PracticeSession key={`${props.initialPhase}:${props.initialTargetId}`} {...props} />
    : <p className="py-16 text-center text-secondary" role="status">{t("연습을 준비하고 있어요.")}</p>;
}

const PracticeSession: React.FC<PositionPracticeProps> = ({ initialPhase, initialTargetId }) => {
  const { isEn, t, href } = usePracticeT();
  const [initial] = useState(() => {
    const step = initialPhase ? BASIC_PRACTICE_STEPS.find(s => s.id === initialTargetId) || BASIC_PRACTICE_STEPS[0] : null;
    return { step, ...(step ? practiceOrder(step) : { keys: [], words: [] }) };
  });
  const [selectedStep, setSelectedStep] = useState<PracticeStep | null>(initial.step);
  const [shuffledKeys, setShuffledKeys] = useState<string[]>(initial.keys);
  const [shuffledWords, setShuffledWords] = useState<string[]>(initial.words);
  const [phase, setPhase] = useState<Phase>(initialPhase || 'select');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputValue, setInputValue] = useState(""); 
  
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [wrongKey, setWrongKey] = useState<string | null>(null);
  const [combo, setCombo] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [report, setReport] = useState<TypingReport | null>(null);

  const hiddenInputRef = useRef<HTMLInputElement>(null);
  // 자판 익히기 단계: 지금까지 소비한 자소 수 (입력값은 지우지 않고 계속 쌓는다 → IME 조합 충돌 방지)
  const processedJamosRef = useRef(0);
  const mistakenWords = useRef(new Set<number>());
  const inputStarted = useRef(false);

  const startStep = useCallback((step: PracticeStep, targetPhase: Phase = "keys") => {
    setSelectedStep(step);
    const order = practiceOrder(step);
    setShuffledKeys(order.keys);
    setShuffledWords(order.words);
    setPhase(targetPhase);
    setCurrentIndex(0);
    setInputValue("");
    processedJamosRef.current = 0;
    setCorrectCount(0);
    setCombo(0);
    setStartTime(null);
    setReport(null);
    mistakenWords.current.clear();
    inputStarted.current = false;
    setTimeout(() => hiddenInputRef.current?.focus(), 100);
  }, []);

  const resetProgress = useCallback(() => {
    setCurrentIndex(0);
    setInputValue("");
    processedJamosRef.current = 0;
    setCorrectCount(0);
    setCombo(0);
    setStartTime(null);
    mistakenWords.current.clear();
    inputStarted.current = false;
  }, []);

  // 물리 키보드의 키 눌림 시각 효과 + ESC (매칭은 input 값 기반으로 처리하므로 여기선 하지 않음)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "Escape") { setPhase("select"); return; }
      let pressed = e.key;
      const engIdx = ALL_ENG.indexOf(pressed.toLowerCase());
      if (engIdx > -1) {
        if (e.shiftKey && DOUBLE_CONSONANTS[pressed.toUpperCase()]) {
            pressed = DOUBLE_CONSONANTS[pressed.toUpperCase()];
        } else {
            pressed = ALL_KEYS[engIdx];
        }
      }
      setActiveKey(pressed);
    };
    const handleKeyUp = () => setActiveKey(null);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // 자판 익히기: 입력값을 자소 스트림으로 분해해 새로 추가된 자소만 순서대로 판정
  // (입력값을 지우지 않으므로 모바일 IME의 음절 조합과 충돌하지 않는다)
  const handleKeysStream = (val: string) => {
    const stream = decomposeToJamos(val);
    if (stream.length <= processedJamosRef.current) {
      processedJamosRef.current = stream.length; // 백스페이스 → 포인터만 당김
      return;
    }
    let idx = currentIndex;
    let cmb = combo;
    let correct = correctCount;
    let finished = false;
    for (let i = processedJamosRef.current; i < stream.length; i++) {
      const jamo = stream[i];
      setActiveKey(jamo);
      if (jamo === shuffledKeys[idx]) {
        correct++; cmb++;
        setWrongKey(null);
        if (idx < shuffledKeys.length - 1) idx++;
        else { finished = true; break; }
      } else {
        cmb = 0;
        setWrongKey(jamo);
        setTimeout(() => setWrongKey(null), 500);
      }
    }
    processedJamosRef.current = stream.length;
    setCurrentIndex(idx);
    setCombo(cmb);
    setCorrectCount(correct);
    setTimeout(() => setActiveKey(null), 150);
    if (finished) {
      setPhase("transition");
      track('practice_complete', { mode: 'position', step: selectedStep?.id || '', targets: correct });
    }
  };

  const handleWordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!inputStarted.current && val.length > 0 && (phase === 'keys' || phase === 'words')) {
      inputStarted.current = true;
      setStartTime(e.timeStamp);
      track('practice_start', { mode: phase === 'keys' ? 'position' : 'word', step: selectedStep?.id || '' });
    }

    if (phase === "keys") {
      setInputValue(val);
      handleKeysStream(val);
      return;
    }
    if (phase !== "words") return;

    const target = shuffledWords[currentIndex];
    setInputValue(val);
    const targetJamos = decomposeToJamos(target).join('');
    const inputJamos = decomposeToJamos(val).join('');
    const wrong = val.length > 0 && (!/^[가-힣ㄱ-ㅎㅏ-ㅣ]+$/.test(val) || !targetJamos.startsWith(inputJamos));
    if (wrong) {
        mistakenWords.current.add(currentIndex);
        setCombo(0);
        setWrongKey("wrong");
    } else {
        setWrongKey(null);
    }
    if (val === target) {
        setCorrectCount(prev => prev + 1);
        setCombo(prev => prev + 1);
        setWrongKey(null);
        if (currentIndex < shuffledWords.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setInputValue("");
        } else {
            finishPractice();
        }
    }
  };

  const finishPractice = () => {
    const timeTaken = startTime === null ? 0 : (performance.now() - startTime) / 1000;
    const finalReport = TypingUtils.generateWordReport(shuffledWords, mistakenWords.current.size, timeTaken);
    setReport(finalReport);
    setPhase("result");
    track('practice_complete', { mode: 'word', step: selectedStep?.id || '', kpm: finalReport.kpm, accuracy: finalReport.accuracy });
  };

  if (phase === "select") {
    return (
      <div className="w-full max-w-5xl mx-auto py-20 px-4 animate-in fade-in duration-1000">
        <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-surface-low text-primary rounded-full text-[10px] font-bold mb-6 tracking-widest uppercase">
                <KbdIcon size={14} /> NO INPUT BOX, JUST TYPE!
            </div>
            <h2 className="display-lg mb-6">{t("기초 연습 구간 선택")}</h2>
            <p className="text-zinc-500 font-medium text-xl">{t("자판 위치부터 실제 낱말까지 단계별로 연습하세요.")}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {BASIC_PRACTICE_STEPS.map((step, idx) => (
                <button key={step.id} onClick={() => startStep(step)} className="group bg-surface-lowest p-10 rounded-2xl text-left hover:shadow-[0_20px_40px_rgba(21,28,39,0.06)] transition-all hover:-translate-y-2 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity"><KbdIcon size={80} /></div>
                    <span className="inline-block px-3 py-1 bg-surface-high text-primary text-[10px] font-bold rounded-lg uppercase mb-6 tracking-widest">Step {idx + 1}</span>
                    <h3 className="headline-md mb-3 group-hover:text-primary transition-colors">{isEn ? STEP_LABELS[step.id]?.title : step.title}</h3>
                    <p className="text-zinc-400 text-sm font-medium mb-8 leading-relaxed">{isEn ? STEP_LABELS[step.id]?.description : step.description}</p>
                    <div className="flex items-center gap-2 text-primary font-bold text-sm">{t("연습 시작")} <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" /></div>
                </button>
            ))}
        </div>
      </div>
    );
  }

  const targetDisplay = phase === "keys" ? shuffledKeys[currentIndex] : shuffledWords[currentIndex];
  const currentTargetChar = phase === "keys" ? shuffledKeys[currentIndex] : targetDisplay?.[inputValue.length] || targetDisplay?.[0];

  return (
    <div className="flex flex-col items-center justify-center py-4 md:py-16 max-w-5xl mx-auto px-3 md:px-4 w-full" onClick={() => hiddenInputRef.current?.focus()}>
      <input
        key={phase === "words" ? `word-${currentIndex}` : "keys-input"}
        aria-label={isEn ? 'Korean typing input' : '한글 타자 입력'} lang="ko" data-typing-input ref={hiddenInputRef}
        type="text"
        value={inputValue}
        onChange={handleWordChange}
        onBlur={() => { if (phase === "keys" || phase === "words") setTimeout(() => hiddenInputRef.current?.focus(), 50); }}
        className="fixed opacity-0 pointer-events-none"
        autoFocus
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
      />

      <div className="w-full flex flex-wrap justify-between items-center gap-2 mb-4 md:mb-16 bg-surface-lowest p-4 md:p-6 rounded-2xl md:rounded-2xl shadow-[0_20px_40px_rgba(21,28,39,0.04)]">
        <div className="flex flex-col">
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">{phase === "keys" ? t("1단계: 자판 익히기") : t("2단계: 낱말 연습")}</span>
            <h2 className="headline-md !text-base md:!text-xl">{(isEn ? STEP_LABELS[selectedStep?.id || '']?.title : selectedStep?.title)}</h2>
        </div>
        <div className="flex items-center gap-2 md:gap-8">
            <div className="flex items-center gap-2 md:gap-3 px-3 py-2 md:px-5 md:py-2.5 bg-surface-low rounded-2xl text-primary shadow-sm">
                <Target size={18} />
                <span className="text-sm font-bold">{currentIndex + 1} / {phase === "keys" ? shuffledKeys.length : shuffledWords.length}</span>
            </div>
            {combo > 2 && <div className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-orange-50 rounded-2xl animate-bounce text-orange-600 font-bold text-sm"><Flame size={18} /> {combo} COMBO</div>}
            <button aria-label={isEn ? 'Choose a stage' : '단계 선택'} onClick={() => setPhase("select")} className="p-3 hover:bg-surface-low rounded-2xl transition-colors text-zinc-300 hover:text-primary"><RotateCcw size={22} /></button>
        </div>
      </div>

      {phase === "transition" ? (
        <div className="flex flex-col items-center justify-center py-20 animate-in zoom-in duration-500 w-full">
            <div className="glass-card p-8 md:p-16 text-center max-w-lg w-full">
                <CheckCircle2 className="w-24 h-24 text-green-500 mx-auto mb-8" />
                <h2 className="headline-md mb-4">{t("자판 마스터!")}</h2>
                <p className="text-zinc-500 mb-12 font-medium leading-relaxed">{t("자판 위치를 익혔습니다.")} <br/>{t("이제 이 글자들로 이루어진 낱말을 쳐보세요!")}</p>
                <button onClick={() => { setPhase("words"); resetProgress(); setInputValue(""); setTimeout(() => hiddenInputRef.current?.focus(), 100); }} className="w-full py-6 primary-gradient text-white font-bold rounded-full hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-xl shadow-primary/20">{t("2단계: 낱말 연습 시작")} <ArrowRight size={20} /></button>
            </div>
        </div>
      ) : phase === "result" ? (
        <div className="flex flex-col items-center justify-center animate-in zoom-in duration-500 w-full max-w-xl text-center">
            <div className="glass-card p-8 md:p-16 w-full">
                <div className="inline-flex p-8 bg-yellow-50 rounded-full mb-10"><Trophy className="w-24 h-24 text-yellow-500" /></div>
                <h2 className="display-lg !text-3xl md:!text-5xl mb-4">{t("과정 완료!")}</h2>
                <p className="text-zinc-400 font-bold mb-12">{(isEn ? STEP_LABELS[selectedStep?.id || '']?.title : selectedStep?.title)}{isEn ? ' completed.' : ' 연습을 모두 마쳤습니다.'}</p>
                <div className="grid grid-cols-2 gap-6 mb-12">
                    <div className="bg-surface-low p-5 sm:p-8 rounded-2xl"><p className="text-xs font-bold text-zinc-500 mb-3">{t("첫 입력 정확도")}</p><p className="text-4xl font-bold text-primary">{report?.accuracy}%</p></div>
                    <div className="bg-surface-low p-8 rounded-2xl"><p className="text-[10px] font-bold text-zinc-400 uppercase mb-3 tracking-widest">{t("평균 타수")}</p><p className="text-4xl font-bold text-green-600">{report?.kpm}{isEn ? "" : "타"}</p></div>
                </div>
                <p className="text-sm text-zinc-600 mb-6">{isEn ? 'Accuracy counts words completed without corrections. Words corrected: ' : '오타 없이 완성한 낱말의 비율입니다. 수정한 낱말은 '}{shuffledWords.length - Math.round(shuffledWords.length * (report?.accuracy || 0) / 100)}{isEn ? '' : '개예요.'}</p>
                <button onClick={() => { setPhase("select"); track('activity_next', { mode: 'word', destination: 'step_select' }); }} className="w-full py-6 bg-on-surface text-white font-bold rounded-full hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-on-surface/10">{t("단계 선택으로 돌아가기")}</button>
                {/* 코어 출구 — 자리를 뗐으면 지식을 손으로 */}
                <Link href={isEn ? href('/practice/short') : '/journey'} prefetch={false} className="mt-5 block text-sm font-bold text-zinc-500 hover:text-primary transition-colors">
                  {isEn ? 'Next: practice Korean sentences →' : '자리는 익혔으니, 이제 외우면서 쳐볼까요? — 지식타자 →'}
                </Link>
            </div>
        </div>
      ) : (
        <>
          <div className={`w-full max-w-4xl bg-surface-lowest rounded-2xl md:rounded-2xl shadow-[0_40px_80px_rgba(21,28,39,0.08)] p-8 pt-12 md:p-20 mb-4 md:mb-16 text-center transition-all duration-500 relative overflow-hidden ${wrongKey ? 'animate-shake' : ''}`}>
              {/* Background Accent */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl -ml-32 -mb-32" />

              <div className="absolute top-4 md:top-10 left-1/2 -translate-x-1/2 flex items-center gap-3 text-[10px] font-bold text-zinc-300 uppercase tracking-[0.4em] whitespace-nowrap">
                  <Sparkles size={14} /> {phase === "keys" ? "Target Key" : "Target Word"} <Sparkles size={14} />
              </div>

              <div className="flex flex-col items-center relative z-10">
                  <h2 className={`font-plus-jakarta font-bold leading-none transition-all duration-300 ${wrongKey ? 'text-red-500 scale-95' : 'text-on-surface scale-100'} ${phase === "keys" ? 'text-8xl md:text-[12rem]' : 'text-5xl sm:text-7xl md:text-9xl'}`}>
                      {targetDisplay}
                  </h2>

                  {phase === "words" && (
                    <div className="mt-6 md:mt-16 flex flex-col items-center w-full max-w-lg">
                        <div className="text-2xl md:text-4xl font-bold text-primary mb-4 md:mb-6 h-10 md:h-12 flex items-center justify-center">
                            {inputValue}
                            <span className="w-1.5 h-10 bg-tertiary ml-2 rounded-full animate-pulse shadow-[0_0_15px_rgba(120,75,0,0.3)]"></span>
                        </div>
                        <div className="flex justify-center gap-2 w-full">
                            {targetDisplay.split('').map((_, i) => (
                                <div key={i} className={`flex-1 h-2.5 rounded-full transition-all duration-500 ${i < inputValue.length ? 'bg-primary shadow-[0_0_15px_rgba(0,74,198,0.3)]' : 'bg-surface-high'}`} />
                            ))}
                        </div>
                    </div>
                  )}
              </div>
          </div>

          <div className="w-full max-w-5xl p-3 md:p-12 bg-surface-high/50 rounded-2xl md:rounded-2xl backdrop-blur-sm">
              <div className="flex flex-col gap-1.5 md:gap-4">
                  {KBD_ROWS.map((row, rIdx) => (
                      <div key={rIdx} className={`flex justify-center gap-1 md:gap-3 ${rIdx === 1 ? 'ml-3 md:ml-10' : rIdx === 2 ? 'ml-6 md:ml-20' : ''}`}>
                          {row.keys.map((key) => {
                              const isTarget = currentTargetChar === key;
                              const isActive = activeKey === key;
                              const isWrong = wrongKey === key && activeKey === key;
                              
                              let keyStyle = "bg-surface-lowest text-zinc-300 shadow-sm";
                              if (isTarget) keyStyle = "bg-surface-lowest text-primary shadow-[0_0_20px_rgba(0,74,198,0.15)] ring-4 ring-primary/10 scale-110 z-10 animate-pulse !text-primary";
                              if (isActive && isTarget) keyStyle = "primary-gradient text-white scale-105 z-20 shadow-primary/40 shadow-lg";
                              if (isWrong) keyStyle = "bg-red-500 text-white scale-110 z-30 shadow-red-500/50 shadow-lg animate-shake";
                              if (isActive && !isTarget) keyStyle = "bg-on-surface text-white scale-95 opacity-100 shadow-md";

                              return (
                                  <div key={key} className={`w-7 h-10 sm:w-14 sm:h-14 md:w-20 md:h-20 rounded-md sm:rounded-2xl flex items-center justify-center text-sm sm:text-xl md:text-3xl font-plus-jakarta font-bold transition-all duration-200 ${keyStyle}`}>{key}</div>
                              );
                          })}
                      </div>
                  ))}
              </div>
          </div>
        </>
      )}
    </div>
  );
};
