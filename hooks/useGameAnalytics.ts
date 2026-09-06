'use client';

import { useEffect, useRef } from 'react';
import { track } from '@/lib/analytics';

export function useGameAnalytics(mode: string, state: 'ready' | 'playing' | 'gameover' | 'finished') {
  const previous = useRef(state);
  useEffect(() => {
    if (state === 'playing' && previous.current !== 'playing') track('game_start', { mode });
    if ((state === 'gameover' || state === 'finished') && previous.current === 'playing') track('game_complete', { mode });
    previous.current = state;
  }, [mode, state]);
}
