'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { prepareDaily, type DailyState } from '@/lib/daily-journey';
import { dailyStorageKey, loadDailyState, saveDailyState } from '@/lib/daily-journey-storage';
import { hasDailyWork, mergeDailyStates, syncDailyState } from '@/lib/daily-journey-sync';
import { dailyRepository } from '@/lib/daily-journey-repository';

export function useDailyProgress(userId: string | null) {
  const [state, setState] = useState(() => loadDailyState(new Date(), userId));
  const [saved, setSaved] = useState(true);
  const [cloud, setCloud] = useState<'loading' | 'saved' | 'pending' | 'error'>(userId ? 'loading' : 'saved');
  const [loading, setLoading] = useState(Boolean(userId));
  const [imported, setImported] = useState(() => {
    if (!userId) return false;
    try { return localStorage.getItem(`${dailyStorageKey(userId)}:guest-copy`) === localStorage.getItem(dailyStorageKey(null)); }
    catch { return false; }
  });
  const [guest] = useState(() => userId ? loadDailyState() : null);
  const stateRef = useRef(state);
  const controller = useRef<AbortController | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const running = useRef(false);
  const pending = useRef(false);

  const update = useCallback((next: DailyState) => {
    stateRef.current = next;
    setState(next);
    setSaved(saveDailyState(next, userId));
  }, [userId]);

  const synchronize = useCallback(async () => {
    if (!userId || !controller.current || controller.current.signal.aborted) return;
    if (running.current) { pending.current = true; return; }
    running.current = true;
    const lifetime = controller.current.signal;
    setCloud('pending');
    try {
      do {
        pending.current = false;
        const signal = AbortSignal.any([lifetime, AbortSignal.timeout(10000)]);
        const remote = await syncDailyState(stateRef.current, dailyRepository(userId, signal));
        if (lifetime.aborted) return;
        const current = stateRef.current;
        const next = prepareDaily(mergeDailyStates(current, remote));
        if (next.session && current.session && next.session.date === current.session.date
          && next.session.questionIds[next.session.answers.length] === current.session.questionIds[current.session.answers.length]) {
          next.session = { ...next.session, input: current.session.input };
        }
        update(next);
      } while (pending.current);
      setCloud('saved');
    } catch {
      if (!lifetime.aborted) setCloud('error');
    } finally {
      running.current = false;
      if (!lifetime.aborted) setLoading(false);
    }
  }, [userId, update]);

  useEffect(() => {
    controller.current = new AbortController();
    // A deferred start survives React's development effect replay without sharing a cancelled request.
    const start = setTimeout(() => { void synchronize(); }, 0);
    return () => {
      clearTimeout(start);
      if (timer.current) clearTimeout(timer.current);
      controller.current?.abort();
    };
  }, [synchronize]);

  function checkpoint(next: DailyState) {
    update(next);
    if (!userId) return;
    setCloud('pending');
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => { void synchronize(); }, 750);
  }

  function importGuest() {
    if (!guest || !userId) return;
    const next = prepareDaily(mergeDailyStates(stateRef.current, guest));
    checkpoint(next);
    if (saveDailyState(next, userId)) {
      try {
        const original = localStorage.getItem(dailyStorageKey(null));
        if (original) localStorage.setItem(`${dailyStorageKey(userId)}:guest-copy`, original);
      } catch { /* The original guest record remains available if the copy receipt cannot be stored. */ }
    }
    setImported(true);
  }

  return { state, stateRef, saved, cloud, loading, update, checkpoint, synchronize, importGuest,
    canImport: Boolean(guest && hasDailyWork(guest) && !imported) };
}
