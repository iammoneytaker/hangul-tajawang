'use client';

import { useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, Lightbulb, RotateCcw } from 'lucide-react';
import { useKstDate } from '@/hooks/useKstDate';
import { answerDaily, currentDailyQuestion, DAILY_QUESTIONS, hintDaily, type DailyState } from '@/lib/daily-journey';
import { useDailyAccount } from '@/hooks/useDailyAccount';
import { useDailyProgress } from '@/hooks/useDailyProgress';
import { DailyQuestionVisual } from './DailyQuestionVisual';
import { track } from '@/lib/analytics';

export function DailyJourney() {
  const date = useKstDate();
  const userId = useDailyAccount();
  return date && userId !== undefined ? <DailyExercise key={`${date}:${userId || 'guest'}`} userId={userId} /> : <p className="py-16 text-center text-secondary" role="status">오늘의 문제를 준비하고 있어요.</p>;
}

function DailyExercise({ userId }: { userId: string | null }) {
  const { state, stateRef, saved, cloud, loading, update, checkpoint, synchronize, importGuest, canImport } = useDailyProgress(userId);
  const [feedback, setFeedback] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const questionRef = useRef<HTMLElement>(null);
  const session = state.session;
  const question = currentDailyQuestion(state);

  function begin(next: DailyState): DailyState {
    if (!next.session || next.session.startedAt) return next;
    track('daily_start', { date: next.session.date });
    return { ...next, session: { ...next.session, startedAt: new Date().toISOString() } };
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const previous = stateRef.current;
    if (!previous.session?.input.trim() || previous.session.completedAt) return;
    const next = answerDaily(begin(previous));
    const correct = (next.session?.answers.length || 0) > previous.session.answers.length;
    checkpoint(next);
    setFeedback(correct ? '정답이에요! 다음 문제도 떠올려 보세요.' : '아직 정답이 아니에요. 다시 입력하거나 힌트를 확인해 보세요.');
    if (next.session?.completedAt) {
      track('daily_complete', { date: next.session.date, questions: next.session.answers.length,
        independent: next.session.answers.filter(a => a.independent).length,
        hints: next.session.answers.filter(a => a.hintUsed).length });
    } else if (correct) requestAnimationFrame(() => {
      questionRef.current?.scrollIntoView({ block: 'start' });
      inputRef.current?.focus({ preventScroll: true });
    });
  }

  if (loading) return <p className="py-12 text-center text-secondary" role="status">내 계정의 학습 기록을 확인하고 있어요.</p>;
  if (!session) return null;
  const completed = Boolean(session.completedAt);
  const independent = session.answers.filter(a => a.independent).length;
  const needsReview = session.answers.filter(a => !a.independent).length;

  return (
    <div>
      <div className="mt-6 mb-6">
        <p className="text-xs font-semibold tracking-widest text-primary mb-2">{session.date} · 하루 다섯 문제</p>
        {completed && <h2 className="text-2xl font-bold">오늘의 다섯 문제 완료!</h2>}
      </div>
      <div className="flex gap-2 mb-6" role="progressbar" aria-label="오늘의 문제 진행" aria-valuemin={0} aria-valuemax={5} aria-valuenow={session.answers.length}>
        {session.questionIds.map((id, i) => <span key={id} className={`h-2 flex-1 rounded-full ${i < session.answers.length ? 'bg-primary' : 'bg-surface-high'}`} />)}
      </div>
      {completed ? (
        <section className="rounded-2xl border border-outline-variant bg-surface-lowest p-5 sm:p-8" aria-label="오늘의 학습 결과">
          <div className="flex items-center gap-3 mb-6"><Check className="text-primary" size={30} /><p className="text-xl font-bold">혼자서 정확히 맞힌 문제 <span className="text-primary">{independent}/5</span></p></div>
          <ul className="divide-y divide-outline-variant">
            {session.answers.map(answer => {
              const q = DAILY_QUESTIONS.find(item => item.id === answer.id);
              if (!q) return null;
              return <li key={answer.id} className="py-4">
                <div className="flex flex-wrap justify-between gap-2 text-xs mb-2"><span className="text-secondary">{q.category}</span><span className={answer.independent ? 'text-primary' : 'text-amber-700'}>{answer.independent ? '혼자 맞혔어요' : answer.hintUsed ? '힌트를 보고 익혔어요' : '다시 시도해서 맞혔어요'}</span></div>
                <p className="font-semibold">{q.prompt} <span className="text-primary">{q.answer}</span></p>
                <p className="text-sm text-secondary mt-1 leading-relaxed">{q.detail}</p>
              </li>;
            })}
          </ul>
          <p className="bg-surface-low rounded-xl p-4 text-sm leading-relaxed mt-4">{needsReview > 0 ? `${needsReview}문제는 내일 복습에 먼저 나와요. 혼자 맞힌 문제는 간격을 두고 다시 만나게 됩니다.` : '다섯 문제 모두 혼자 맞혔어요. 오늘 배운 문제는 3일 이상 간격을 두고 복습합니다.'}</p>
          <Link href="/journey" prefetch={false} className="flex items-center justify-center gap-2 mt-5 rounded-xl bg-primary py-4 font-bold text-white">다른 지식도 배워보기 <ArrowRight size={18} /></Link>
          <Link href="/" prefetch={false} className="block mt-4 text-center text-sm font-semibold text-secondary">홈으로 돌아가기</Link>
        </section>
      ) : question ? (
        <section ref={questionRef} className="scroll-mt-24 rounded-2xl border border-outline-variant bg-surface-lowest p-5 sm:p-8">
          <div className="flex items-center justify-between text-sm text-secondary mb-6"><span>{question.category}{state.reviews[question.id]?.dueDate <= session.date ? ' · 복습 문제' : ''}</span><span>{session.answers.length + 1} / 5</span></div>
          <DailyQuestionVisual question={question} />
          <h2 className="text-2xl sm:text-3xl font-bold leading-relaxed break-keep mb-6">{question.prompt}</h2>
          <form onSubmit={submit}>
            <label htmlFor="daily-answer" className="block text-sm font-semibold mb-2">정답을 입력하세요</label>
            <input id="daily-answer" data-typing-input ref={inputRef} value={session.input} autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
              maxLength={100} aria-describedby="daily-feedback"
              onKeyDown={event => { if (event.key === 'Enter' && (event.nativeEvent.isComposing || event.keyCode === 229)) event.preventDefault(); }}
              onChange={event => {
                const previous = stateRef.current;
                if (!previous.session || previous.session.completedAt) return;
                const next = { ...previous, session: { ...previous.session, input: event.target.value, updatedAt: new Date().toISOString() } };
                update(event.target.value ? begin(next) : next);
                setFeedback('');
              }} className="w-full rounded-xl border-2 border-outline-variant bg-surface px-4 py-4 text-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
            <div className="flex gap-3 mt-4">
              <button type="button" disabled={session.hintUsed} onClick={() => {
                checkpoint(hintDaily(begin(stateRef.current)));
                track('daily_hint', { question: question.id, date: session.date });
                inputRef.current?.focus({ preventScroll: true });
              }} className="flex items-center justify-center gap-2 rounded-xl border border-outline-variant px-4 py-3 font-semibold disabled:opacity-50"><Lightbulb size={18} /> 힌트</button>
              <button type="submit" disabled={!session.input.trim()} className="flex-1 rounded-xl bg-primary py-3 font-bold text-white disabled:opacity-40">정답 확인</button>
            </div>
          </form>
          {session.hintUsed && <p className="mt-4 rounded-xl bg-amber-50 p-4 text-amber-900 text-sm">정답은 <strong>{question.answer}</strong>입니다. 직접 입력하며 익혀 보세요.</p>}
          <p id="daily-feedback" role="status" className="min-h-12 mt-4 text-sm text-secondary leading-relaxed">{feedback || (session.mistaken ? '다시 떠올려 보세요. 틀려도 괜찮아요.' : '입력 후 Enter 또는 정답 확인을 눌러주세요.')}</p>
        </section>
      ) : null}
      <p className="flex items-center justify-center gap-2 mt-5 text-xs text-secondary leading-relaxed" role="status"><RotateCcw size={13} className="shrink-0" />{!saved ? '브라우저 저장이 차단되어 있어요. 이 창에서는 계속 풀 수 있습니다.' : !userId ? '비로그인 기록은 이 브라우저에 저장됩니다.' : cloud === 'error' ? '계정 동기화에 실패했어요. 이 브라우저에는 저장했습니다.' : cloud === 'pending' ? '풀이 기록을 계정에 저장하고 있어요.' : '풀이·복습 기록은 계정에, 입력 중인 글자는 이 브라우저에 저장됩니다.'}</p>
      {userId && cloud === 'error' && <button type="button" onClick={() => { void synchronize(); }} className="block mx-auto mt-3 text-sm font-semibold text-primary underline underline-offset-4">계정 동기화 다시 시도</button>}
      {canImport && <aside className="mt-5 rounded-xl border border-outline-variant p-4 text-sm">
        <p className="text-secondary leading-relaxed">이 브라우저에 비로그인 학습 기록이 있습니다. 공용 기기라면 본인의 기록인지 확인해 주세요. 원본은 그대로 보관합니다.</p>
        <button type="button" onClick={importGuest} className="mt-3 font-bold text-primary underline underline-offset-4">비로그인 기록을 내 계정으로 가져오기</button>
      </aside>}
    </div>
  );
}
