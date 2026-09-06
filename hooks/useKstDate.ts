'use client';

import { useSyncExternalStore } from 'react';
import { getKstDateString } from '@/lib/kst-date';

function subscribe(onChange: () => void) {
  const interval = window.setInterval(onChange, 60000);
  window.addEventListener('focus', onChange);
  document.addEventListener('visibilitychange', onChange);
  return () => {
    window.clearInterval(interval);
    window.removeEventListener('focus', onChange);
    document.removeEventListener('visibilitychange', onChange);
  };
}

export function useKstDate(): string {
  return useSyncExternalStore(subscribe, getKstDateString, () => '');
}
